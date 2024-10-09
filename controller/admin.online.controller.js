const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const singleOrder = require("../model/order.model");

const date = new Date();

const passport = require(appRoot + "/util/passport.util.js");
const User = require(appRoot + "/model/user.model.js");
const woocommerce = require(appRoot + "/util/woo.util.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const singlOrder = require(appRoot + "/model/order.model.js")
const replaceDb= require(appRoot + "/model/replace.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");
const redundantDb= require(appRoot + "/model/redundant.model.js");
const notificationDb= require(appRoot + "/model/notification.model.js");
const completedDb= require(appRoot + "/model/completed.model.js");
const settingsDb= require(appRoot + "/model/settings.model.js");
const redoDb= require(appRoot + "/model/redo.model.js");



//staff team settings (this determins if staff work in team or individual)
const dutySettings = async (req, res)=>{
  let query = req.query.request
  // console.log(query)
  const setTeam = await settingsDb.updateOne({id:"info@wosiwosi.co.uk"},{
    $set:{
      team:query
    }
  })

  if(query == "false"){   //set everyone to false when settings change from team to individual
    const changeTeam = await User.updateMany({role:"staff"},{
      $set:{
        "team.status":false,
        duty:"packer"
      }
    })
  }else{ //settings changed from individual to team and 
    const changeTeam = await User.updateMany({role:"staff"},{
      $set:{
        // "team.status":true,
        duty:"packer"
      }
    })
  }
  res.redirect(req.headers.referer)
}

//change staff team
// const changeTeam = async (req, res)=>{  
//   let incominData = req.body.team
//   let teamAndId = incominData.split(' ')
//   let team = teamAndId[0]
//   let id = teamAndId[1]

//   const changeTeam = await User.updateOne({username:id},{
//     $set:{
//       "team.value": team
//     }
//   })

//   if(changeTeam.modifiedCount == 1){
//     res.send("true")
//   }else{
//     res.send('false')
//   }

// }

//change staff duty
const changeDuty = async (req, res)=>{  
  let incominData = req.body.duty
  let dutyAndId = incominData.split(' ')
  let duty = dutyAndId[0]
  let id = dutyAndId[1]

  const settings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
  //DONT CHANGE DUTY
  // if(settings.team == false){ // if it's individual, duty cannot be changed
  //   res.send(false)
  // }else{ 
    const changeDuty = await User.updateOne({username:id},{
      $set:{
        duty:duty
      }
    })
    if(changeDuty.modifiedCount == 1){
      res.send("true")
    }else{
      res.send('false')
    }
  // }
}

// pair staff
const pairStaff = async (req, res)=>{  
  let incominData = req.body.pair
  let mainAndPair = incominData.split(' ')
  let mainStaff = mainAndPair[0]
  let pairedStaff = mainAndPair[1]

  const findMainStaff = await User.findOne({username:mainStaff})
  const findPairedStaff = await User.findOne({username:pairedStaff})

  const teamValue=findMainStaff.fname.toLowerCase().slice(0,1) + findPairedStaff.fname.toLowerCase().slice(0,1) //make a team name from their first letter of fname

  // update to staff pair
  const updateMainStaff = await User.updateOne({username:mainStaff},{
    $set:{
      duty:"packer",
      team:{
        status:true,
        value:teamValue
      }
    }
  })
  // if main staff is updated, update the other person
  if(updateMainStaff.modifiedCount == 1){
      await User.updateOne({username:pairedStaff},{
        $set:{
          duty:'packer',
          team:{
            status:true,
            value:teamValue
          }
        }
      })
      res.send(true)
  }else{
    res.send(false)
  }
}

// unpair staff
const unpairStaff = async (req, res)=>{
  if(req.isAuthenticated()){
    console.log(req.query.request)
    await User.updateMany({"team.value":req.query.request},{
      $set:{
        team:{
          value:"",
          status:false
        }
      }
    })
    res.redirect(req.headers.referer)
  }else{  
    res.redirect("/")
  }
}

// order page
const renderOrderListPage = async (req, res) => {
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
    res.render("admin/order-list", {
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

// Ajax save order for processing 
const saveAllForProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    let data = req.body.data
    //safe data to databose
    for (const eachData of data){
      const checkSingleOrderDb = await singlOrder.findOne({orderNumber:eachData})
      if(!checkSingleOrderDb){ // if order does not exist in single order DB
        //check redundant DB
        const checkRedundantDb = await redundantDb.findOne({orderNumber:eachData})
        if(!checkRedundantDb){
          let saveOrder = new singleOrder({
            orderNumber:eachData,
            status:false,
            note:[],
            productPicked:[],
            meatPicker:{
                id:'',
                fname:'',
                active:false,
                time:'',
                status:false
            },
            dryPicker:{
              id:'',
              fname:'',
              active:false,
              time:'',
              status:false
            },
            packer:{
              id:'',
              fname:'',
              active:false,
              time:'',
              status:false
            },
            booking:{
                status:false
            }
          })
          await saveOrder.save() //save for processing
          console.log(eachData + " saved")
        }
        // else{console.log(eachData + " order exist in Redundant DB")}
      }
      // else{console.log(eachData + " order exist in singleOrderDB")}
    }
    res.send('Orders Saved')
  } else {
    res.send("Error! kindly refresh");
  }
};

// remove single order from the orders to be done that day
const removeFromOrder = async (req, res, next) => {
  if(req.isAuthenticated()){
    await singlOrder.deleteOne({orderNumber:req.query.order})
    await replaceDb.deleteOne({orderNumber:req.query.order})
    await refundDb.deleteOne({orderNumber:req.query.order})
    res.redirect('/processingorder')
  }else{
    res.redirect("/")
  }

};

//This function is used to remove workers details from previous order that wasnt sent, so that workers today can work on them
const resetWorker = async (req, res) =>{
  if(req.isAuthenticated()){
    await singlOrder.updateOne({orderNumber:req.query.order},{
      $set:{
        productPicked:[],
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
      }
   })
   res.redirect('/processingorder')
  }else{
    res.redirect("/")
  }
}

//Assign order to staff ajax
const assignStaffToOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    let orderNumber = req.body.orderNumber
    const staff = await User.findOne({username:req.body.staffId})
    const findOrder = await singleOrder.findOne({orderNumber:orderNumber})
    // console.log(staff.duty)
    if(staff){
      switch (staff.duty){
        case "meat-picker":
          await singleOrder.updateOne({orderNumber:orderNumber},{
            $set:{
              meatPicker:{
                id: staff.username,
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: false,
              }
            }
          })
          marryTeamWhenOneOtherIsClicked(findOrder)
          break;
        
        case "dry-picker":
          await singleOrder.updateOne({orderNumber:orderNumber},{
            $set:{
              dryPicker: {
                id: staff.username,
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: false,
              },
            }
          })
          marryTeamWhenOneOtherIsClicked(findOrder)
          break;
  
        case "packer":
          await singleOrder.updateOne({orderNumber:orderNumber},{
            $set:{
              packer: {
                id: staff.username,
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: false,
              },
            }
          })
          marryTeamWhenOneOtherIsClicked(findOrder)
          break;
        
        default:
          break
      }
      // If global settings team is false i.e staff works as an individual, check if staff has a partner or not and marry their both work
      //when any partner clicks an other, the other partner's details shows
      async function marryTeamWhenOneOtherIsClicked(orderData){
        const teamSetting = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
        if(teamSetting.team == false && staff.team.status == false){ // is now an individual system and no partner
          await singleOrder.updateOne({orderNumber:orderNumber},{
            $set: {
              meatPicker: {
                id: staff.username,
                // product:orderData.meatPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.meatPicker.status,
              },
              dryPicker:{
                id: staff.username,
                // product:orderData.dryPicker.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.dryPicker.status,
              },
              packer:{
                id: staff.username,
                // product:orderData.packer.product, //update product if user already had product marked and he left and come back again. the will not let ehe already marked order unmark
                fname:staff.fname,
                active: true,
                time: date.toJSON(),
                status: orderData.packer.status,
              }
            }
          })  
        }
      }
      res.send(true)
    }else{
      res.send(false)
    }
  }else{
    res.redirect('/')
  }
}

