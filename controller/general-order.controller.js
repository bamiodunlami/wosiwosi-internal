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

const redundDb= require(appRoot + "/model/redundant.model.js");

const replaceDb= require(appRoot + "/model/replace.model.js");

const refundDb= require(appRoot + "/model/refund.model.js");

const notificationDb= require(appRoot + "/model/notification.model.js");

const completedDb= require(appRoot + "/model/completed.model.js");

const settingsDb= require(appRoot + "/model/settings.model.js");


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
const getRefundOrderDetails = async (req, res)=>{
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
    const redundantDatabase = await redundDb.find()
    const orderDatabase = await singleOrder.find()
    const order = redundantDatabase.concat(orderDatabase)
    let dataToSend = []
    for(const eachData of order){
      dataToSend.push(eachData.orderNumber)
    }
    res.send(dataToSend)
  } else {
    res.redirect("/");
  }
};

// Ajax this function sends details of order clicked for processing
const getSingleOrderProcessingStatus = async (req, res)=>{
  // console.log(req.query)
  const orderDbData = await singleOrder.findOne({orderNumber:req.query.id})
  const redundantDbData = await redundDb.findOne({orderNumber:req.query.id})

  //merge both data
  if(orderDbData){
    data = orderDbData
  }else{
    data = redundantDbData
  }

  if(!data){
    res.send("false")
  }else{
    res.send(data)
  }
}

