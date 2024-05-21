const express = require ("express")
const router = express.Router()

const appRoot = require ("app-root-path")
const path = require ("path")
const rootPath = path.resolve(process.cwd())
appRoot.setPath(rootPath)

const influencer= require (appRoot + "/controller/influencer.controller.js")

router
.get('/influencer', influencer.influencerDashboard)
.get("/order", influencer.usedBy)
.get("/delete-influencer")

module.exports = router