//lock order
const lockOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    orderNumber = req.query.order
    //reset worker and lock order
    await singlOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        lock:true,
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
      }
   })
   res.redirect(req.headers.referer)
  }else{
    res.redirect('/')
  }
}

// unlock order
const unlockOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    orderNumber = req.query.order
    //reset worker and lock order
    await singlOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        lock:false,
      }
   })
   res.redirect(req.headers.referer)
  }else{
    res.redirect('/')
  }
};

//clear note
const clearNote = async (req, res)=>{
  if(req.isAuthenticated()){
    orderNumber = req.query.order
    //reset worker and lock order
    await singlOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        note:[],
      }
   })
   res.redirect(req.headers.referer)
  }else{
    res.redirect('/')
  }
}

const hideProduct = async (req, res)=>{
  if(req.isAuthenticated()){
    const updateOrder = await singleOrder.updateOne({orderNumber:req.body.id}, {
      $set:{
        hideProduct:req.body.product
      }
    })
    res.send(true)
  }else{
    res.redirect("/")
  }
}

//undo order
const undoOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    const orderNumber = req.query.id
    //check single order DB if it exist there
    const checkSingleOrderDb = await singlOrder.findOne({orderNumber:orderNumber})
    if(checkSingleOrderDb){
     const update = await singlOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        status:false,
        productPicked:[],
        packer:{
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
        meatPicker:{
          id:"",
          fname:"",
          active:false,
          time:"",
          status:false
        }
      }
     })
      await refundDb.deleteOne({orderNumber:orderNumber})
      await replaceDb.deleteOne({orderNumber:orderNumber})
      await completedDb.deleteOne({orderNumber:orderNumber})
    }else{
      const checkRedundant = await redundantDb.findOne({orderNumber:orderNumber})
      if(checkRedundant){
        //resave it to order to be saved process
        let saveOrder = new singleOrder({
          orderNumber:orderNumber,
          status:false,
          note:[],
          productPicked:[],
          meatPicker:{
              id:'',
              fname:'',
              active:false,
              time:'',
              status:false
          },
          dryPicker:{
            id:'',
            fname:'',
            active:false,
            time:'',
            status:false
          },
          packer:{
            id:'',
            fname:'',
            active:false,
            time:'',
            status:false
          },
          booking:{
              status:false
          }
        })
        await saveOrder.save() //save for processing
        await redundantDb.deleteOne({orderNumber:orderNumber})
        await refundDb.deleteOne({orderNumber:orderNumber})
        await replaceDb.deleteOne({orderNumber:orderNumber})
        await completedDb.deleteOne({orderNumber:orderNumber})
      }
    }
    res.redirect(req.headers.referer)
  }else{
    res.redirect("/")
  }
}

