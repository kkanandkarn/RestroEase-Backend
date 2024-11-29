const moment = require("moment-timezone");

function formatDateTime(dateTime) {
  return moment(dateTime).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
}
module.exports = {
  formatDateTime,
};
