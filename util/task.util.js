const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)

const cron = require('node-cron');

const User = require(appRoot + "/model/user.model.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const singlOrder = require(appRoot + "/model/order.model.js")
const replaceDb= require(appRoot + "/model/replace.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");
const completedDb= require(appRoot + "/model/completed.model.js");

// getAllRefund();
async function getAllRefund(){
    const refundData = await refundDb.find()
    for(let i = 0; i<refundData.length; i++){
        for(const refundProduct of refundData[i].product){
            if(refundData[i].close == false && refundProduct.approval == true ){
                let customerMail, fname, product, quantity, amount
                orderNumber = refundData[i].orderNumber
                customerMail = refundData[i].customer_details.email
                fname = refundData[i].customer_details.fname
                product = refundProduct.productName
                quantity = refundProduct.productQuantity
                amount = refundProduct.productPrice
                // console.log(customerMail,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", orderNumber, fname, product, quantity, amount)
                mailer.refundMail(customerMail,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", orderNumber, fname, product, quantity, amount)
            }
        }
    }
}

//reset Refund
async function resetTodayRefund(){
    let eachRefundDOne =await refundDb.updateMany({
        $set:{
            close:true
        }
    })
    console.log(eachRefundDOne)
    mailer.alertDailyCompleteReset("bamidele@wosiwosi.co.uk", "refund")
}

//reset today's completed order
async function resetTodayCompletedOrder(){
    const completedOrder = await completedDb.find()
    for(const eachCompletedOrder of completedOrder){
        if(eachCompletedOrder.status == true){
            await completedDb.deleteOne({status:true})
        }
    }
    mailer.alertDailyCompleteReset("bamidele@wosiwosi.co.uk", "competed")
    console.log("reset done")
}

// 7pm every day
cron.schedule('0 20 * * 1-4', () => {
    getAllRefund();
    resetTodayCompletedOrder(); // reset completed order
    resetTodayRefund();
  }, {
    scheduled: true,
    timezone: "Europe/London"
});


// Tester
//   cron.schedule('* * * * *', () => {
//     // getAllRefund()
//     // resetTodayCompletedOrder(); 
//     // resetTodayRefund();
//     console.log("sent")
//   }, {
//     scheduled: true,
//     timezone: "Europe/London"
//   });

module.exports= cron