//refund requests
const RenderRefundRequest = async (req, res)=>{
  if(req.isAuthenticated()){
  const refund = await  refundDb.find({close:false});
  res.render('admin/refund',{
    title:"Refund Requests",
    refund:refund
  })
}else{
  res.redirect('/')
}
}

// approve or rejest refund request
const requestOption = async (req, res)=>{
if(req.isAuthenticated()){
  let orderNumber = req.query.id;
  let productName = req.query.product
  let productQty = req.query.qty
  let productPrice = req.query.price

  const requestOption = req.params.option;
  await refundDb.updateOne({orderNumber:orderNumber},{
    $set:{
      status:true
    }
  }) // set status of rufund request as true to signifies that a respnse has be given and staff can be notify     
  switch(requestOption){
    // case refund approve
    case "approve-refund":
      await refundDb.updateOne({orderNumber:orderNumber, "product.productName":productName},{
        $set:{
          "product.$.status":true,
          "product.$.approval":true
        }
      })
      // const customer = await refundDb.findOne({orderNumber:orderNumber})
      //send refund mail
      // try{
      //   mailer.refundMail(customer.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", orderNumber, customer.customer_details.fname, productName, productQty, productPrice)
      // }catch(e){
      //   console.log(e)
      // }
      res.redirect(req.headers.referer)
      break;

      // refund rejected
      case "reject-refund":
        await refundDb.updateOne({orderNumber:orderNumber, "product.productName":productName},{
          $set:{
            "product.$.status":true,
          }
        })
        res.redirect(req.headers.referer)
        break;
        
        default:
          break;
    }
}else{
  res.redirect("/")
}
}

