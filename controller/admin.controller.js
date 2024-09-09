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
const notificationDb= require(appRoot + "/model/notification.model.js");
const completedDb= require(appRoot + "/model/completed.model.js");
const settingsDb= require(appRoot + "/model/settings.model.js");

// AJAX CALL
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

// online centre
const adminOperation = async (req, res) => {
  if (req.isAuthenticated()) {
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
          user:req.user
        });

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
      // default
      default:
        break;
    }
  } else {
    res.redirect("/");
  }
};

//staff team settings (this determins if team work in group or individual)
const dutySettings = async (req, res)=>{
  let query = req.query.request
  // console.log(query)
  const setTeam = await settingsDb.updateOne({id:"info@wosiwosi.co.uk"},{
    $set:{
      team:query
    }
  })

  //set everyone to false when settings change from team to individual, this will help staff select their own duty again when it is switched back to team
  if(query == "false"){
    const changeTeam = await User.updateMany({role:"staff"},{
      $set:{
        "team.status":false,
        duty:"packer"
      }
    })
  }else{ //settings changed from individual to team
    const changeTeam = await User.updateMany({role:"staff"},{
      $set:{
        duty:""
      }
    })
  }

  res.redirect(req.headers.referer)
}

//change staff team
const changeTeam = async (req, res)=>{  
  let incominData = req.body.team
  let teamAndId = incominData.split(' ')
  let team = teamAndId[0]
  let id = teamAndId[1]

  const changeTeam = await User.updateOne({username:id},{
    $set:{
      "team.value": team
    }
  })

  if(changeTeam.modifiedCount == 1){
    res.send("true")
  }else{
    res.send('false')
  }

}

//change staff duty
const changeDuty = async (req, res)=>{  
  let incominData = req.body.duty
  let dutyAndId = incominData.split(' ')
  let duty = dutyAndId[0]
  let id = dutyAndId[1]

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
    // console.log(data)
    //safe data to databose
    for (const eachData of data){
      const order = await singlOrder.findOne({orderNumber:eachData})
      if(!order){
        let saveOrder = new singleOrder({
          orderNumber:eachData,
          status:false,
          note:[],
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
        await saveOrder.save()
      }
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
    console.log(staff.duty)
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
          break;
        
        default:
          break
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

//undo order
const undoOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    const orderNumber = req.query.id
     const update = await singlOrder.updateOne({orderNumber:orderNumber},{
      $set:{
        status:false,
        packer:{
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

module.exports = {
  adminDashboard: adminDashboard,
  adminOperation: adminOperation,
  dutySettings:dutySettings,
  changeTeam:changeTeam,
  changeDuty:changeDuty,
  renderOrderListPage: renderOrderListPage,
  saveAllForProcessing: saveAllForProcessing,
  removeFromOrder: removeFromOrder,
  resetWorker:resetWorker,
  lockOrder:lockOrder,
  unlockOrder:unlockOrder,
  assignStaffToOrder:assignStaffToOrder,
  createInfluencer: createInfluencer,
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
};
