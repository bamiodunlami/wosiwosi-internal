const appRoot = require("app-root-path");
const path = require("path");

const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const { deflate } = require("zlib");

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

// (ajax call from orderToProcess.js) this function is used to check status and details of order already done in the orderAvailableToProcess page
const retrieveOrderProcessingStatus = async (req, res) => {
  if (req.isAuthenticated) {
    const orderInfo = await singleOrder.find();
    if (!orderInfo) {
      res.send("false");
    } else {
      res.json(orderInfo);
    }
  } else {
    res.redirect("/");
  }
};

// single order processing page
const singleOrderProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    // check if user is staff or admin (if admin, do nothing, but if user, create the order number in db and lock it so that no other staff in that duty can work on it)
    let userDuty = req.user.duty;
    const id = req.query.id;
    // check if order nunber ever exited in the db
    const orderExist = await singleOrder.findOne({ orderNumber: id });

    // if order number exist, check and update user accordingly
    if (orderExist) {
      switch (userDuty) {
        // if meat picker
        case "meat-picker":
           await singleOrder.updateOne({ orderNumber: id },{
              $set: {
                meatPicker: {
                  id: req.user.username,
                  active: true,
                  time: date.toJSON(),
                  status: false,
                },
              },
            }
          );
          break;

        // if product picker
        case "dry-picker":
          await singleOrder.updateOne({ orderNumber: id },{
            $set: {
              dryPicker: {
                id: req.user.username,
                active: true,
                time: date.toJSON(),
                status: false,
              },
            },
          }
        );
        break;

        // if packer
        case "packer":
          await singleOrder.updateOne({ orderNumber: id },{
            $set: {
              packer: {
                id: req.user.username,
                active: true,
                time: date.toJSON(),
                status: false,
              },
            },
          }
        );
        break;
      
        // default
        default:
          break;
      }
    } else {
      //if order do not exit, create order and update
      switch (userDuty) {
        // if meat picker
        case "meat-picker":
          let meatPickerSaveOrder = new singleOrder({
            orderNumber:id,
            status:false,
            note:[],
            meatPicker:{
                id:req.user.username,
                active:true,
                time:date.toJSON(),
                status:false
            },
          })
          await meatPickerSaveOrder.save()
          break;

        // if product picker
        case "dry-picker":
          let dryPickerSaveOrder = new singleOrder({
            orderNumber:id,
            status:false,
            note:[],
            dryPicker:{
                id:req.user.username,
                active:true,
                time:date.toJSON(),
                status:false
            },
          })
          await dryPickerSaveOrder.save()
        break;

        // if packer
        case "packer":
          let packerPickerSaveOrder = new singleOrder({
            orderNumber:id,
            status:false,
            note:[],
            packer:{
                id:req.user.username,
                active:true,
                time:date.toJSON(),
                status:false
            },
          })
          await packerPickerSaveOrder.save()
        break;
      
        // deault
        default:
          break;
      }
    }
    // const lookUpOrderDb = await singleOrder.findOne({ orderNumber: id });
    const order = await woocommerce.get(`orders/${id}`);
    // console.log(req.user)
    res.render("general-order/single-order-processing", {
      title: "Order Processing",
      order: order.data,
      orderFromDB: orderExist,
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
    const order = await singleOrder.findOne({  orderNumber: req.body.orderNumber});
    // if order number is already cereated
    if (order) {
      const addToExistingNote = await singleOrder.updateOne( { orderNumber: req.body.orderNumber }, {
          $push: {
            note: {
              fname: req.body.userFname,
              userId: req.body.userId,
              note: req.body.note,
            },
          },
        }
      );
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
        meatPicker: {
          id: "",
          active: false,
          time: "",
          status: false,
        },
        dryPicker: {
          id: "",
          active: false,
          time: "",
          status: false,
        },
        packer: {
          id: "",
          active: false,
          time: "",
          status: false,
        },
        booking: {
          status: false,
        },
        replace: [],
        refund: [],
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
  retrieveOrderProcessingStatus: retrieveOrderProcessingStatus,
  orderNote: orderNote,
};