//replacement 
const renderReplacementPage= async (req, res)=>{
  if(req.isAuthenticated()){
    const replacement = await replaceDb.find()
    res.render('admin/replacement', {
      title:"Replacement",
      replace:replacement
    })
  }else{
    res.redirect('/')
  }
}

//notification
const renderNotificationPage = async (req, res)=>{
  if(req.isAuthenticated()){
    const notification = await notificationDb.find()
    res.render('admin/notification', {
      title:"Notification",
      notification:notification,
      user:req.user
    })
  }else{
    res.redirect('/')
  }
}

//ajax get notifications
const ajaxGetNotification = async (req, res)=>{
    const data = await notificationDb.find()
    res.send(data)
}

//notification mark as read
const markAsRead = async (req, res)=>{
  if(req.isAuthenticated()){
    const markNotification = await notificationDb.updateOne({notificationId:req.query.id},{
      $set:{
        readStatus:true
      }
  })
  res.redirect(req.headers.referer)
  }else{
    res.redirect('/')
  }
} 

//ajax get notifications
const ajaxGetRefundNotification = async (req, res)=>{
  const data = await refundDb.find()
  res.send(data)
}

//lock system
const lockSystem = async (req, res)=>{
  const request = await settingsDb.updateOne({id:"info@wosiwosi.co.uk"},{
    $set:{
      lock:true
    }
  })
  console.log("system locked")
  res.redirect(req.headers.referer)
}

//unlock system
const unlockSystem = async (req, res)=>{
  const request = await settingsDb.updateOne({id:"info@wosiwosi.co.uk"},{
    $set:{
      lock:false
    }
  })
  console.log("system unlocked")
  res.redirect(req.headers.referer)
}

//enableStaff
const enableStaff = async (req, res) =>{
    if(req.isAuthenticated()){
      const staff = await User.updateOne({username:req.query.staffId},{
        $set:{
          status:true
        }
      })
    res.redirect(req.headers.referer)
    }else{
      res.redirect("/")
    }
}

//disable staff
const disableStaff = async (req, res) =>{
  if(req.isAuthenticated()){
    const staff = await User.updateOne({username:req.query.staffId},{
      $set:{
        status:false
      }
    })
  res.redirect(req.headers.referer)
  }else{
    res.redirect("/")
  }
}

//redo order
const redoOrder = async (req, res)=>{
  console.log(req.body);
  const orderNumber = req.body.orderNumber
  //save data into an aray
  const data = {
    id:Math.floor(Math.random()*97423),
    date:date.toJSON(),
    comment:req.body.comment,
    exclude:req.body.unmark
  }
  //check if this order has been redone
  const isAvailable = await redoDb.findOne({orderNumber:orderNumber})
  if(isAvailable){
    //update that order number and push data to the data array
    const updateOrder = await redoDb.updateOne({orderNumber:orderNumber}, {
      $push:{
        data:data
      }
    })
    if(updateOrder.modifiedCount == 1){ //if updated, send true
      res.send(true)
    }
  }else{
    //save new redo
    const saveToRedo = new redoDb({
        orderNumber:orderNumber,
        data:[data]
    })
    await saveToRedo.save()
    res.send(true)
  }
}

// report page
const renderReportPage = async (req, res)=>{
  if(req.isAuthenticated()){
    res.render('admin/report',{
      title:"Report"
    })
  }else{
    res.redirect('/')
  }
}

