const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const date = new Date();
const passport = require(appRoot + "/util/passport.util.js");
const User = require(appRoot + "/model/user.model.js");
const woocommerce = require(appRoot + "/util/woo.util.js");
const mailer = require(appRoot + "/util/mailer.util.js")

// admin dashboard
const adminDashboard = async (req, res) => {
  if (req.isAuthenticated()) {
    // console.log(req.user)
    res.render("admin/home", {
      title: "Admin",
      date: date.toJSON().slice(0, 10),
    });
  } else {
    res.redirect("/");
  }
};

// online centre
const adminOperation = async (req, res) => {
  if (req.isAuthenticated()) {
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
        console.log(req.user);
        res.render("admin/online-centre", {
          title: "Admin",
          date: date.toJSON().slice(0, 10),
        });

      // default
      default:
        console.log("Default");
        break;
    }
  } else {
    res.redirect("/");
  }
};

// order page
const renderOrderPage = async (req, res) => {
  if (req.isAuthenticated()) {
    let fromDate = req.query.fromDate;
    let toDate = req.query.toDate;
    let fromTime = req.query.fromTime;
    let toTime = req.query.toTime;

    // console.log(req.query)
    // ${date.toLocaleTimeString()}
    let pageNumber = req.query.page;
    let numberPerPage = 20;

    if (pageNumber < 1) {
      pageNumber = 1;
    }

    const wooOrder = await woocommerce.get(
      `orders?after=${fromDate}T${fromTime}:00&before=${toDate}T${toTime}:59`,
      {
        page: pageNumber,
        per_page: numberPerPage,
        status: "completed processing",
      }
    );
    // console.log(wooOrder.data)
    res.render("admin/order", {
      title: "Order",
      order: wooOrder.data,
      defalutNumber: numberPerPage,
      page: Number(pageNumber),
      fromDate: fromDate,
      toDate: toDate,
      fromTime: fromTime,
      toTime: toTime,
    });
  } else {
    res.redirect("/");
  }
};

// single order
const singleOrder = async (req, res) => {
  if (req.isAuthenticated()) {
    let id = req.query.id;
    let fromDate = req.query.fromDate;
    let toDate = req.query.toDate;
    let page = req.query.page;
    let fromTime = req.query.fromTime;
    let toTime = req.query.toTime;
    // console.log(req.query)
    const order = await woocommerce.get(`orders/${id}`);
    // console.log(order.data.customer_note)
    res.render("admin/singleOrder", {
      title: `Order ${req.query.id}`,
      order: order.data,
      fromDate: fromDate,
      toDate: toDate,
      page: page,
      fromTime: fromTime,
      toTime: toTime,
      action: "view", //this is because admin clicked from order page and not the main admin page, the only action expected here is jus view
    });
  } else {
    res.redirect("/");
  }
};

// save order for processing
const saveAllForProcessing = (req, res) => {
  if (req.isAuthenticated()) {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const fromTime = req.query.fromTime;
    const toTime = req.query.toTime;
    let path = appRoot + "/public/data/orderToProcess.json";

    data = JSON.stringify(req.query);
    // Override what is currently in orderToProcess.json file
    fs.writeFile(path, data, (err) => {
      res.redirect("/admin");
    });
  } else {
    res.redirect("/");
  }
};

// orders available for workers to process
// order page
const orderAvailableToProcess = async (req, res) => {
  if (req.isAuthenticated()) {
    let path = appRoot + "/public/data/orderToProcess.json";
    fs.readFile(path, async (err, data) => {
      let orderToProcess = JSON.parse(data);
      // console.log(orderToProcess)

      let fromDate = orderToProcess.fromDate;
      let toDate = orderToProcess.toDate;
      let fromTime = orderToProcess.fromTime;
      let toTime = orderToProcess.toTime;

      let pageNumber = req.query.page || 1;
      let numberPerPage = 20;

      if (req.query.page < 1) {
        pageNumber = 1;
      }

      // start from here on monday,

      const wooOrder = await woocommerce.get(
        `orders?after=${fromDate}T${fromTime}:00&before=${toDate}T${toTime}:59`,
        {
          page: pageNumber,
          per_page: numberPerPage,
          status: "completed processing",
        }
      );
      // console.log(wooOrder.data)
      res.render("admin/orderToProcess", {
        title: "Order",
        order: wooOrder.data,
        defalutNumber: numberPerPage,
        page: Number(pageNumber),
        fromDate: fromDate,
        toDate: toDate,
        fromTime: fromTime,
        toTime: toTime,
      });
    });

    // console.log(req.query)
    // ${date.toLocaleTimeString()}
  } else {
    res.redirect("/");
  }
};

// single order display
const searchSingleOrder = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const id = req.query.orderNumber;
      const order = await woocommerce.get(`orders/${id}`);
      // console.log(order.data.customer_note)
      res.render("admin/singleOrder", {
        title: `Order ${id}`,
        order: order.data,
        action: "search", //this order was serched from main admin page so the only action expected is to add to processing order or not
      });
    } catch (e) {
      console.log(e);
      next();
    }
  } else {
    res.redirect("/");
  }
};

// Add single order to the orders to be done that day
const addToOrder = async (req, res, next) => {
  console.log(req.query.order);
};

// remove single order from the orders to be done that day
const removeFromOrder = async (req, res, next) => {
  console.log(req.query);
};

// create influencer
const createInfluencer = async (req, res) => {
  if (req.isAuthenticated()) {
    const influencerFname = req.body.fname;
    const influencerLname = req.body.fname;
    const influencerUsername = req.body.username;
    const influencerId = req.body.id;
    const coupon = req.body.coupon;
    const bonus = Number(req.body.bonus)
    const bonusType = Number(req.body.bonusType)

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
      bonus:bonus,
      bonusType:bonusType,
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
      mailer.mailInfluencerDetails( influencerUsername,"media@wosiwosi.co.uk", influencerFname,influencerUsername, influnecerPassword);
    } else {}
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  adminDashboard: adminDashboard,
  adminOperation: adminOperation,
  renderOrderPage: renderOrderPage,
  singleOrder: singleOrder,
  saveAllForProcessing: saveAllForProcessing,
  orderAvailableToProcess: orderAvailableToProcess,
  searchSingleOrder: searchSingleOrder,
  addToOrder: addToOrder,
  removeFromOrder: removeFromOrder,
  createInfluencer: createInfluencer,
};
