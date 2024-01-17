const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const admin = require(appRoot + "/controller/admin.controller.js");

router.get("/admin", admin.adminDashboard);

module.exports = router;
