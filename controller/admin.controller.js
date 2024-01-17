const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const woo = require (appRoot + '/util/woo.util.js')

// admin dashboard
const adminDashboard =  async (req, res)=>{
    woo.getOrder(100)
    res.render('admin/admin')
}

module.exports ={
    adminDashboard:adminDashboard
}