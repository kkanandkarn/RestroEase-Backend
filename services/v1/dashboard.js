const { ErrorHandler } = require("../../helper/error-handler");
const { SERVER_ERROR } = require("../../helper/status-codes");
const { billing, category } = require("../../models");
const { SERVER_ERROR_MSG } = require("../../utils/constant");
const { formatDateTime } = require("../../utils/time-format");

const adminDashboard = async (req) => {
  try {
    const tenantId = req.user.tenantId;
    const data = {
      tenantId: tenantId,
    };
    const searchFilter = {
      tenantId: tenantId,
      paymentStatus: "Paid",
      status: { $ne: "Deleted" },
    };

    const bills = await billing.find(searchFilter);
    const totalIncome = bills.reduce((acc, bill) => acc + bill.totalAmount, 0);
    data.totalIncome = totalIncome;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set to start of the day
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999); // Set to end of the day

    // Filter bills to get only those created today
    const todaysBills = bills.filter((bill) => {
      const createdAt = new Date(bill.createdAt); // Convert to Date object
      return createdAt >= todayStart && createdAt <= todayEnd;
    });

    const todayIncome = todaysBills.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0
    );

    data.todayIncome = todayIncome;

    data.salesDataLabels = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const salesData = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    bills.forEach((bill) => {
      const createdAt = new Date(bill.createdAt);
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth();

      if (year === currentYear) {
        salesData[month] += bill.totalAmount;
      }
    });

    data.salesData = salesData;
    const categories = await category.find({
      tenantId: tenantId,
      status: { $ne: "Deleted" },
    });

    const categoryNames = categories.map((category) => category.category);

    // Initialize a dictionary to track total sales per category
    const categorySales = categoryNames.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    // Loop through the bills and sum totalAmount by category
    bills.forEach((bill) => {
      bill.products.forEach((product) => {
        if (
          product.category &&
          categorySales.hasOwnProperty(product.category)
        ) {
          categorySales[product.category] += bill.totalAmount;
        }
      });
    });

    // Create an array of categories and their total sales
    const categoryData = Object.keys(categorySales).map((category) => ({
      category,
      totalSales: categorySales[category],
    }));

    // Sort the categories by total sales in descending order
    categoryData.sort((a, b) => b.totalSales - a.totalSales);

    // Extract the top 5 categories
    const topCategories = categoryData.slice(0, 5);
    const otherCategoryTotal = categoryData
      .slice(5)
      .reduce((acc, category) => acc + category.totalSales, 0);

    // Prepare the data for the chart
    const categoryDataLabels = topCategories.map(
      (category) => category.category
    );
    const categoryDataValues = topCategories.map(
      (category) => category.totalSales
    );

    // If there are other categories, add them as "Other"
    if (otherCategoryTotal > 0) {
      categoryDataLabels.push("Other");
      categoryDataValues.push(otherCategoryTotal);
    }

    // Assign the results to the data object
    data.categoryDataLabels = categoryDataLabels;
    data.categoryData = categoryDataValues;
    data.categoryBackgroundColors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
    ];
    let recentBills = await billing
      .find(searchFilter)
      .select("-tenantId -createdBy -updatedBy -status")
      .sort([["updatedAt", -1]])
      .limit(10);
    recentBills = recentBills.map((bill) => ({
      ...bill.toObject(),
      createdAt: formatDateTime(bill.createdAt),
    }));
    data.recentBills = recentBills;
    return data;
  } catch (error) {
    if (error.statusCode) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
    console.log(error);
    throw new ErrorHandler(SERVER_ERROR, SERVER_ERROR_MSG);
  }
};
module.exports = {
  adminDashboard,
};