// when it is in individual mode AJax
const productPicked = async(req, res)=>{
  if(req.isAuthenticated()){
    let orderNumber = req.body.id
    let userDuty = req.user.duty
    let product = req.body.product
    let query = req.query.request
    // console.log(query)
    // console.log(product)
    // console.log(orderNumber, userDuty)
    if(query == "dry-picked"){
       await singleOrder.updateOne({orderNumber:orderNumber},{
          $set:{
            "dryPicker.status":true
          }
      })
    }else if( query == "meat-picked"){
      await singleOrder.updateOne({orderNumber:orderNumber},{
          $set:{
            "meatPicker.status":true
          }
      })
    }

    //save product
    const theOrder = await singleOrder.findOne({orderNumber:orderNumber})
    const alreadySaved = theOrder.productPicked
    // console.log(alreadySaved)
    const mergedProducts = [...new Set([...alreadySaved,...product])]; // Ecma 6 for concatenating array without duplicate
    // console.log(mergedProducts); 
    await singleOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        productPicked:mergedProducts
      }
    })

    // switch (userDuty){

    //   case "meat-picker":
    //     await singleOrder.updateOne({orderNumber:orderId},{
    //       $set:{
    //         meatPicker:{
    //           id: req.user.username,
    //           product:product,
    //           fname:req.user.fname,
    //           active: true,
    //           time: date.toJSON(),
    //           status: true,
    //         }
    //       }
    //     })
    //     break;
      
    //   case "dry-picker":
    //     await singleOrder.updateOne({orderNumber:orderId},{
    //       $set:{
    //         dryPicker: {
    //           id: req.user.username,
    //           product:product,
    //           fname:req.user.fname,
    //           active: true,
    //           time: date.toJSON(),
    //           status: true,
    //         },
    //       }
    //     })
    //     break;

    //   case "packer":
    //     await singleOrder.updateOne({orderNumber:orderId},{
    //       $set:{
    //         meatPicker: {
    //           id: req.user.username,
    //           product:product,
    //           fname:req.user.fname,
    //           active: true,
    //           time: date.toJSON(),
    //           status: true,
    //         },
    //         date:date.toJSON().slice(0,10)
    //       }
    //     })
    //     break;
      
    //   case "manager":
    //       await singleOrder.updateOne({orderNumber:orderId},{
    //         $set:{
    //           status:true,
    //           packer: {
    //             id: req.user.username,
    //             fname:req.user.fname,
    //             active: true,
    //             time: date.toJSON(),
    //             status: true,
    //           },
    //           date:date.toJSON().slice(0,10)
    //         }
    //       });
    //     break;

    //   default:
    //     break
    // }
    res.send(true);
  }else{
    res.redirect(false)
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
    
    // check if settins is team or individual and requester is a worker and not admin
    const settings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})

    //lock system
    if(settings.lock == true && req.user.role == "staff"){
      res.redirect('/lock-page')
    }else{

    //if settins is teams
    // if(settings.team == false){
    //   if(req.user.role == "staff" && req.user.team.status == false){
    //     res.redirect("/select-duty")
    //   }
    // }
    //sort orders to show individual staff if it's team system or individual
    let order;
    if(settings.team == false && req.user.team.status == false && req.user.level < 3){
      order = await  singleOrder.find({status:false, "packer.id":req.user.username})
    }else{
      order = await  singleOrder.find({status:false})
    }


    // numbers of order available to each staff when it's in individual mode, only available to supervisor and managers
    let eachStaffOrder=[];
    if(settings.team == false && req.user.level > 3 ){ //available to supervisor and above leve (>3)
      const staffAvailable = await User.find({role:"staff"}) //get all staff
      for(const eachStaff of staffAvailable){ // loop through each staff
        if(eachStaff.team.status == false){ // if it's individual and no support team
          let staffOrder = await  singleOrder.find({"packer.id":eachStaff.username}) //get order
          let undone = await  singleOrder.find({status:false, "packer.id":eachStaff.username}) //get orde
          //if staff order length is 0, dont push, mean the are not assing to any order
          if(staffOrder.length == 0){
            //push nothing
          }else{
            //push staff name and numbers of available order as object into an array
            eachStaffOrder.push({
              fname:eachStaff.fname,
              order: staffOrder.length,
              undone:undone.length
            })
          }
        }else{ // if it's individual and there's support team

        }
      }
    }else{ // other staff has no access to this tab
      staffOrder=[] //return staff order to 0
    }

    // const order = await singleOrder.find({status:false})
    const refund = await refundDb.find({staffId:req.user.username, status:true, readStatus:false})
      res.render("general-order/orderToProcess", {
        title: "Processing Order",
        order: order,
        orderAssign:eachStaffOrder,
        user: req.user,
        refund:refund
      });
    }

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
    // let orderToProcess= []

      // get order details from woocommerce and render single order page
      try{
        order = await woocommerce.get(`orders/${id}`); // get order from woocommerce
      }catch(e){
        console.log("ERROR")
        res.redirect(req.headers.referer)
      }

      const settings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})

      // check if order nunber ever exited in the db
      const mainOrder = await singleOrder.findOne({ orderNumber: id });
      const redundant = await redundDb.findOne({ orderNumber: id });

      // if order number exist in singleOrder db or redundant db
      if (mainOrder || redundant) {
        //margen order exist or redundant into one variable
        if(mainOrder){
          console.log("data from mainOrder")
          orderExist = mainOrder
        }else{
          console.log("data from redundant")
          orderExist = redundant
        }
        // check if order is already been globally done 
        if(orderExist.status==true){
          activity = false //no more activity
        }else{
          checkIfOrderHasNotBeenTaken();
        }
        res.render("general-order/single-order-processing", {
          title: "Order Processing",
          order: order.data,
          // orderToProcess:orderToProcess,
          orderFromDB: orderExist,
          authorize:authorize,
          activity:activity,
          user:user,
          setting:settings.team
        });
      }else{
        res.render("general-order/single-order-processing", {
          title: "Order Processing",
          order: order.data,
          // orderToProcess:orderToProcess,
          orderFromDB:null,
          authorize:authorize,
          activity:activity,
          user:user,
          setting:settings.team
        });
      }

      // function to update order data
      async function updateData (){
        const orderData =  await singleOrder.findOne({orderNumber: id})
        switch (userDuty) {
          // if meat picker
          case "meat-picker":
            await singleOrder.updateOne({orderNumber: id},{
                $set: {
                  meatPicker: {
                    id: req.user.username,
                    // product:orderData.meatPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                    fname:req.user.fname,
                    active: true,
                    time: date.toJSON(),
                    status: orderData.meatPicker.status,
                  },
                },
              }
            );
            marryTeamWhenOneOtherIsClicked(orderData)
            //consider if team
          break;

          // if product picker
          case "dry-picker":
            // console.log(orderData)
            await singleOrder.updateOne({ orderNumber: id },{
                $set: {
                  dryPicker: {
                    id: req.user.username,
                    // product:orderData.dryPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                    fname:req.user.fname,
                    active: true,
                    time: date.toJSON(),
                    status: orderData.dryPicker.status,
                  },
                },
              }
            );
            marryTeamWhenOneOtherIsClicked(orderData)
          break;

          // if packer
          case "packer":
            await singleOrder.updateOne({ orderNumber: id },{
                $set: {
                  packer: {
                    id: req.user.username,
                    // product:orderData.packer.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                    fname:req.user.fname,
                    active: true,
                    time: date.toJSON(),
                    status: orderData.packer.status,
                  },
                },
              }
            );
            marryTeamWhenOneOtherIsClicked(orderData)
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

      // If global settings team is false i.e staff works as an individual, check if staff has a partner or not and marry their both work
      //when any partner clicks an other, the other partner's details shows
      async function marryTeamWhenOneOtherIsClicked(orderData){
        const teamSetting = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
        if(teamSetting.team == false && req.user.team.status == false){ // is now an individual system and no partner
          await singleOrder.updateOne({orderNumber:id},{
            $set: {
              meatPicker: {
                id: req.user.username,
                // product:orderData.meatPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:req.user.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.meatPicker.status,
              },
              dryPicker:{
                id: req.user.username,
                // product:orderData.dryPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:req.user.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.dryPicker.status,
              },
              packer:{
                id: req.user.username,
                // product:orderData.packer.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:req.user.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.packer.status,
              }
            }
          })  
        }
        // else if(teamSetting.team == false && req.user.team.status == true){ // individual with partner
        //   //find who is who among the team and assign order number to em
        //   const teamMember = await User.find({"team.value":req.user.team.value}) //search for team member
        //   for(const team  of teamMember){ //loop through team memver
        //     // ----------------------------------------------------//
        //     if(team.duty == "meat-picker" && team.username != req.user.username){ // avoid possible error of assiging order number to already assigned team 
        //       // const orderData =  await singleOrder.findOne({orderNumber: id})
        //       await singleOrder.updateOne({orderNumber: id},{
        //         $set: {
        //           meatPicker: {
        //             id: team.username,
        //             product:orderData.meatPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
        //             fname:team.fname,
        //             active: true,
        //             time: date.toJSON(),
        //             // status: false,
        //           },
        //         },
        //       });
        //     }else if(team.duty == "dry-picker" && team.username != req.user.username){ // avoid possible error of assiging order number to already assigned team 
        //       // const orderData =  await singleOrder.findOne({orderNumber: id})
        //       await singleOrder.updateOne({orderNumber: id},{
        //         $set: {
        //           dryPicker: {
        //             id: team.username,
        //             product:orderData.dryPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
        //             fname:team.fname,
        //             active: true,
        //             time: date.toJSON(),
        //             // status: false,
        //           },
        //         },
        //       });
        //     }else if(team.duty == "packer" && team.username != req.user.username){ // avoid possible error of assiging order number to already assigned team 
        //       // const orderData =  await singleOrder.findOne({orderNumber: id})
        //       await singleOrder.updateOne({orderNumber: id},{
        //         $set: {
        //           packer: {
        //             id: team.username,
        //             product:orderData.packer.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
        //             fname:team.fname,
        //             active: true,
        //             time: date.toJSON(),
        //             // status: false,
        //           },
        //         },
        //       });
        //     }
        //     // -------------------------------------------------//
        //   }
        // }
      }

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

// a particular order has been completed
const orderCompleted = async (req, res) =>{
  if(req.isAuthenticated()){
    let orderId = req.body.id
    let userDuty = req.user.duty
    let product = req.body.product
    // console.log(product)
    // console.log(orderId, userDuty)
    const theOrder = await singleOrder.findOne({orderNumber:orderId})
    const alreadySaved = theOrder.productPicked
    // console.log(alreadySaved)

    const mergedProducts = [...new Set([...alreadySaved,...product])]; // Ecma 6 for concatenating array without duplicate
    // console.log(mergedProducts); 
    await singleOrder.updateOne({orderNumber:orderId},{
      $set:{
        productPicked:mergedProducts
      }
    })

    switch (userDuty){

      case "meat-picker":
        await singleOrder.updateOne({orderNumber:orderId},{
          $set:{
            meatPicker:{
              id: req.user.username,
              // product:product,
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
              // product:product,
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
              // product:product,
              fname:req.user.fname,
              active: true,
              time: date.toJSON(),
              status: true,
            },
            date:date.toJSON().slice(0,10)
          }
        })
        break;
      
      case "manager":
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
              date:date.toJSON().slice(0,10)
            }
          });
        break;

      default:
        break
    }

    // check if order is completed, then save to temporaty complete order db
    let completed  = await singleOrder.findOne({orderNumber:orderId})
    if(completed.status == true){
      const saveToCompletedDc = new completedDb({
        orderNumber:completed.orderNumber,
        status:completed.status,
        note:completed.note,
        meatPicker:{
            id:completed.meatPicker.id,
            product:completed.meatPicker.product,
            fname:completed.meatPicker.fname,
            active:completed.meatPicker.active,
            time:completed.meatPicker.time,
            status:completed.meatPicker.status
        },
        dryPicker:{
          id:completed.dryPicker.id,
          product:completed.dryPicker.product,
          fname:completed.dryPicker.fname,
          active:completed.dryPicker.active,
          time:completed.dryPicker.time,
          status:completed.dryPicker.status
        },
        packer:{
          id:completed.packer.id,
          product:completed.packer.product,
          fname:completed.packer.fname,
          active:completed.packer.active,
          time:completed.packer.time,
          status:completed.packer.status
        },
      })
      await saveToCompletedDc.save()
    }

    res.send(true);
  }else{
    res.redirect("/")
  }
}

// view  completed orders
const viewCompletedOrder = async (req, res)=>{
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
  orderCompleted:orderCompleted,
  viewCompletedOrder:viewCompletedOrder,
  replace:replace,
  refund:refund,
  getRefundOrderDetails:getRefundOrderDetails, //AJax
  retrieveSavedForProcessing:retrieveSavedForProcessing, //Ajax
  getSingleOrderProcessingStatus:getSingleOrderProcessingStatus,
  productPicked:productPicked //ajax
};
