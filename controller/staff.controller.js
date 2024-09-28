const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const User = require(appRoot + "/model/user.model.js");
const passport = require(appRoot + "/util/passport.util.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const notificationDb= require(appRoot + "/model/notification.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");
const settingsDb= require(appRoot + "/model/settings.model.js");

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
            user:req.user,
              title: "Online Center",
          });
        // LET USER SELECT DUTY OR PARTNER
          // const checkSettings = await settingsDb.findOne({id:"info@wosiwosi.co.uk"})
          // if(checkSettings.team == false && req.user.team.status == false){ //if it's individual mode,and currnt user has no team, then ask if worker will like to pair
          //   res.redirect("/select-team")
          // }else{
          //   res.render("staff/online-centre", { //render online center page
          //     user:req.user,
          //       title: "Online Center",
          //   });
          // }
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

//render staff duty change page
const renderStaffSelectTeamPage = async (req, res)=>{
  if(req.isAuthenticated()){
    const userInSameTeam = await User.find({"team.value":req.user.team.value})
    res.render('staff/my-duty',{
      title:"Select Duty",
      team:userInSameTeam,
      user:req.user
    })
  }else{
    res.redirect('/')
  }
}

// duty change request
const dutyChangeRequest = async (req, res)=>{
  if(req.isAuthenticated()){
    let incominData = req.body.duty
    let dutyAndId = incominData.split(' ')
    let duty = dutyAndId[0]
    let id = dutyAndId[1]

    const checkDuty = await User.find({"team.value":req.user.team.value, duty:duty})
    // console.log(checkDuty)
    if(checkDuty.length > 0){
      res.send('false')
    }else{
      const changeDuty = await User.updateOne({username:id},{
        $set:{
          duty:duty
        }
      })
      if(changeDuty.modifiedCount == 1){
        await User.updateOne({username:req.user.username},{
          $set:{
            "team.status":true
          }
        })
          res.send("true")
      }else{
        res.send('false')
      }
    }

  }else{
    res.redirect('/')
  }
}

module.exports = {
  renderStaffPage: renderStaffPage,
  staffDashboardRequest: staffDashboardRequest,
  markRefundNotificationAsRead:markRefundNotificationAsRead,
  renderStaffSelectTeamPage:renderStaffSelectTeamPage,
  dutyChangeRequest:dutyChangeRequest,
};
