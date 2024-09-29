const express = require('express')

const router = express.Router()

const appRoot = require("app-root-path");
const path = require("path");

const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);


const passport = require(appRoot + "/util/passport.util.js"); //passport
const User = require(appRoot + "/model/user.model.js"); //db


// ALL AJAX
app.get('*',(req, res, next)=> {
    console.log('all route')
    next();
})


// Export module
module.exports = router;
