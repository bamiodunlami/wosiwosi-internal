const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const User = require(appRoot + "/model/user.model.js");
const passport = require(appRoot + "/util/passport.util.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const notificationDb= require(appRoot + "/model/notification.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");

// rendert staff dashboard
const renderStaffPage = async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.passChange != true) {
      //if it's first time login
      res.redirect("/changepassword"); //for to chanage passowd
    } else {
      res.render("staff/staff-home", {
        title: "Staff",
        staff: req.user,
      });
    }
  } else {
    res.redirect("/");
  }
};

const staffDashboardRequest = async (req, res) => {
  if(req.isAuthenticated()){

    let request = req.params.request;
    switch (request){

        // online centre
        case 'online':
            res.render("staff/online-centre", { //render online center page
                title: "Online Center",
              });
            break
        
            case "my-profile":
              const staff = await User.findOne({username:req.user.username});
              res.render("staff/staff-profile",{
                title:"Staff Profile",
                staff:staff
              })
              break;

        default:
            break;
    }
  }else{
    res.redirect('/')
  }
};

//mark refund notification a read
const markRefundNotificationAsRead = async (req, res)=>{
  if(req.isAuthenticated()){
    const markRefundRead = await refundDb.updateOne({orderNumber:req.query.id},{
      $set:{
        readStatus:true
      }
    })
    res.redirect(`/single-order-processing?id=${req.query.id}`)
  }else{
    res.redirect('/')
  }
}

module.exports = {
  renderStaffPage: renderStaffPage,
  staffDashboardRequest: staffDashboardRequest,
  markRefundNotificationAsRead:markRefundNotificationAsRead
};
