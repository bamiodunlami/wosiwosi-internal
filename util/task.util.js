const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)

const cron = require('node-cron');
const singleOrder = require('../model/order.model');

const User = require(appRoot + "/model/user.model.js");
const mailer = require(appRoot + "/util/mailer.util.js");
const singlOrder = require(appRoot + "/model/order.model.js")
const replaceDb= require(appRoot + "/model/replace.model.js");
const refundDb= require(appRoot + "/model/refund.model.js");
const completedDb= require(appRoot + "/model/completed.model.js");
const redundantDb = require (appRoot + "/model/redundant.model.js")

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

//move completed order to redundant db every friday
async function moveToRedundant(){
    const completedOrder = await singlOrder.find()
    console.log(completedOrder.length)
    for(const eachCompletedOrder of completedOrder){
        if(eachCompletedOrder.status == false){ //if order is locked, skip it
            console.log(completedOrder.orderNumber  + " skipped")
        } else{ 
            let main, refund, replace, redo, dateCompleted, orderNumber

            dateCompleted = eachCompletedOrder.date
            orderNumber = eachCompletedOrder.orderNumber
            main = eachCompletedOrder


            // look for redund 
            let refundOrder = await refundDb.findOne({orderNumber:orderNumber})
            if(refundOrder){ // if orderNumber exist in replacement
                console.log("refund found")
                refund = refundOrder
            }

            // look for replacement 
            let replaceOrder = await replaceDb.findOne({orderNumber:orderNumber})
            if(replaceOrder){ // if orderNumber exist in replacement
                console.log("replacement found")
                replace = replaceOrder
            }

            //look for redo 
            // let redoOrder = await redoDb.findOne({orderNumber:orderNumber})
            // if(redoOrder){ // if orderNumber exist in replacement
            //     redo = redoOrder
            // }


            const saveRedundant = new redundantDb({
                date:dateCompleted,
                orderNumber:orderNumber,
                main:main,
                refund:refund,
                replacement:replace,
                // redo:{}
            })

            await saveRedundant.save()

            //delete order from completed
            await singleOrder.deleteOne({orderNumber:orderNumber})
            await refundDb.deleteOne({orderNumber:orderNumber})
            await replaceDb.deleteOne({orderNumber:orderNumber})
        }
    }
    mailer.alertDailyCompleteReset("bamidele@wosiwosi.co.uk", "redundant")
    console.log("redundant done")
}


// -----------------------TASKS--------------

//daily task 8pm

cron.schedule('0 20 * * 1-4', () => {
    getAllRefund(); //send refund message
    resetTodayCompletedOrder(); // reset completed order
    resetTodayRefund(); // reset redund order
  }, {
    scheduled: true,
    timezone: "Europe/London"
});

//Friday weekly task
cron.schedule('0 10 * * 5', ()=>{
    // moveToRedundant();   //transfer orders to redundant
    
},{
    scheduled: true,
    timezone: "Europe/London"
}
)

module.exports= cron