require('dotenv').config();
const express = require("express");
const app = express();

const mainRoute =  require(`${__dirname}/router/main.js`)
const adminRoute =  require(`${__dirname}/router/admin.js`)


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
app.use(mainRoute)


// const time = new Date();
// let date = `${time.getDate()} / ${time.getMonth() + 1} / ${time.getFullYear()}`;

// let dates, dates2, timer1, timer2;

// // ?after=${dates}T00:00:00&before=${dates2}T23:59:59


// //fuction for sorting order by date
// async function sortOrders(){
//         console.log(dates);
//         console.log(dates2);
//         console.log(timer1);
//         console.log(timer2);

//       //sorted order
//       woocommerce.get(`orders?after=${dates}T${timer1}:00&before=${dates2}T${timer2}:59`, {
//         per_page: 100, //number of order par page
//         status: "completed processing", //select completed only
//       })  .then((response) => {
//        sortOrder=response.data;
//       //  console.log(sortOrder)
//       })
//       .catch((error) => {
//         console.log("Not sorted");
//       });

//      setTimeout(() => {
//       try {
//         data = JSON.stringify(sortOrder);
//         path = `${__dirname}/public/sortProducts.json`;
//         fs.writeFile(path, data, (err) => {
//           if (err) console.log(err);
//           else {
//             console.log("Sort written");
//           }
//         });
//       } catch (er) {
//         console.log(er);
//       }
//     }, 15000); 
    
// }

// //admin settings order preferences
// async function sortOrders2(){
//   console.log(dates);
//   console.log(dates2);
//   console.log(timer1);
//   console.log(timer2);

// //sorted order
// woocommerce.get(`orders?after=${dates}T${timer1}:00&before=${dates2}T${timer2}:59`, {
//   per_page: 100, //number of order par page
//   status: "completed processing", //select completed only
// })  .then((response) => {
//  sortOrder=response.data;
// //  console.log(sortOrder)
// })
// .catch((error) => {
//   console.log("Not sorted");
// });

// setTimeout(() => {
// try {
//   data = JSON.stringify(sortOrder);
//   path = `${__dirname}/public/adminsettings.json`;
//   fs.writeFile(path, data, (err) => {
//     if (err) console.log(err);
//     else {
//       console.log("Sort written");
//     }
//   });
// } catch (er) {
//   console.log(er);
// }
// }, 15000); 

// }



// app.post('/sendPerformance', (req, res)=>{
//   console.log(req.body);
//   let perf=fs.readFileSync(`${__dirname}/public/performance.json`);
//   let NewPerfArray=JSON.parse(perf);
//   let newData = req.body;
//   NewPerfArray.unshift(newData);

//   let newPafData = JSON.stringify(NewPerfArray);
//   const path = `${__dirname}/public/performance.json`;
//   fs.writeFile(path, newPafData, (err) => {
//     if (err) console.log(err);
//     console.log("Perfomance Writen");
//   });

// });




//OTHER OPERATIONS
//Handle Post  request Login from homepage
// app.post("/user", (req, res) => {
//   let user = req.body.username;
//   let selected = req.body.selector;
//   console.log(selected);
//   // console.log(user);

//   let userName = user;
//   let accessAs = selected;
//   const data = {
//     name: userName,
//     position: accessAs,
//   };
//   const path = `${__dirname}/public/currentUser.json`;
//   fs.writeFile(path, JSON.stringify(data), (error) => {
//     if (error) console.log("User not loged");
//     // console.log("User saved");
//   });

//   if (selected === "Picker") {
//     res.render("genOrderPage", {
//       logOffice: selected,
//       logUser: user,
//       logDate: date,
//     });
//   } else if (selected === "Admin" && user == "admin") {
//     //for the admin page
//     res.render("admin", {
//       logOffice: selected,
//       logUser: user,
//       logDate: date,
//     });
//     // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
//   } else if (selected === "Packer") {
//     res.render("genOrderPage", {
//       logOffice: selected,
//       logUser: user,
//       logDate: date,
//     });
//     // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
//   } else if (selected === "Cutter") {
//     res.render("genOrderPage", {
//       logOffice: selected,
//       logUser: user,
//       logDate: date,
//     });
//     // res.sendFile(`${__dirname}/public/genOrderPage.html`);//access index.html
//   } else {
//     res.send("No access");
//   }
// });


// //logout
// app.get("/logout", (req, res) => {
//   res.redirect("/"); //access index.html
//   // res.clearCookie();
// });

// //staff completed an order
// app.post("/complete", (req, res) => {
//   console.log(req.body);
//   let data = fs.readFileSync(`${__dirname}/public/activity.json`);
//   let myArray = JSON.parse(data);
//   let newData = req.body;
//   myArray.unshift(newData);

//   let finalData = JSON.stringify(myArray);
//   const path = `${__dirname}/public/activity.json`;
//   fs.writeFile(path, finalData, (err) => {
//     if (err) console.log(err);
//     console.log("front page file written");
//   });

//   // res.redirect('/')
//   // res.sendFile(`${__dirname}/public/index.html`);//access index.html
// });


// // sort order by day
// app.post("/dateSort", (req, res)=>{
//   console.log(req.body);
//   dates=req.body.from;
//   dates2=req.body.to;
//   timer1=req.body.timing1;
//   timer2=req.body.timing2;
//   sortOrders();
//   // finalOrderSorting();
//   res.send();
// });

// //post request from web page for single order
// app.post('/getSingleOrder', (req, res)=>{
//   let requester=req.body.orderNumber;
//       console.log(requester);
//         woocommerce.get(`orders/${requester}`)
//         .then((response) => {
//           // anOrder= response.data;// store response in order

//           //save retrieved an order to picker.json
//           let path=`${__dirname}/public/singleOrder.json`;
//           let anData=JSON.stringify(response.data);
//           fs.writeFile(path,anData, (err)=>{
//           if (err) {console.log("cannot get single order")}
//           else {console.log("Single Order saved")}
//           });
//         }).catch((error)=>{
//           console.log(error.response.data)
//         });

//       res.render('singleOrderPage',{
//       logDate: date
//       });
// })

// // //grap each customer request
// app.get("/singleOrderPage", (req, res)=>{
// //     console.log (`the param is${req.params.id}`);
// //       // let requester=req.url;
// //       // console.log(requester);
      
// //       //   woocommerce.get(`orders${requester}`)
// //       //   .then((response) => {
// //       //     anOrder= response.data;// store response in order

// //       //     //save retrieved an order to picker.json
// //       //     let path=`${__dirname}/singleOrder.json`;
// //       //     let anData=JSON.stringify(anOrder);
// //       //     fs.writeFile(path,anData, (err)=>{
// //       //     if (err) {console.log("cannot get single order")}
// //       //     else {console.log("Single Order saved")}
// //       //     });
// //       //   });
//       res.render('singleOrderPage',{
//       logDate: date
//       });
//     });



//     // my control
//     app.get('/mycontrol', (req, res)=>{
//         res.sendFile(`${__dirname}/public/mycontrol.html`)
//     });

//     app.post('/savemycontrol', (req, res)=>{
//       console.log(req.body);
//       let newData = req.body;
//       let newPafData = JSON.stringify(newData);
//       const path = `${__dirname}/public/performance.json`;
//       fs.writeFile(path, newPafData, (err) => {
//         if (err) console.log(err);
//         console.log("Perfomance Writen");
//       });
    
//     });


app.listen(port, () => {
  console.log("Server started");
});