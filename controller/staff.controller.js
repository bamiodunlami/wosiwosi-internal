const appRoot = require("app-root-path");
const path = require("path");
const { title } = require("process");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const User = require(appRoot + "/model/user.model.js");
const passport = require(appRoot + "/util/passport.util.js");
const mailer = require(appRoot + "/util/mailer.util.js");

const renderStaffPage = async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.passChange != true) { //if it's first time login
      res.redirect("/changepassword"); //for to chanage passowd
    } else {
      res.render("staff/staff-home", {
        title:"Staff",
        staff:req.user
      });
    }
  }else{
    res.redirect('/')
  }
};

module.exports = {
  renderStaffPage: renderStaffPage,
};
