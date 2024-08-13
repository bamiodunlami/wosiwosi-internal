const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const admin = require(appRoot + "/controller/admin.controller.js");

router
.get("/admin", admin.adminDashboard) //render admin dashboard
.get("/admin/:operation", admin.adminOperation) //take care of admin operation

.post('/change-duty', admin.changeDuty) // change staff duty

.get("/order", admin.renderOrderListPage) //main order page
.post('/saveorder', admin.saveAllForProcessing)//save order to process

.get('/remove-from-order', admin.removeFromOrder) //remove order from processing list
.get('/reset-worker', admin.resetWorker)
.post('/assign-staff-to-order', admin.assignStaffToOrder)
.post("/createinfluencer", admin.createInfluencer) //create influencer
.get('/undo-order', admin.undoOrder) //undo order completion
.get('/get-refund-request', admin.RenderRefundRequest) //render refund page
.get('/request/:option', admin.requestOption) //refund option
.get('/replacement', admin.renderReplacementPage) //render replacement
.get('/admin-notification', admin.renderNotificationPage) //render note notification page
.get('/fetch-notification', admin.ajaxGetNotification) //
.get('/mark-as-read', admin.markAsRead)
.get('/fetch-refund', admin.ajaxGetRefundNotification)


module.exports = router;
