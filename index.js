const express = require("express");
const app = express();
const fs = require("fs"); //writing to file intenal package
const port=process.env.PORT || 3000;
const nocache=require('nocache')
const WooCommerRestApi = require("@woocommerce/woocommerce-rest-api").default;

// require body parser
const bodyParser = require("body-parser");
// const { json } = require("body-parser"); // auto added
// const { response } = require("express"); //auto added
app.use(bodyParser.urlencoded({ extended: true }));

//ejs
app.set("view engine", "ejs");
app.use(express.json({ limit: "1mb" }));

//clear cache memory
app.use(nocache());

//access public diroctory and use static files (CSS JS )
app.use(express.static('public'));

//wooommerce api
const woocommerce = new WooCommerRestApi({
  url: "https://wosiwosi.co.uk",
  consumerKey: "ck_f41a79e671f0bd0194b53e96c45805e265a78bf1",
  consumerSecret: "cs_4368e2b1e72c226cfbc64197e76b57635cc7d233",
  version: "wc/v3",
});


const time = new Date();
let date = `${time.getDate()} / ${time.getMonth() + 1} / ${time.getFullYear()}`;

let dates, dates2;

// ?after=${dates}T00:00:00&before=${dates2}T23:59:59

//get the woocommerce order
woocommerce.get("orders", {
    per_page: 100, //number of order par page
    status: "completed", //select completed only
  })
  .then((response) => {
    order = response.data; // store response in order
  })
  .catch((error) => {
    console.log(error.response.data);
  });

// fucntion to log recent order
 function getOrders() {
  try {
    data = JSON.stringify(order);
    path = `${__dirname}/public/products.json`;
    fs.writeFile(path, data, (err) => {
      if (err) console.log(err);
      else {
        console.log("File written");
      }
    });
  } catch (er) {
    console.log("cannot get order");
  }
}

//fuction for sorting order by date
async function sortOrders(){
        console.log(dates);
        console.log(dates2)

      //sorted order
      woocommerce.get(`orders?after=${dates}T00:00:00&before=${dates2}T23:59:59`, {
        per_page: 100, //number of order par page
        status: "completed", //select completed only
      })  .then((response) => {
       sortOrder=response.data;
      //  console.log(sortOrder)
      })
      .catch((error) => {
        console.log("Not sorted");
      });

     setTimeout(() => {
      try {
        data = JSON.stringify(sortOrder);
        path = `${__dirname}/public/sortProducts.json`;
        fs.writeFile(path, data, (err) => {
          if (err) console.log(err);
          else {
            console.log("Sort written");
          }
        });
      } catch (er) {
        console.log(er);
      }
    }, 15000); 
    
}

// get requst from browser to lead homepage
app.get('/', (req, res) => {
  getOrders();
  res.sendFile(`${__dirname}/public/homer.html`); //access index.html
});

//Admin Operatons
// view all orders
app.get("/orderlist", (req, res) => {
  res.render("adminOrder", {});
});

// Admin view completed orders
app.get("/adminCompletedOrder", (req, res) => {
  res.sendFile(`${__dirname}/public/completedOrders.html`);
});

//Handle Post  request Login from homepage
app.post("/user", (req, res) => {
  let user = req.body.username;
  let selected = req.body.selector;
  // console.log(selected);

  let userName = user;
  let accessAs = selected;
  const data = {
    name: userName,
    position: accessAs,
  };
  const path = `${__dirname}/public/currentUser.json`;
  fs.writeFile(path, JSON.stringify(data), (error) => {
    if (error) console.log("User not loged");
    console.log("User saved");
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
app.get("/logout", (req, res) => {
  res.redirect("/"); //access index.html
  // res.clearCookie();
});

//staff completed an order
app.post("/complete", (req, res) => {
  console.log(req.body);
  let data = fs.readFileSync(`${__dirname}/public/activity.json`);
  let myArray = JSON.parse(data);
  let newData = req.body;
  myArray.unshift(newData);

  let finalData = JSON.stringify(myArray);
  const path = `${__dirname}/public/activity.json`;
  fs.writeFile(path, finalData, (err) => {
    if (err) console.log(err);
    console.log("front page file written");
  });

  // res.sendFile(`${__dirname}/public/index.html`);//access index.html
});

// sort order by day
app.post("/dateSort", (req, res)=>{
  console.log(req.body);
  dates=req.body.from;
  dates2=req.body.to;
  sortOrders();
  // finalOrderSorting();
  res.send();
});

//post request from web page for single order
app.post('/getSingleOrder', (req, res)=>{
  let requester=req.body.orderNumber;
      console.log(requester);
        woocommerce.get(`orders/${requester}`)
        .then((response) => {
          anOrder= response.data;// store response in order

          //save retrieved an order to picker.json
          let path=`${__dirname}/public/singleOrder.json`;
          let anData=JSON.stringify(anOrder);
          fs.writeFile(path,anData, (err)=>{
          if (err) {console.log("cannot get single order")}
          else {console.log("Single Order saved")}
          });
        });

      res.render('singleOrderPage',{
      logDate: date
      });
})

// //grap each customer request
app.get("/singleOrderPage", (req, res)=>{
//     console.log (`the param is${req.params.id}`);
//       // let requester=req.url;
//       // console.log(requester);
      
//       //   woocommerce.get(`orders${requester}`)
//       //   .then((response) => {
//       //     anOrder= response.data;// store response in order

//       //     //save retrieved an order to picker.json
//       //     let path=`${__dirname}/singleOrder.json`;
//       //     let anData=JSON.stringify(anOrder);
//       //     fs.writeFile(path,anData, (err)=>{
//       //     if (err) {console.log("cannot get single order")}
//       //     else {console.log("Single Order saved")}
//       //     });
//       //   });
      res.render('singleOrderPage',{
      logDate: date
      });
    });

app.listen(port, () => {
  console.log("Server started");
});