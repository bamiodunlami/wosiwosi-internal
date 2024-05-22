const appRoot = require ("app-root-path")
const path = require ("path")
const rootPath = path.resolve(process.cwd())
appRoot.setPath(rootPath)

const passport = require (appRoot + "/util/passport.util.js")

const User = require(appRoot + "/model/user.model.js")

const woo= require (appRoot + "/util/woo.util.js")

const mailer = require (appRoot + "/util/mailer.util.js")

// influencer dashboard
const influencerDashboard = async (req, res)=>{
    if(req.isAuthenticated()){
        if(req.user.passChange == true){ //if influencer changed password
            const coupon = await woo.get(`coupons/${req.user.id}`,{
            })
            res.render('influencer/dashboard', {
                title:"Influencer",
                user:req.user,
                coupon:coupon
            })
        }else{
            res.redirect('/changepassword') //if influencer hasnt changed password
        }
    }else{
        res.redirect("/")
    }
}

// coupon used by
const usedBy = async (req, res)=>{
    if(req.isAuthenticated()){
        // console.log(req.query.number)
        try{
            const customer = await woo.get(`customers/${req.query.number}`)
            // console.log(customer)
            res.render("influencer/order",{
                title:"Used By",
                customer:customer
            })
        }catch(e){
            res.redirect(req.headers.referer)
        }

    }else{
        res.redirect("/")
    }

}

const influencerRedeem = async (req, res)=>{
   if(req.isAuthenticated()){
    res.send("ok");
    mailer.redeemRequest(req.user.username, "bamidele@wosiwosi.co.uk, odunlamibamidelejohn@gmail.com", req.user.fname, req.user.bonus*req.user.bonusType)
   }else(
    res.redirect("/")
   )
}

module.exports={
    influencerDashboard:influencerDashboard,
    usedBy:usedBy,
    influencerRedeem:influencerRedeem,
}