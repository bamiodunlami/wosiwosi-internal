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

.get("/order", admin.renderOrderListPage) //main order page
.get('/ordersaved', admin.retrieveSavedForProcessing) // (Ajax call from order.js) this is used to check and thick orders that are already saved for processing
.post('/saveorder', admin.saveAllForProcessing)//save order to process

.get('/clearboard', admin.clearBoard) //clear all already save order to process
.get('/remove-from-order', admin.removeFromOrder) //remove order from processing list
.post("/createinfluencer", admin.createInfluencer) //create influencer
.get('/undo-order', admin.undoOrder) //undo order completion
.get('/get-refund-request', admin.RenderRefundRequest) //render refund page
.get('/request/:option', admin.requestOption) //refund option
.get('/replacement', admin.renderReplacementPage) //render replacement
.get('/admin-notification', admin.renderNotificationPage)
.get('/fetch-notification', admin.ajaxGetNotification)


module.exports = router;
