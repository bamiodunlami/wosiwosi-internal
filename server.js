require('dotenv').config();
 express = require("express");
const app = express();
const passport =  require(`${__dirname}/util/passport.util.js`)
const session = require ('express-session')
const flash = require ('express-flash')

const filter = require ('content-filter');

let blackList = ['$','{','&&','||', '}']
let options = {
    urlBlackList: blackList,
    bodyBlackList: blackList,
}

const adminRoute =  require(`${__dirname}/router/admin.router.js`)
const pickerRoute =  require(`${__dirname}/router/picker.router.js`)
const generalRoute =  require(`${__dirname}/router/general.router.js`)
const influencerRoute = require(`${__dirname}/router/influencer.router.js`)

const port=process.env.PORT || 3000;

// require body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//ejs
app.set("view engine", "ejs");

app.use(express.json({ limit: "1mb" }));
app.use(express.static('public'));
app.use(filter(options));

app.use(session({
  secret: process.env.SESSION_KEY,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge:300000 }
}));
app.use(passport.session())
app.use(flash());



app.use(adminRoute)
app.use(generalRoute)
app.use(pickerRoute)
app.use(influencerRoute)



// 404
app.use((req, res)=>{
  // console.log("404")
  res.send("404 page not available")
})



app.listen(port, () => {
  console.log("Server started on " + port);
});