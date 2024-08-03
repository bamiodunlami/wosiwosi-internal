const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const fs = require("fs");
const date = new Date();
const passport = require(appRoot + "/util/passport.util.js");
const User = require(appRoot + "/model/user.model.js");
const woocommerce = require(appRoot + "/util/woo.util.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const singlOrder = require(appRoot + "/model/order.model.js")
const replaceDb= require(appRoot + "/model/replace.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");
const notificationDb= require(appRoot + "/model/notification.model.js");

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
        res.render("admin/staff", {
          user:req.user,
          title:"Staff",
          staff:staff
        })
      // default
      default:
        break;
    }
  } else {
    res.redirect("/");
  }
};


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


// (Ajax call from order.js) this is used to check and mark orders that are already saved for processing in the admin order page
const retrieveSavedForProcessing = async (req, res) => {
  if (req.isAuthenticated()) {
    const path = appRoot + "/public/data/orderToProcess.json";
    fs.readFile(path, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(data); //send data to frontend
      }
    });
  } else {
    res.redirect("/");
  }
};

// save order for processing
const saveAllForProcessing = (req, res) => {
  if (req.isAuthenticated()) {
    // console.log(req.body)
    let path = appRoot + "/public/data/orderToProcess.json";
    // first read the json of path
    fs.readFile(path, (err, data) => {
      if (err) {
        console.log("error reading data" + err);
        res.send("Error! kindly refresh");
      } else {
        let formerData = JSON.parse(data);
        let newData = [...new Set([...formerData, ...req.body.data])]; //merge without duplicate

        // // Override what is currently in orderToProcess.json file
        fs.writeFile(path, JSON.stringify(newData), (err) => {
          if (err) {
            console.log("error writing data" + err);
            res.send("Error! kindly refresh");
          } else {
            res.send("Orders Saved");
          }
        });
      }
    });
  } else {
    res.send("Error! kindly refresh");
  }
};

// remove single order from the orders to be done that day
const removeFromOrder = async (req, res, next) => {
  if(req.isAuthenticated()){
    const removeOrderFromDb = await singlOrder.deleteOne({orderNumber:req.query.order})
    const path = appRoot + "/public/data/orderToProcess.json";
    fs.readFile(path, (err, data)=>{ //read file availalble
      if(err){
        console.log(err);
        res.redirect(req.headers.referer)
      }else{
        const orderToProcess = JSON.parse(data)
        const orderNumberToRemove = req.query.order;
        // remove the order numver from the arrau
        const newOrderToProcess = orderToProcess.filter((order) =>{ 
          return order !== orderNumberToRemove
        })
        // rewrite the file to order to process
        fs.writeFile(path, JSON.stringify(newOrderToProcess), (err)=>{
          if(err) console.log(err)
            res.redirect('/processingorder')
        })

      }
    });
  }else{
    res.redirect("/")
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

// clear board
const clearBoard = async (req, res)=>{
  if(req.isAuthenticated()){
    const path = appRoot + "/public/data/orderToProcess.json";
    const data =""
    fs.writeFile(path, JSON.stringify(data), (err)=>{
      if(err) console.log(err)
        res.redirect(req.headers.referer)
    })
  }else{
    res.redirect('/')
  }
}

//undo order
const undoOrder = async (req, res)=>{
  if(req.isAuthenticated()){
    const orderNumber = req.query.id
     await singlOrder.deleteOne({orderNumber:orderNumber})
      await refundDb.deleteOne({orderNumber:orderNumber})
      await replaceDb.deleteOne({orderNumber:orderNumber})
      res.redirect(req.headers.referer)
  }else{
    res.redirect("/")
  }
}

//refund requests
const RenderRefundRequest = async (req, res)=>{
  if(req.isAuthenticated()){
  const refund = await  refundDb.find();
  res.render('admin/refund',{
    title:"Refund Requests",
    refund:refund
  })
}else{
  res.redirect('/')
}
}

// approve request
const requestOption = async (req, res)=>{
if(req.isAuthenticated()){
  let orderNumber = req.query.id;
  let productName = req.query.product
  let productQty = req.query.qty
  let productPrice = req.query.price

  const requestOption = req.params.option;     
  switch(requestOption){
    // case refund approve
    case "approve-refund":
      await refundDb.updateOne({orderNumber:orderNumber, "product.productName":productName},{
        $set:{
          "product.$.status":true,
          "product.$.approval":true
        }
      })
      const customer = await refundDb.findOne({orderNumber:orderNumber})
      // mailer.refundMail("odunlamibamidelejohn@gmail.com","bamidele@wosiwosi.co.uk", customer.customer_details.fname, productName, productQty, productPrice)
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

module.exports = {
  adminDashboard: adminDashboard,
  adminOperation: adminOperation,
  renderOrderListPage: renderOrderListPage,
  retrieveSavedForProcessing: retrieveSavedForProcessing,
  saveAllForProcessing: saveAllForProcessing,
  clearBoard:clearBoard,
  removeFromOrder: removeFromOrder,
  createInfluencer: createInfluencer,
  undoOrder:undoOrder,
  RenderRefundRequest:RenderRefundRequest,
  requestOption:requestOption,
  renderReplacementPage:renderReplacementPage,
  renderNotificationPage:renderNotificationPage,
  ajaxGetNotification:ajaxGetNotification
};
