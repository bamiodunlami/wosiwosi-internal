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

const notificationDb= require(appRoot + "/model/notification.model.js");

const completedDb= require(appRoot + "/model/completed.model.js");


// ALL AJAX
// (ajax call from orderToProcess.js) this function is used to check status and details of order already done in the orderAvailableToProcess page
const checkStatusOfOrderToProcess = async (req, res) => {
  if (req.isAuthenticated) {
    const orderData = await singleOrder.find();
        
    if (!orderData) {
      res.send("false");
    } else {
      res.json(orderData);
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

// (Ajax call from order.js) this is used to check and mark orders that are already saved for processing in the admin order page
const retrieveSavedForProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    const order = await singleOrder.find()
    let dataToSend = []
    for(const eachData of order){
      dataToSend.push(eachData.orderNumber)
    }
    res.send(dataToSend)
  } else {
    res.redirect("/");
  }
};

const getSingleOrderProcessingStatus = async (req, res)=>{
  console.log(req.query)
  const data = await singleOrder.findOne({orderNumber:req.query.id})
  if(!data){
    res.send("false")
  }else{
    res.send(data)
  }
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
    const order = await singleOrder.find({status:false})
    const refund = await refundDb.find({staffId:req.user.username, status:true, readStatus:false})
      res.render("general-order/orderToProcess", {
        title: "Processing Order",
        order: order,
        user: req.user,
        refund:refund
      });
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
      // const saveOrder = new singleOrder({
      //   orderNumber:id,
      //   status:false,
      //   note:[],
      //   meatPicker:{
      //       id:"",
      //       fname:"",
      //       active:false,
      //       time:"",
      //       status:false
      //   },
      //   dryPicker:{
      //       id:"",
      //       fname:"",
      //       active:false,
      //       time:"",
      //       status:false
      //   },
      //   packer:{
      //       id:"",
      //       fname:"",
      //       active:false,
      //       time:"",
      //       status:false
      //   },
      //   booking:{
      //       status:false
      //   },
      //   replace:[],
      //   refund:[],
      // })
      // saveOrder.save();
      // updateData();
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
                  // status: false,
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
                time: date.toJSON()
                // status: false,
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
                // status: false,
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
    console.log(orderExist)
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
    
    //find order
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
      res.send("false");
    }

    //update notification
    if(req.user.role == "staff"){
      const saveNotification = new notificationDb({
        notificationId:Math.floor(Math.random()*899429323),
        senderId:req.user.username,
        senderFname:req.user.fname,
        senderDuty:req.user.duty,
        orderNumber:req.body.orderNumber,
        date:date.toJSON(),
        readStatus:false,
        directedTo: "manager",
        message:req.body.note
      })
      await saveNotification.save()
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

    //check if order is completed, then save to temporaty complete order db
    let completed  = await singleOrder.findOne({orderNumber:orderId})
    if(completed.status == true){
      const saveToCompletedDc = new completedDb({
        orderNumber:completed.orderNumber,
        status:completed.status,
        note:completed.note,
        meatPicker:{
            id:completed.meatPicker.id,
            fname:completed.meatPicker.fname,
            active:completed.meatPicker.active,
            time:completed.meatPicker.time,
            status:completed.meatPicker.status
        },
        dryPicker:{
          id:completed.dryPicker.id,
          fname:completed.dryPicker.fname,
          active:completed.dryPicker.active,
          time:completed.dryPicker.time,
          status:completed.dryPicker.status
        },
        packer:{
          id:completed.packer.id,
          fname:completed.packer.fname,
          active:completed.packer.active,
          time:completed.packer.time,
          status:completed.packer.status
        },
      })
      await saveToCompletedDc.save()
    }

    res.redirect("/processingorder");
  }else{
    res.redirect("/")
  }
}

// view  completed orders
const completedOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    const completedOrder = await completedDb.find({status:true})
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
          },
          $set:{
            status:false,
            readStatus:false,
            close:false
          }
        }) 
        // if updated
        if(updateRefund.acknowledged == true){
          res.send(true)
        }else{ //if not updated
          res.send(false)
        }
    }else{ //if order never existed
      //create orderNumber
      const createOrder = await new refundDb({
        orderNumber:req.body.orderNumber,
        staffId:req.body.staffUsername,
        fname:req.body.staffName,
        date:date.toJSON(),
        status:false,
        close:false,
        readStatus:false,
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
  retrieveSavedForProcessing:retrieveSavedForProcessing, //Ajax
  getSingleOrderProcessingStatus:getSingleOrderProcessingStatus
};
