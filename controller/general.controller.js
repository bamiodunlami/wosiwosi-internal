const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);


const User = require (appRoot + "/model/userDb.model.js").User

const renderHome =  (req, res)=>{
    if(req.isAuthenticated()){
        if(req.user.role ==="admin"){
            res.redirect('/admin')
        }else{

        }
    }else{
        res.render('general/index',{
            title:"Home"
        })
    }
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

// login
const login = async  (req, res)=>{
    if(req.user.role =="admin"){
        res.redirect('/admin')
    }else{
        // console.log("user")
        res.redirect('/user')
    }
}

module.exports ={
    renderHome:renderHome,
    registerUser:registerUser,
    login:login
}