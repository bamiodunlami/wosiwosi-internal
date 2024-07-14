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

const replaceDb= require(appRoot + "/model/replace.model.js");

const refundDb= require(appRoot + "/model/refund.model.js");


// ALL AJAX
// (ajax call from orderToProcess.js) this function is used to check status and details of order already done in the orderAvailableToProcess page
const checkStatusOfOrderToProcess = async (req, res) => {
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

// ajax to get all status of each product row of single order page(refund in particular)
const getOrderDetails = async (req, res)=>{
  const sendRefundDetails = await refundDb.findOne({orderNumber:req.body.orderNumber});  
  // console.log(sendRefundDetails)
  if(sendRefundDetails){
    res.send(sendRefundDetails)
  }else{
    res.send("")
  }
}

// ajax call for order to process json file
const orderToProcessJsonFile = async (req, res)=>{
  let path = appRoot + "/public/data/orderToProcess.json";
  fs.readFile(path, async (err, data) => {
    let orderToProcess = JSON.parse(data);
    res.send(orderToProcess)
})
}

// ORDER CONTROLLERS

// search single order and display
const searchSingleOrder = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const id = req.query.orderNumber;
      if (!id) {
        res.redirect(req.headers.referer);
      } else {
        res.redirect(`/single-order-processing?id=${id}`)
      }
    } catch (e) {
      console.log(e);
      next();
    }
  } else {
    res.redirect("/");
  }
};

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

const singleOrderProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    // check if user is staff or admin (if admin, do nothing, but if user, create the order number in db and lock it so that no other staff in that duty can work on it)
    let userDuty = req.user.duty;
    const id = req.query.id;
    const user=req.user;
    let authorize = true; //determines who does something to the order
    let activity = true //determines if anything can be done on the order
    let orderToProcess= []

    // get all order save for processing
    // let path = appRoot + "/public/data/orderToProcess.json";
    // fs.readFile(path, async (err, data) => {
    //    orderToProcess = JSON.parse(data);
    //    console.log(orderToProcess)
    // })

    // check if order nunber ever exited in the db
    const orderExist = await singleOrder.findOne({ orderNumber: id });

    // if order number exist, check and update user accordingly
    if (orderExist) {
        // check if order is already been globally done 
        if(orderExist.status==true){
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
          
          case "packer":
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
      // orderToProcess:orderToProcess,
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

// replace request by staff
const replace = async (req, res)=>{
  if(req.isAuthenticated()){
    const findOrder = await replaceDb.findOne({orderNumber:req.body.orderNumber});
    // if order number exist
    if(findOrder){
      // update replacement details
      const updateReplacement = await replaceDb.updateOne({orderNumber:req.body.orderNumber}, {
        $push:{
          product:{
            productName:req.body.productName,
            replacementName:req.body.replacementName,
            replacementQty:req.body.replacementQty,
            replacementSize:req.body.replacementSize,
          }
        }
      }) 
      // if updated
      if(updateReplacement.acknowledged == true){
        res.send(true)
      }else{ //if not updated
        res.send(false)
      }
    } else{ //if order never existed
      //create orderNumber
      const createOrder = await new replaceDb({
        orderNumber:req.body.orderNumber,
        staffId:req.body.staffUsername,
        fname:req.body.staffName,
        date:date.toJSON(),
        product:[{
          productName:req.body.productName,
          replacementName:req.body.replacementName,
          replacementQty:req.body.replacementQty,
          replacementSize:req.body.replacementSize,
        }],
      })
      createOrder.save();
      //if saved
      if(createOrder){
        res.send(true)
      }else{ //if not saved
        res.send(false)
      }
    }
  }else{
    res.redirect("/")
  }
}

// refund request by staff
const refund = async (req, res)=>{
  // console.log(req.body)
  if(req.isAuthenticated()){
    const orderDetails = await woocommerce.get(`orders/${req.body.orderNumber}`);
    const findOrder = await refundDb.findOne({orderNumber:req.body.orderNumber});
    // if order number exist
    if(findOrder){
      // update refund details
      const updateRefund = await refundDb.updateOne({orderNumber:req.body.orderNumber}, {
        $push:{
          product:{
            productName:req.body.productName,
            productQuantity:req.body.productQuantity,
            productPrice:req.body.productPrice,
            status:false,
            approval:false
          }
        }
      }) 
      // if updated
      if(updateRefund.acknowledged == true){
        res.send(true)
      }else{ //if not updated
        res.send(false)
      }
    } else{ //if order never existed
      //create orderNumber
      const createOrder = await new refundDb({
        orderNumber:req.body.orderNumber,
        staffId:req.body.staffUsername,
        fname:req.body.staffName,
        date:date.toJSON(),
        product:[{
          productName:req.body.productName,
          productQuantity:req.body.productQuantity,
          productPrice:req.body.productPrice,
          status:false,
          approval:false
        }],
        customer_details:{
          fname:orderDetails.data.billing.first_name,
          lname:orderDetails.data.billing.last_name,
          phone:orderDetails.data.billing.phone,
          email:orderDetails.data.billing.email
        }
      })
      createOrder.save();
      //if saved
      if(createOrder){
        res.send(true)
      }else{ //if not saved
        res.send(false)
      }
    }
  }else{
    res.redirect("/")
  }
}


// Export module
module.exports = {
  searchSingleOrder:searchSingleOrder,
  orderAvailableToProcess: orderAvailableToProcess,
  singleOrderProcessing: singleOrderProcessing,
  checkStatusOfOrderToProcess: checkStatusOfOrderToProcess, //AJAX
  orderNote: orderNote,
  orderDone:orderDone,
  completedOrder,
  replace:replace,
  refund:refund,
  getOrderDetails:getOrderDetails, //AJax
  orderToProcessJsonFile:orderToProcessJsonFile //Ajax
};
