const express = require ('express')
const router = express.Router()

const appRoot = require ('app-root-path')
const path = require ('path')
const rootPath = path.resolve(process.cwd())
appRoot.setPath(rootPath)

const admin = require(appRoot + '/controller/admin.shop.controller.js')

router
.post('/load-sales-date', admin.salesData)
.get('/account', admin.renderAccountPage)


module.exports = router