const appRoot = require("app-root-path");
const path = require("path");

const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const date = new Date() //date

const passport = require (appRoot + '/util/passport.util.js') //passport

const User = require (appRoot + "/model/user.model.js") //db

const mailer = require (appRoot + "/util/mailer.util.js")


// user post request
const pullUser = async (req, res)=>{
    // console.log(date.toJSON().slice(11,19))
    const user = await User.findOne({username:req.body.user})
    res.json(user)
}

// home
const renderHome =  (req, res)=>{
    res.render('general/login',{
    title:"Login"
    })
    // if(req.isAuthenticated()){
    //     if(req.user.role ==="admin"){
    //         res.redirect('/admin')
    //     }else{

    //     }
    // }else{
    //     res.render('general/index',{
    //         title:"Home"
    //     })
    // }
}

// login redirect
const loginRedirect = async  (req, res)=>{
    if(req.user.role =="admin"){
        res.redirect('/admin')
    }else if (req.user.role =="staff"){
        res.redirect('/user')
    } else if(req.user.role =="influencer"){
        res.redirect('/influencer')
    }
}

// register
const registerUser = async (req, res)=>{
    const newUser = {
        username:"odunlamibamidelejohn@gmail.com",
        fname:"Bamidele",
        lname:"Odunlami",
        role:"admin",
        status:true,
        walkieTalkie:{
          number:4,
          date:"",
          takeTime:"",
          returnTime:"",
          status:"true"
        },
        active:true,
        level:6,
        passChange:true
    }
    await User.register(newUser, "Abosede1234@@", (err, user)=>{
        if(err) {
            console.log("Error")
        }else{
            res.redirect('/')
        }
    } )
}

//render walkie talkie page
const walkieTalkie = async (req, res)=>{
    const user = await User.find({})
    // console.log(user[1].walkieTalkie.number)
   res.render("general/walkie",{
    title:"Walkie Talkie",
    user:user
   })
}

// walkie talkie signing
const walkieTalkieSign = async (req, res) =>{
    if(req.body.status == "false"){
        const user = await User.updateOne({username:req.body.user},{
            $set:{
               "walkieTalkie.status":false,
               "walkieTalkie.date":date.toJSON().slice(0, 20),
               "walkieTalkie.takeTime":date.toJSON().slice(11, 19)
            }
        })
    }else{
        const user = await User.updateOne({username:req.body.user},{
            $set:{
               "walkieTalkie.status":true,
               "walkieTalkie.date":date.toJSON().slice(0, 20),
               "walkieTalkie.returnTime":date.toJSON().slice(11, 19)
            }
        })
    }
    res.render("general/success", {
        title:"success"
    })
}

// render change password
const renderChangePassword = async (req, res)=>{
    if(req.isAuthenticated()){
        res.render('general/change-password', {
            title:"Change Password"
        })
    }else{
        res.redirect('/')
    }
}

// handle password change
const changePassword = async (req, res)=>{

    if(req.isAuthenticated()){
        const findUser = await User.findOne({username:req.user.username, role:"influencer"})
        const saveNewPassword = await findUser.setPassword(req.body.password);
        await saveNewPassword.save()

        // change passwordBoolean if password changed
        if(saveNewPassword){
            const updatePasswordBool = await User.updateOne({username:req.user.username},{
                $set:{
                    passChange:true
                }
            }) //find user and update bool
            // console.log(updatePasswordBool) //log respoonse
            mailer.passwordChange( req.user.username,"media@wosiwosi.co.uk", req.user.fname); //send mail
            res.render("general/success", {
                title:"success"
            }) //redirect to success page
            req.session.destroy()//destroy session
        }else{
            req.session.destroy()
        }
    }else{
        req.redirect('/')
    }
}


// Export module
module.exports ={
    pullUser:pullUser,
    renderHome:renderHome,
    registerUser:registerUser,
    loginRedirect:loginRedirect,
    walkieTalkie:walkieTalkie,
    walkieTalkieSign:walkieTalkieSign,
    renderChangePassword:renderChangePassword,
    changePassword:changePassword,
}