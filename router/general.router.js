const express = require ('express')
const router = express.Router()

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const passport = require (appRoot + '/util/passport.util.js')
const general = require (appRoot + "/controller/general.controller.js")

router
.get('/', general.renderHome)
.get('/reg', general.registerUser )
.post('/login', passport.authenticate("local", {failureRedirect:"/", failureFlash:true}), general.login)
.get('/logout', (req, res)=>{
    req.logout((err) => {
        if (err) {
        }
        res.redirect("/");
      });
})

module.exports=router