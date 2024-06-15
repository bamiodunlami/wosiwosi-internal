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
.get("/order", admin.renderOrderPage) //main order page
.get('/singleorder', admin.singleOrder) //get single order 
.get('/ordersaved', admin.retrieveSavedForProcessing) //get order saved for processing, send to frontend to determine what's already sent for processing
.post('/saveorder', admin.saveAllForProcessing)
.get('/processingorder', admin.orderAvailableToProcess)
.get('/searchsingleorder', admin.searchSingleOrder) //search for order number
.get('/add-to-order', admin.addToOrder)
.get('/remove-from-order', admin.removeFromOrder)
.post("/createinfluencer", admin.createInfluencer) //create influencer

module.exports = router;
