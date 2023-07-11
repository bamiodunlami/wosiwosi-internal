const express = require ('express')
const router = express.Router()

const fs = require("fs"); //writing to file intenal package

const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath =  path.resolve(process.cwd());
appRoot.setPath(rootpath);

const woocommerce = require (appRoot + '/controller/woo.js')
const woo = woocommerce.singleOrder

const time = new Date();
let date = `${time.getDate()} / ${time.getMonth() + 1} / ${time.getFullYear()}`;


//OTHER OPERATIONS
//Handle Post  request Login from homepage

router.post("/user", (req, res) => {
  let user = req.body.username;
  let selected = req.body.selector;
  console.log(selected);
  // console.log(user);

  let userName = user;
  let accessAs = selected;
  const data = {
    name: userName,
    position: accessAs,
  };
  const path = rootpath + '/public/currentUser.json';
  fs.writeFile(path, JSON.stringify(data), (error) => {
    if (error) console.log("User not loged");
    // console.log("User saved");
  });

  if (selected === "Picker") {
    res.render("genOrderPage", {
      logOffice: selected,
      logUser: user,
      logDate: date,
    });
  } else if (selected === "Admin" && user == "admin") {
    //for the admin page
    res.render("admin", {
      logOffice: selected,
      logUser: user,
      logDate: date,
    });
    // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
  } else if (selected === "Packer") {
    res.render("genOrderPage", {
      logOffice: selected,
      logUser: user,
      logDate: date,
    });
    // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
  } else if (selected === "Cutter") {
    res.render("genOrderPage", {
      logOffice: selected,
      logUser: user,
      logDate: date,
    });
    // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
  } else {
    res.send("No access");
  }
});

//logout
router.get("/logout", (req, res) => {
  res.redirect("/"); //access index.html
  // res.clearCookie();
});

//staff completed an order
router.post("/complete", (req, res) => {
  console.log(req.body);
  let data = fs.readFileSync(rootpath + 'public/activity.json');
  let myArray = JSON.parse(data);
  let newData = req.body;
  myArray.unshift(newData);

  let finalData = JSON.stringify(myArray);
  const path = rootpath + '/public/activity.json';
  fs.writeFile(path, finalData, (err) => {
    if (err) console.log(err);
    console.log("front page file written");
  });

  // res.redirect('/')
  // res.sendFile(`${__dirname}/public/index.html`);//access index.html
});


// sort order by day
router.post("/dateSort", (req, res)=>{
  console.log(req.body);
  dates=req.body.from;
  dates2=req.body.to;
  timer1=req.body.timing1;
  timer2=req.body.timing2;
  sortOrders();
  // finalOrderSorting();
  res.send();
});


//grap each customer request
router.get("/singleOrder", (req, res)=>{
    let requester = req.query.on
    woo(requester)
    res.render('singleOrderPage',{
    logDate: date
    });
});


module.exports=router