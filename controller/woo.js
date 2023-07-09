const fs = require("fs"); //writing to file intenal package
const WooCommerRestApi = require("@woocommerce/woocommerce-rest-api").default;

const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath =  path.resolve(process.cwd());
appRoot.setPath(rootpath);

//wooommerce api
const woocommerce = new WooCommerRestApi({
    url: "https://wosiwosi.co.uk",
    consumerKey: process.env.WOOKEY,
    consumerSecret: process.env.WOOSEC,
    version: "wc/v3",
  });
  
    //get the woocommerce order
  function GenOrder(){
     woocommerce.get("orders", {
      per_page: 100, //number of order par page
      status: "completed processing", //select completed only
    }).then((response) => {
      order = response.data; // store response in order
        try {
          data = JSON.stringify(order);  
          filePath = appRoot + '/public/products.json';
          fs.writeFile(filePath, data, (err) => {
            if (err) console.log(err);
            else {
              console.log("File written");
            }
          });
        } catch (er) {
          console.log("cannot get order");
      }
    })
  }
module.exports = {
  GeneralOrder:GenOrder
}
