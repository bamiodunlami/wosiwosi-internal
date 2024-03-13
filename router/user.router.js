const express = require("express");
const router = express.Router();

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const user = require(appRoot + "/controller/user.controller.js");

router
.get("/user", user.renderOrderPage)

module.exports = router;
