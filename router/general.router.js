const express = require ('express')
const router = express.Router()

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const passport = require (appRoot + '/util/passport.util.js')
const general = require (appRoot + "/controller/general.controller.js")

router
.post ('/user', general.pullUser)
.get('/', general.renderHome) //render login home
.get('/reg', general.registerUser ) //redner register page
.get("/login", general.loginPage) // render login page
.post('/login', passport.authenticate("local", {failureRedirect:"/", failureFlash:true}), general.loginRedirect) //handle login 
.get('/walkietalkie', general.walkieTalkie)
.post('/walkietalkie', general.walkieTalkieSign)



.get('/logout', (req, res)=>{
    req.logout((err) => {
        if (err) {
        }
        res.redirect("/");
      });
})

module.exports=router