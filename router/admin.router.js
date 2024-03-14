const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const admin = require(appRoot + "/controller/admin.controller.js");

router
.get("/admin", admin.adminDashboard)
.get("/order", admin.renderOrderPage)
.get('/singleorder', admin.singleOrder)
.get('/saveorder', admin.saveAllForProcessing)
.get('/processingorder', admin.orderAvailableToProcess)
.get('/searchsingleorder', admin.searchSingleOrder)
.get('/add-to-order', admin.addToOrder)
.get('/remove-from-order', admin.removeFromOrder)

module.exports = router;
