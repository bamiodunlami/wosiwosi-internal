const express = require ('express');
const router = express.Router();

const appRoot = require ('app-root-path');
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


const staff = require (appRoot +"/controller/staff.controller.js")

router
.get('/staff', staff.renderStaffPage)

.get('/staff/:request', staff.staffDashboardRequest) //incoming request from staff dashboard

.get('/mark-notification-read', staff.markNotificationAsRead)



module.exports = router