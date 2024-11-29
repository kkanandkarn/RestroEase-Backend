const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR, NOT_FOUND } = require("../../helper/status-codes");
const { billing, tenants } = require("../../models");
const { SERVER_ERROR_MSG } = require("../../utils/constant");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { formatDateTime } = require("../../utils/time-format");
const cloudinary = require("cloudinary").v2;
const XLSX = require("xlsx");
const {
  generateBillExcel,
  generateBillReportPdf,
} = require("../../utils/export-data");

const getBills = async (req) => {
  try {
    const tenantId = req.user.tenantId;

    const {
      search,
      filters = [],
      page = 1,
      limit = 10,
      totalAmountRange = null,
      createdAtRange = null,
      exportFlag = false,
      exportType = "excel",
    } = req.body;
    const searchFilter = {
      tenantId: tenantId,
      paymentStatus: "Paid",
      status: { $ne: "Deleted" },
    };

    const billReport = await billing.find(searchFilter);

    if (exportFlag && !billReport.length) {
      throw new ErrorHandler(NOT_FOUND, "No bills found for report.");
    }

    if (exportFlag && exportType === "excel") {
      const reportUrl = await generateBillExcel(billReport, tenantId);
      return reportUrl;
    }
    if (exportFlag && exportType === "pdf") {
      const reportUrl = await generateBillReportPdf(billReport, tenantId);
      return reportUrl;
    }

    if (search) {
      searchFilter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerContact: { $regex: search, $options: "i" } },
      ];

      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        searchFilter.$or.push({ _id: search });
      }
    }
    if (filters.length) {
      filters.forEach((filter) => {
        if (filter.paymentMethod) {
          searchFilter.paymentMethod = filter.paymentMethod;
        }
        if (filter.service) {
          searchFilter.service = filter.service;
        }
      });
    }

    if (totalAmountRange && Object.keys(totalAmountRange).length > 0) {
      if (totalAmountRange.min) {
        searchFilter.totalAmount = {
          $gte: totalAmountRange.min,
        };
      }
      if (totalAmountRange.max) {
        searchFilter.totalAmount = {
          $lte: totalAmountRange.max,
        };
      }
    }

    if (createdAtRange && Object.keys(createdAtRange).length > 0) {
      searchFilter.createdAt = {};

      if (createdAtRange.start) {
        const startDate = new Date(createdAtRange.start);
        startDate.setUTCHours(0, 0, 0, 0);
        searchFilter.createdAt.$gte = startDate;
      }

      if (createdAtRange.end) {
        const endDate = new Date(createdAtRange.end);
        endDate.setUTCHours(23, 59, 59, 999);
        searchFilter.createdAt.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const bills = await billing
      .find(searchFilter)
      .select("-tenantId -createdBy -updatedBy -status")
      .sort([["updatedAt", -1]])
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await billing.countDocuments(searchFilter);

    return { bills: bills, totalCount: totalCount };
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

const getBillById = async (req) => {
  try {
    const { id, exportFlag = false } = req.body;
    const tenantId = req.user.tenantId;
    const tenant = await tenants
      .findOne({ _id: tenantId })
      .select("tenantName tenantLogo");

    const bill = await billing
      .findOne({
        _id: id,
        paymentStatus: "Paid",
        tenantId: tenantId,
        status: { $ne: "Deleted" },
      })
      .select("-tenantId -createdBy -updatedBy -status")
      .sort([["updatedAt", -1]]);

    if (exportFlag) {
      if (bill.billUrl) {
        return bill.billUrl;
      }
      const fileUrl = await generateBillPdf(tenant, bill);
      return fileUrl;
    }

    return bill;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};

async function generateBillPdf(tenant, bill) {
  try {
    const data = {
      tenantLogo: tenant.tenantLogo,
      tenantName: tenant.tenantName,
      customerName: bill.customerName,
      customerContact: bill.customerContact,
      billId: bill._id,
      date: formatDateTime(bill.createdAt),
      products: bill.products,
      subTotal: bill.subTotal,
      cgstPercentage: bill.cgstPercentage,
      cgstAmount: bill.cgstAmount,
      sgstPercentage: bill.sgstPercentage,
      sgstAmount: bill.sgstAmount,
      isRoundPositive: bill.isRoundPositive,
      roundOff: bill.roundOff,
      totalAmount: bill.totalAmount,
    };
    const templatePath = path.join(
      __dirname,
      "../../templates/bill-template.ejs"
    );
    let outputDir = path.join(__dirname, `../../public/bills`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }
    const htmlContent = await ejs.renderFile(templatePath, data);
    const billName = `bill-${tenant._id}.pdf`;

    const outputPath = path.join(outputDir, billName);
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
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });
    await browser.close();

    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      folder: "bills",
      public_id: `bill_${bill._id}`,
      overwrite: true,
    });
    fs.unlinkSync(outputPath);

    const filter = { _id: bill._id, tenantId: tenant._id };
    const update = {
      billUrl: result.secure_url,
      updatedAt: new Date(),
    };

    await billing.findOneAndUpdate(filter, update);

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
  getBills,
  getBillById,
};
