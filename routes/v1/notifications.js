const express = require("express");
const { dispatcher } = require("../../middleware");
const { PERMISSIONS } = require("../../utils/constant");
const {
  getNotificationsController,
  insertFcmTokenController,
  removeFcmTokenController,
  getUnreadNotificationsController,
} = require("../../controllers/v1");
const router = express.Router();

router.post("/view-notifications", (req, res, next) => {
  dispatcher(req, res, next, getNotificationsController);
});
router.post("/view-unread-notifications", (req, res, next) => {
  dispatcher(req, res, next, getUnreadNotificationsController);
});
router.post("/insert-fcm-token", (req, res, next) => {
  dispatcher(req, res, next, insertFcmTokenController);
});
router.put("/remove-fcm-token", (req, res, next) => {
  dispatcher(req, res, next, removeFcmTokenController);
});
module.exports = router;