const reportOption = async (req, res)=>{
  if(req.isAuthenticated()){
    param = req.params.param
    // let dateFilter = date.toJSON().slice(0,10)
    switch(param){
      case "staff-performance":
        const staffList = await User.find({role:"staff"})

        const orderList = await redundantDb.find({date:"2024-10-3"})
        let staffReport =[]

        // loog throught staff 
        for(const eachStaff of staffList){
          //creat object to hold details of what staff did
          let report ={
            id:"",
            fname:"",
            pick:[],
            meat:[],
            pack:[],
          }
          
          let staffId = eachStaff.username
          report.id = staffId //store staff username
          report.fname=eachStaff.fname
          for(const staffOrder of orderList){ //loop through order
            if(staffOrder.meatPicker.id == staffId){ //meat
              report.meat.push(staffOrder.orderNumber)
            }
            if(staffOrder.dryPicker.id == staffId){ //meat
              report.pick.push(staffOrder.orderNumber)
            }
            if(staffOrder.packer.id == staffId){ //meat
              report.pack.push(staffOrder.orderNumber)
            }
          }

          staffReport.push(report)
        }
        // console.log(staffReport)
        res.render('admin/staff-performance',{
          title:"Staff Performance",
          order:orderList,
          report:staffReport
        })
        break;
      default:
        break
    }
  }else{
    res.redirect("/")
  }
}

// report ajax
const reportAjax = async (req, res)=>{
  if(req.isAuthenticated()){
    let query = req.body.sort
    let data = req.body.data
    switch(query){
      // weekly sort
      case "week":
        let week = data.split(' ')
        getStaffData()
      break;

      // daily
      case "day":
        getStaffData(data)
      break;

      // default
      default:
        break
    }

    async function getStaffData(data) {
      const staffList = await User.find({role:"staff"})
      // let dataTosend = []
      let staffReport = []
      for(const eachDate of data){
        const orderList = await redundantDb.find({date:eachDate})
        for(const eachStaff of staffList){
          //creat object to hold details of what staff did
          let report ={
            id:"",
            fname:"",
            pick:[],
            meat:[],
            pack:[],
          }
          let staffId = eachStaff.username
          report.id = staffId //store staff username
          report.fname=eachStaff.fname
          for(const staffOrder of orderList){ //loop through order
            if(staffOrder.meatPicker.id == staffId){ //meat
              report.meat.push(staffOrder.orderNumber)
            }
            if(staffOrder.dryPicker.id == staffId){ //meat
              report.pick.push(staffOrder.orderNumber)
            }
            if(staffOrder.packer.id == staffId){ //meat
              report.pack.push(staffOrder.orderNumber)
            }
          }
          staffReport.push(report)
        }
      }
      console.log(staffReport)
    }

  }else{
    res.send(false)
  }
}




module.exports = {
  dutySettings:dutySettings,
  changeDuty:changeDuty,
  pairStaff:pairStaff,
  unpairStaff:unpairStaff,
  renderOrderListPage: renderOrderListPage,
  saveAllForProcessing: saveAllForProcessing,
  removeFromOrder: removeFromOrder,
  resetWorker:resetWorker,
  lockOrder:lockOrder,
  unlockOrder:unlockOrder,
  assignStaffToOrder:assignStaffToOrder,
  undoOrder:undoOrder,
  clearNote:clearNote,
  hideProduct:hideProduct,
  RenderRefundRequest:RenderRefundRequest,
  requestOption:requestOption,
  renderReplacementPage:renderReplacementPage,
  renderNotificationPage:renderNotificationPage,
  ajaxGetNotification:ajaxGetNotification,
  markAsRead:markAsRead,
  ajaxGetRefundNotification:ajaxGetRefundNotification,
  lockSystem:lockSystem,
  unlockSystem:unlockSystem,
  enableStaff:enableStaff,
  disableStaff:disableStaff,
  redoOrder:redoOrder,
  renderReportPage:renderReportPage,
  reportOption:reportOption,
  reportAjax:reportAjax,
};
