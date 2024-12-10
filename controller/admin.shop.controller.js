const appRoot = require('app-root-path');
const path = require('path');
const rootPath = path.resolve(process.cwd());
appRoot.setPath(rootPath);

const passport = require(appRoot + '/util/passport.util.js');
const woo = require(appRoot + '/util/woo.util.js');

const date = new Date();

//get date in local timezone
// let convertToUkTimeZone = new Intl.DateTimeFormat('en-GB', {
//   //   dateStyle: 'full',
//   //   timeStyle: 'long',
//   timeZone: 'Europe/London',
// }).format(date);

// // convert date to YY--MM--DD
// let dateToday = `${convertToUkTimeZone.slice( 6,10)}-${convertToUkTimeZone.slice(3, 5)}-${convertToUkTimeZone.slice(0, 2)}`;

// // console.log(dateToday)

// ACCOUNT OPTION

//ajax call to load sales data in pounds and naira
const salesData = async (req, res)=>{
try{

  let dateToday = req.body.date

  let poundsValuePerPage = []
  let NairaValuePerPage = []
  let exchange

  //try first page (per-page is 100), if first page .length is up to 100, that means there might be second page
  // try second page (page changes to 2 and per-page is 100), if page 2  .length is up to 100, means theres page three and so on

  for(let i = 0; i<100; i++){

    // i represend number of pages
      let wooOrder = await woo.get(`orders?after=${dateToday}T00:00:00&before=${dateToday}T23:59:59`,{
        page: i+1,
        per_page: 100,
        status: 'completed processing',
      }); 

    //push the data of wooOrder
    for( const eachWooOrder of wooOrder.data){
      //if it's pounds push to poundsValuePerPage array
      if(eachWooOrder.currency_symbol === "£"){ // if it's pounds
        poundsValuePerPage.push(eachWooOrder.total)
      }else if(eachWooOrder.currency_symbol === "₦"){
        //find in the meta_data where key = wmc_order_info, which holds the exchange rate
        let found = eachWooOrder.meta_data.find(({key}) => key == "wmc_order_info");
        exchange = found.value.NGN.rate //exchange rate
        NairaValuePerPage.push(eachWooOrder.total)
      }
    }

    //check if wooOrder is up to hundread or not
    if(wooOrder.data.length == 100){
      //do nothing
    }else{
      break
    }

    //get exchange rate if there's naira payment

  }


  let totalOrder = poundsValuePerPage.concat(NairaValuePerPage)
  
  // add pounds array to get total sales in pounds
  let totalSalesInPounds = 0
  for(const eachPoundSales of poundsValuePerPage){
    totalSalesInPounds = Number(totalSalesInPounds) + Number(eachPoundSales)
  }

  // total sales in naira
  let totalSalesInNaira = 0
  for(const eachNairaSales of NairaValuePerPage){
    totalSalesInNaira = Number(totalSalesInNaira) + Number(eachNairaSales)
  }


  // data to send
  let dataToSend = {
    totalOrder:totalOrder.length,
    poundsValue:totalSalesInPounds.toFixed(2),
    nairaValue:totalSalesInNaira.toFixed(2),
    exchange: exchange||0
  }
  res.send(dataToSend) //send data
}catch(e){
  console.log(e)
  res.send(false)
}
}

//render account, showing woocommer sale for the day
const renderAccountPage = async (req, res) => {
  if (req.isAuthenticated()) {
    res.render('admin/shop-warehouse/account', {
      title: 'Account',
      // totalData: totalOrder.length,
      // poundsData:totalSalesInPounds.toFixed(),
      // nairaData: totalSalesInNaira.toFixed(2)
    });
  } else {
    res.redirect('/');
  }
};

module.exports = {
  salesData:salesData,
  renderAccountPage: renderAccountPage,
};
