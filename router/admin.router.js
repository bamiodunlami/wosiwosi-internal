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

.get('/searchsingleorder', admin.searchSingleOrder) //search for order number
.get("/order", admin.renderOrderListPage) //main order page
.get('/singleorder', admin.singleOrderPage) //get single order 
.get('/ordersaved', admin.retrieveSavedForProcessing) // (Ajax call from order.js) this is used to check and thick orders that are already saved for processing
.post('/saveorder', admin.saveAllForProcessing)//save order to process

// .get('/add-to-order', admin.addToOrder)
.get('/clearboard', admin.clearBoard) //clear all already save order to process
.get('/remove-from-order', admin.removeFromOrder) //remove order from processing list
.post("/createinfluencer", admin.createInfluencer) //create influencer

// Staffs

module.exports = router;
