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

  function singleOrder(requester){
        woocommerce.get(`orders/${requester}`)
        .then((response) => {
          anOrder= response.data;// store response in order
          //save retrieved an order to picker.json
          let path=appRoot + '/public/singleOrder.json';
          let anData=JSON.stringify(anOrder);
          fs.writeFile(path,anData, (err)=>{
          if (err) {console.log("cannot get single order")}
          else {console.log("Single Order saved")}
          });
        });
  }

//admin settings order preferences
async function sortOrder(f, t1, t, t2){
  console.log(f, t1, t, t2)
//sorted order
woocommerce.get(`orders?after=${f}T${t1}:59&before=${t}T${t2}:59`, {
  per_page: 100, //number of order par page
  status: "completed processing", //select completed only
})  
  .then((response) => {
  sortOrder=response.data;
      try {
        let data = JSON.stringify(sortOrder);
        let filePath = appRoot + '/public/adminsettings.json';
        fs.writeFile(filePath, data, (err) => {
          if (err) console.log(err);
          else {
            console.log("Sort written");
          }
        });
      } catch (er) {
        console.log(er);
      }
  })
.catch((error) => {
  console.log("Not sorted");
});


}

module.exports = {
  GeneralOrder:GenOrder,
  singleOrder:singleOrder,
  sortOrder:sortOrder,
}
