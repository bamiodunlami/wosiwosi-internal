const express = require ('express')
const router = express.Router()

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const passport = require (appRoot + '/util/passport.util.js')
const general = require (appRoot + "/controller/general.controller.js")
const User = require(appRoot + "/model/user.model.js")

router
.post ('/user', general.pullUser) //AJAX send all staff details
// .post('/note-notification', general.noteNotification)

.get('/', general.renderHome) //render login home

.get('/reg', general.registerUser ) //redner register page

.post('/login', passport.authenticate("local", {failureRedirect:"/", failureFlash:true}), general.loginRedirect) //handle login 

.get('/walkietalkie', general.walkieTalkie) //render walkie talkie page

.post('/walkietalkie', general.walkieTalkieSign)//walkie talkie sign in

.get("/resetpassword", general.forgotPassword) //forget password

.get('/changepassword', general.renderChangePassword) // render change password page for first login

.post('/changepassword', general.changePassword) // Change first login user password

.get('/logout', (req, res)=>{
    req.logout((err) => {
        if (err) {
        }
        res.redirect("/");
      });
})

module.exports=router