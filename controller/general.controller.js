const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);


const User = require (appRoot + "/model/userDb.model.js").User

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
        username:"pat",
        fname:"Patrick",
        lname:"Odume"
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
    console.log("Walkie Talkie")
}

// Export module
module.exports ={
    renderHome:renderHome,
    registerUser:registerUser,
    loginPage:loginPage,
    loginRedirect:loginRedirect,
    walkieTalkie:walkieTalkie
}