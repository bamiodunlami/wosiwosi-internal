const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const date = new Date()

const User = require (appRoot + "/model/userDb.model.js").User
// const otherDB = require (appRoot + "/model/otherDb.model.js")

// user post request
const pullUser = async (req, res)=>{
    // console.log(date.toJSON().slice(11,19))
    const user = await User.findOne({username:req.body.user})
    res.json(user)
}

// home
const renderHome =  (req, res)=>{
    res.render('general/home',{
    title:"Home"
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

// register
const registerUser = async (req, res)=>{
    const newUser = {
        username:"liton",
        fname:"Liton",
        lname:"Last Name"
    }
    await User.register(newUser, "pat1", (err, user)=>{
        if(err) {
            console.log("Error")
        }else{
            res.redirect('/')
        }
    } )
}

// render login page
const loginPage = (req, res)=>{
    res.render("general/login", {
        title:"Login"
    });
}

// login redirect
const loginRedirect = async  (req, res)=>{
    if(req.user.role =="admin"){
        res.redirect('/admin')
    }else{
        // console.log("user")
        res.redirect('/user')
    }
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

// Export module
module.exports ={
    pullUser:pullUser,
    renderHome:renderHome,
    registerUser:registerUser,
    loginPage:loginPage,
    loginRedirect:loginRedirect,
    walkieTalkie:walkieTalkie,
    walkieTalkieSign:walkieTalkieSign
}