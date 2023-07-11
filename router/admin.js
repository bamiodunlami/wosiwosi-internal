const express =  require ('express')
const router = express.Router()

const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath =  path.resolve(process.cwd());
appRoot.setPath(rootpath);

 const woocommerce = require (appRoot + '/controller/woo.js')
 const woo = woocommerce.GeneralOrder
 const adminSortOrder=woocommerce.sortOrder

router.get('/admin', (req, res)=>{
    woo();
    res.render("admin")
  })
  
  router.get("/orderlist", (req, res) => {
    res.render("adminOrder", {});
  });
  
  // Admin view completed orders
  router.get("/adminCompletedOrder", (req, res) => {
    res.render('completedOrders');
  });
  
  //Admin settings
  router.get('/settings', (req, res)=>{
    res.render('adminsettings')
  })
  
  router.post('/adminSettingData', (req, res)=>{
    console.log("clicked")
      // console.log(req.body);
      // let setData={
      //   fromDate:req.body.fromDate,
      //   toDate:req.body.toDate,
      //   orderQty:req.body.orderQty
      // }
      // let paths=`${__dirname}/public/adminsettings.json`
      // fs.writeFile(paths, JSON.stringify(setData), (err)=>{
      //   if(err) console.log(err);
      //   else{console.log("settings saved")}
      // })
  });
  
  // Admin order preference setting
  router.post("/adminDateSort", (req, res)=>{
    const from = req.body.from
    const to = req.body.to
    const time1 = req.body.timing1
    const time2 = req.body.timing2
    adminSortOrder(from, time1, to, time2);
    // finalOrderSorting();
    // res.send();
  });
  
  //staff perefomance report
  router.get('/performance', (req, res)=>{
    res.render('performance')
  });

  module.exports=router