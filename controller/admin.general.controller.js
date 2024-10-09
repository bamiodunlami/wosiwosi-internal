const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const singleOrder = require("../model/order.model");
const date = new Date();

const passport = require(appRoot + "/util/passport.util.js");
const User = require(appRoot + "/model/user.model.js");
const settingsDb = require(appRoot + "/model/settings.model.js");


// admin dashboard
const adminDashboard = async (req, res) => {
  if (req.isAuthenticated()) {
    // console.log(date.toJSON().slice(0, 10));
    res.render("admin/home", {
      title: "Admin",
      date: date.toJSON().slice(0, 10),
    });
  } else {
    res.redirect("/");
  }
};

// 
const adminOperation = async (req, res) => {
  if (req.isAuthenticated()) {
    const settings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
    // console.log(date.toJSON().slice(0, 10));
    switch (req.params.operation) {
      // influencer
      case "influencer":
        const influencer = await User.find({ role: "influencer" });
        res.render("admin/influencer", {
          title: "Influencer",
          user: req.user,
          influencer: influencer,
        });
        break;

      // online center
      case "online":
        res.render("admin/online-centre", {
          title: "Admin",
          date: date.toJSON().slice(0, 10),
          settings:settings,
          user:req.user
        });
        break;

      // staff
      case "staff":
        const staff = await User.find()
        const teamSettings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
          res.render("admin/staff", { //change to staff page
            user:req.user,
            title:"Stafd",
            staff:staff,
            team:teamSettings.team
          })
          break;
    
    //shop and warehouse
     case "shop-warehouse":
        res.render("admin/shop-warehouse/shop-warehouse",{
            title:"Shop and wharehouse"
        })
        break;

        // default
      default:
        break;
    }
  } else {
    res.redirect("/");
  }
};

// create influencer
const createInfluencer = async (req, res) => {
  if (req.isAuthenticated()) {
    const influencerFname = req.body.fname;
    const influencerLname = req.body.fname;
    const influencerUsername = req.body.username;
    const influencerId = req.body.id;
    const coupon = req.body.coupon;
    const bonus = Number(req.body.bonus);
    const bonusType = Number(req.body.bonusType);

    const influnecerPassword = `${coupon}${influencerId}`;

    const saveInfluencer = new User({
      username: influencerUsername,
      fname: influencerFname,
      lname: influencerLname,
      status: true,
      id: influencerId,
      role: "influencer",
      passChange: false,
      code: coupon,
      bonus: bonus,
      bonusType: bonusType,
    });
    const saveInfluencerDetails = await saveInfluencer.save();
    const newInfluencer = await User.findOne({
      username: influencerUsername,
      role: "influencer",
    });
    await newInfluencer.setPassword(influnecerPassword); // create password
    await newInfluencer.save(); //save password

    if (newInfluencer) {
      res.redirect(req.headers.referer);
      mailer.mailInfluencerDetails(
        influencerUsername,
        "media@wosiwosi.co.uk",
        influencerFname,
        influencerUsername,
        influnecerPassword
      );
    } else {
    }
  } else {
    res.redirect("/login");
  }
};


module.exports = {
  adminDashboard: adminDashboard,
  adminOperation: adminOperation,
  createInfluencer: createInfluencer,
};
