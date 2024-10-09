const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const admin = require(appRoot + "/controller/admin.general.controller.js");

router
.get("/admin", admin.adminDashboard) //render admin dashboard
.get("/admin/:operation", admin.adminOperation) //take care of admin operation

.post("/createinfluencer", admin.createInfluencer) //create influencer

module.exports = router;
