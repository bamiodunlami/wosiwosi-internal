const appRoot = require("app-root-path");
const path = require("path");

const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");

const woocommerce = require(appRoot + "/util/woo.util.js");

const date = new Date(); //date

const passport = require(appRoot + "/util/passport.util.js"); //passport

const User = require(appRoot + "/model/user.model.js"); //db

const mailer = require(appRoot + "/util/mailer.util.js");

const singleOrder = require(appRoot + "/model/order.model.js");

// render orders available for workers to process
const orderAvailableToProcess = async (req, res) => {
  if (req.isAuthenticated()) {
    let path = appRoot + "/public/data/orderToProcess.json";
    fs.readFile(path, async (err, data) => {
      let orderToProcess = JSON.parse(data);
      // console.log(wooOrder.data)
      res.render("general-order/orderToProcess", {
        title: "Processing Order",
        order: orderToProcess,
        user: req.user,
      });
    });

    // console.log(req.query)
    // ${date.toLocaleTimeString()}
  } else {
    res.redirect("/");
  }
};

// single order processing page 
const singleOrderProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.query.id;
    const lookUpOrderDb = await singleOrder.findOne({ orderNumber: id });
    const order = await woocommerce.get(`orders/${id}`);
    // console.log(req.user)
    res.render("general-order/single-order-processing", {
      title: "Order Processing",
      order: order.data,
      note: lookUpOrderDb,
      user: req.user,
    });
  } else {
    res.redirect("/");
  }
};

// Admin and staffs use note
const orderNote = async (req, res) => {
  if (req.isAuthenticated()) {
    // console.log(req.body);
    const order = await singleOrder.findOne({ orderNumber: req.body.orderNumber});
    // if order number is already cereated
    if (order) {
      const addToExistingNote = await singleOrder.updateOne({orderNumber:req.body.orderNumber},{
        $push:{
            note:{
                fname: req.body.userFname,
                userId: req.body.userId,
                note: req.body.note,
            }
        }
      })
      res.send("true");
    } else {
      // create the order number and save note
      const saveNote = new singleOrder({
        orderNumber: req.body.orderNumber,
        status: false,
        note: [
          {
            fname: req.body.userFname,
            userId: req.body.userId,
            note: req.body.note,
          },
        ],
        picker: {
          id: "",
          status: false,
        },
        packer: {
          id: "",
          status: false,
        },
        booking: {
          status: false,
        },
      });
      saveNote.save();
      if (saveNote) {
        //if note is saved
        res.send("true");
      } else {
        res.send("false");
      }
    }
  } else {
    res.redirect("/");
  }
};

// Export module
module.exports = {
  orderAvailableToProcess: orderAvailableToProcess,
  singleOrderProcessing: singleOrderProcessing,
  orderNote: orderNote,
};
