const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const { ErrorHandler } = require("../helper/error-handler");
const {
  SERVER_ERROR,
  BAD_GATEWAY,
  NOT_FOUND,
} = require("../helper/status-codes");
const { SERVER_ERROR_MSG } = require("./constant");
const { products, tenants, billing } = require("../models");
const { formatDateTime } = require("./time-format");
const cloudinary = require("cloudinary").v2;
const puppeteer = require("puppeteer");

async function convertToExcel(headers, data, fileName, tenantId) {
  try {
    let filePath = path.join(__dirname, `../public/files`);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {
        recursive: true,
      });
    }
    const workbook = xlsx.utils.book_new();
    const worksheetData = [];

    const headerRow = headers.map((header) => header["label"]);
    worksheetData.push(headerRow);

    data.forEach((item) => {
      const row = headers.map((header) => item[header["key"]] || "");
      worksheetData.push(row);
    });

    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const outputPath = path.join(filePath, fileName);

    xlsx.writeFile(workbook, outputPath);

    console.log(`Excel file saved to ${filePath}`);

    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      folder: "inventory",
      public_id: `Product_Report_${tenantId}`,
      overwrite: true,
    });
    fs.unlinkSync(outputPath);

    return result.secure_url;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function generateInventoryPdf(tenantId) {
  try {
    const tenant = await tenants.findOne({
      _id: tenantId,
      status: { $ne: "Deleted" },
    });
    const searchFilter = {
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    };
    let Products = await products
      .find(searchFilter)
      .populate("category", "_id category")
      .select(
        "_id productName productDesc price category image type status createdAt updatedAt"
      )
      .sort([["productName", 1]]);
    if (!Products.length) {
      throw new ErrorHandler(NOT_FOUND, "No products found for report");
    }

    Products = Products.map((product) => ({
      ...product.toObject(),
      price: `\u20B9 ${product.price}`,
      category: product.category.category,
      createdAt: formatDateTime(product.createdAt),
    }));

    const data = {
      tenantLogo: tenant.tenantLogo,
      tenantName: tenant.tenantName,
      products: Products,
    };
    const templatePath = path.join(
      __dirname,
      "../templates/inventory-template.ejs"
    );

    let outputDir = path.join(__dirname, `../public/files`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }
    const htmlContent = await ejs.renderFile(templatePath, data);
    const fileName = `Product_Report_${tenantId}.pdf`;

    const outputPath = path.join(outputDir, fileName);
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      width: "80mm",
      height: "auto",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "0mm",
        bottom: "10mm",
        left: "0mm",
      },
    });
    await browser.close();

    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      folder: "inventory",
      public_id: `Product_Report_${tenantId}`,
      overwrite: true,
    });
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return result.secure_url;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function generateBillExcel(bills, tenantId) {
  try {
    // Create an array for the sheet data
    const sheetData = [];

    // Push headers to the sheet data
    sheetData.push([
      "S. No.",
      "Bill ID",
      "Customer Name",
      "Contact",
      "Address",
      "Payment Method",
      "Service",
      "Table Number",
      "Waiter",
      "Sub Total",
      "CGST%",
      "CGST Amount",
      "SGST%",
      "SGST Amount",
      "Round Off",
      "Total Amount",
      "Payment Status",
    ]);

    // Loop through each bill and convert it into a row
    bills.forEach((bill, index) => {
      // Push bill data to the sheet
      sheetData.push([
        index + 1,
        String(bill._id),
        bill.customerName,
        bill.customerContact,
        bill.customerAddress,
        bill.paymentMethod,
        bill.service,
        bill.tableNumber || "N/A",
        bill.waiter || "N/A",
        `\u20B9 ${bill.subTotal}`,
        `${bill.cgstPercentage} %`,
        `\u20B9 ${bill.cgstAmount}`,
        `${bill.sgstPercentage} %`,
        `\u20B9 ${bill.sgstAmount}`,
        `\u20B9 ${bill.isRoundPositive ? "+" : "-"} ${bill.roundOff}`,
        `\u20B9 ${bill.totalAmount}`,
        bill.paymentStatus,
      ]);
    });

    // Create a new workbook
    const wb = xlsx.utils.book_new();
    // Create a sheet from the sheet data
    const ws = xlsx.utils.aoa_to_sheet(sheetData);
    // Append the sheet to the workbook
    xlsx.utils.book_append_sheet(wb, ws, "Bills");

    // Write the workbook to file
    let outputDir = path.join(__dirname, `../public/files`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }
    const fileName = `Bill_Report_${tenantId}.xlsx`;
    const outputPath = path.join(outputDir, fileName);
    xlsx.writeFile(wb, outputPath);

    console.log("Excel file created at", outputPath);
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      folder: "bills",
      public_id: `Bill_Report_${tenantId}`,
      overwrite: true,
    });
    fs.unlinkSync(outputPath);

    return result.secure_url;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

async function generateBillReportPdf(bills, tenantId) {
  try {
    const tenant = await tenants.findOne({
      _id: tenantId,
      status: { $ne: "Deleted" },
    });

    const data = {
      tenantLogo: tenant.tenantLogo,
      tenantName: tenant.tenantName,
      bills: bills,
    };
    const templatePath = path.join(
      __dirname,
      "../templates/bill-report-template.ejs"
    );

    let outputDir = path.join(__dirname, `../public/files`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }
    const htmlContent = await ejs.renderFile(templatePath, data);
    const fileName = `Bill_Report_${tenantId}.pdf`;

    const outputPath = path.join(outputDir, fileName);
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      width: "80mm",
      height: "auto",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "5mm",
        bottom: "10mm",
        left: "5mm",
      },
    });
    await browser.close();

    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      folder: "inventory",
      public_id: `Product_Report_${tenantId}`,
      overwrite: true,
    });
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    return result.secure_url;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
}

module.exports = {
  convertToExcel,
  generateInventoryPdf,
  generateBillExcel,
  generateBillReportPdf,
};
