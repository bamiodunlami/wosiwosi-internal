const fs = require("fs");

const WooCommerRestApi = require("woocommerce-rest-ts-api").default;
const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);


const date = new Date()

//wooommerce api
const woocommerce = new WooCommerRestApi({
  url: "https://wosiwosi.co.uk",
  consumerKey: process.env.WOOKEY,
  consumerSecret: process.env.WOOSEC,
  version: "wc/v3",
});

//get the woocommerce order that came in today
// const getOrder = async () => {
//   const wooOrder = await woocommerce.get(`orders?after=${date.toJSON().slice(0,10)}T00:00:00&before=${date.toJSON().slice(0,10)}T${date.toLocaleTimeString()}`, {
//     per_page: 100,
//     status: "completed processing",
//   });
//    return "no workd"

  // write file
  // try {
  //   data = JSON.stringify(wooOrder.data);
  //   filePath = appRoot + "/public/data/allOrder.json";
  //   fs.writeFileSync(filePath, data, () => {
  //     console.log("File written");
  //   });
  // } catch (er) {
  //   console.log("cannot write order");
  // }
  
// };

// function singleOrder(requester) {
//   woocommerce.get(`orders/${requester}`).then((response) => {
//     anOrder = response.data; // store response in order
//     //save retrieved an order to picker.json
//     let path = appRoot + "/public/singleOrder.json";
//     let anData = JSON.stringify(anOrder);
//     fs.writeFile(path, anData, (err) => {
//       if (err) {
//         console.log("cannot get single order");
//       } else {
//         console.log("Single Order saved");
//       }
//     });
//   });
// }

// //admin settings order preferences
// async function sortOrder(f, t1, t, t2) {
//   console.log(f, t1, t, t2);
//   //sorted order
//   woocommerce
//     .get(`orders?after=${f}T${t1}:59&before=${t}T${t2}:59`, {
//       per_page: 100, //number of order par page
//       status: "completed processing", //select completed only
//     })
//     .then((response) => {
//       sortOrder = response.data;
//       try {
//         let data = JSON.stringify(sortOrder);
//         let filePath = appRoot + "/public/adminsettings.json";
//         fs.writeFile(filePath, data, (err) => {
//           if (err) console.log(err);
//           else {
//             console.log("Sort written");
//           }
//         });
//       } catch (er) {
//         console.log(er);
//       }
//     })
//     .catch((error) => {
//       console.log("Not sorted");
//     });
// }

module.exports = woocommerce
  // getOrder: getOrder,
  // singleOrder: singleOrder,
  // sortOrder: sortOrder,

