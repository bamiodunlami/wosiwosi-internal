const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const picker = require(appRoot + "/controller/picker.controller.js");

router
.get("/user", picker.renderOrderPage)

module.exports = router;
