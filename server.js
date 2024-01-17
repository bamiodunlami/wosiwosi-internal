require('dotenv').config();
 express = require("express");
const app = express();

const adminRoute =  require(`${__dirname}/router/admin.router.js`)


const port=process.env.PORT || 3000;


// require body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//ejs
app.set("view engine", "ejs");

app.use(express.json({ limit: "1mb" }));

//access public diroctory and use static files (CSS JS )
app.use(express.static('public'));

app.use(adminRoute)



// 404
app.use((req, res)=>{
  res.redirect('/admin')
})



app.listen(port, () => {
  // console.log("Server started");
});