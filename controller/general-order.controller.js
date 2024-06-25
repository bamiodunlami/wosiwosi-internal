const appRoot = require("app-root-path");
const path = require("path");

const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const { authorize } = require("passport");
const { title } = require("process");

const woocommerce = require(appRoot + "/util/woo.util.js");

const date = new Date(); //date

const passport = require(appRoot + "/util/passport.util.js"); //passport

const User = require(appRoot + "/model/user.model.js"); //db

const mailer = require(appRoot + "/util/mailer.util.js");

const singleOrder = require(appRoot + "/model/order.model.js");

// render orders available for workers to process, other db lookup are done by ajax in the js 
const orderAvailableToProcess = async (req, res) => {
  if (req.isAuthenticated()) {
    let orderFromDB = await singleOrder.find()
    // console.log(orderFromDB);
    let path = appRoot + "/public/data/orderToProcess.json";
    fs.readFile(path, async (err, data) => {
      let orderToProcess = JSON.parse(data);
      res.render("general-order/orderToProcess", {
        title: "Processing Order",
        order: orderToProcess,
        orderFromDB:orderFromDB,
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
    const user=req.user;
    let authorize = true;
    let activity = true

    // check if order nunber ever exited in the db
    const orderExist = await singleOrder.findOne({ orderNumber: id });

    // if order number exist, check and update user accordingly
    if (orderExist) {
        // check if order is already been globally done 
        if(orderExist.status==true && userDuty != "manager"){
          activity = false //no more activity
        }else{
          checkIfOrderHasNotBeenTaken();
        }
    } else{
      // first save the order
      const saveOrder = new singleOrder({
        orderNumber:id,
        status:false,
        note:[],
        meatPicker:{
            id:"",
            fname:"",
            active:false,
            time:"",
            status:false
        },
        dryPicker:{
            id:"",
            fname:"",
            active:false,
            time:"",
            status:false
        },
        packer:{
            id:"",
            fname:"",
            active:false,
            time:"",
            status:false
        },
        booking:{
            status:false
        },
        replace:[],
        refund:[],
      })
      saveOrder.save();
      updateData();
    }

    // function to update order data
    async function updateData (){
      switch (userDuty) {
        // if meat picker
        case "meat-picker":
           await singleOrder.updateOne({ orderNumber: id },{
              $set: {
                meatPicker: {
                  id: req.user.username,
                  fname:req.user.fname,
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
                fname:req.user.fname,
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
                fname:req.user.fname,
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
    }

    // check if the ordre hasnt been handled by someone else
    async function checkIfOrderHasNotBeenTaken(){
      switch(userDuty){
        case "meat-picker":
          // chceck if meat picking hasnt been handled by sonmeon else
          if(orderExist.meatPicker.active == true && user.username != orderExist.meatPicker.id){
            authorize = false;
          }else{
            updateData(); //update data
            authorize =true;
          }
          break;
         
         case "dry-picker":
            // chceck if meat picking hasnt been handled by sonmeon else
            if(orderExist.dryPicker.active == true && user.username != orderExist.dryPicker.id){
              authorize = false;
            }else{
              updateData(); //update data
              authorize =true;
            }
            break;
          
          case "dry-picker":
            // chceck if meat picking hasnt been handled by sonmeon else
            if(orderExist.packer.active == true && user.username != orderExist.packer.id){
              authorize = false;
            }else{
              updateData(); //update data
              authorize =true;
            }
            break;
          
          case "manager":
              authorize = true
              break; 
    
           default:
            break
      }
    }

    const order = await woocommerce.get(`orders/${id}`); // get order from woocommerce
    res.render("general-order/single-order-processing", {
      title: "Order Processing",
      order: order.data,
      orderFromDB: orderExist,
      authorize:authorize,
      activity:activity,
      user:user,
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
          fname:"",
          active: false,
          time: "",
          status: false,
        },
        dryPicker: {
          id: "",
          fname:"",
          active: false,
          time: "",
          status: false,
        },
        packer: {
          id: "",
          fname:"",
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

// a particular order has been done
const orderDone = async (req, res) =>{
  if(req.isAuthenticated()){
    let orderId = req.query.id
    let userDuty = req.user.duty
    // console.log(orderId, userDuty)
    switch (userDuty){

      case "meat-picker":
        await singleOrder.updateOne({orderNumber:orderId},{
          $set:{
            meatPicker:{
              id: req.user.username,
              fname:req.user.fname,
              active: true,
              time: date.toJSON(),
              status: true,
            }
          }
        })
        break;
      
      case "dry-picker":
        await singleOrder.updateOne({orderNumber:orderId},{
          $set:{
            dryPicker: {
              id: req.user.username,
              fname:req.user.fname,
              active: true,
              time: date.toJSON(),
              status: true,
            },
          }
        })
        break;

      case "packer":
        await singleOrder.updateOne({orderNumber:orderId},{
          $set:{
            status:true,
            packer: {
              id: req.user.username,
              fname:req.user.fname,
              active: true,
              time: date.toJSON(),
              status: true,
            },
          }
        })
        break;
      
      case "manager":
          await singleOrder.updateOne({orderNumber:orderId},{
            $set:{
              status:true,
            }
          });
        break;

      default:
        break
    }
    res.redirect("/processingorder");
  }else{
    res.redirect("/")
  }
}

// view  completed orders
const completedOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    const completedOrder = await singleOrder.find({status:true})
      res.render('general-order/completed-order', {
      title:"Completed Order",
      order:completedOrder,
      user:req.user
      })
    }else{
      res.redirect('/')
    }
}

// refunds
const refund = async (req, res)=>{
  console.log(req.body)
}


// Export module
module.exports = {
  orderAvailableToProcess: orderAvailableToProcess,
  singleOrderProcessing: singleOrderProcessing,
  retrieveOrderProcessingStatus: retrieveOrderProcessingStatus,
  orderNote: orderNote,
  orderDone:orderDone,
  completedOrder,
  refund:refund
};
