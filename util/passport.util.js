const appRoot = require("app-root-path");
const passport = require ('passport')
const express = require ('express')

const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const User = require (appRoot + "/model/userDb.model.js").User
const app = express()

app.use(passport.initialize());


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


module.exports =  passport
