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
// const redoDb = require (appRoot + "/model/redo.model.js")
// const redundantDb = require (appRoot + "/model/redundant.model.js")

// getAllRefund();
async function getAllRefund(){
    let isApproved = false;

    const refundData = await refundDb.find({close:false})

    for(const eachRefund of refundData){ //enter into each refund

        //enter into product array and check if refund approved or not
        for(const eachProduct of eachRefund.product){
            //break out of the loop if any product refund is not approved
            if(eachProduct.approval === false){
                isApproved = false //flag
                break;
            }else{
                isApproved = true
            }
        }

        //if it's approved
        if(isApproved){

            console.log("approved "+ eachRefund.orderNumber)

            let totalAmount = 0;

            //get data of all refund product
            let getProductData = eachRefund.product
            let refundProductData = getProductData.map((item) => (`${item.productName} x ${item.productQuantity} @ £${item.productPrice}`)).join(", ");
            // console.log(refundProductData)

            //get total amound
            for (const eachAmount of eachRefund.product){
                totalAmount = totalAmount + Number(eachAmount.productPrice)
            }
         
            //send mail
            //  console.log(eachRefund.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", eachRefund.orderNumber, eachRefund.customer_details.fname, refundProductData, totalAmount)
            await mailer.refundMail(eachRefund.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", eachRefund.orderNumber, eachRefund.customer_details.fname, refundProductData, totalAmount)
            
            //close refund
            await refundDb.updateOne({orderNumber:eachRefund.orderNumber},{
                $set:{
                    status:true,
                    close:true,
                }
            })

        }else{
            console.log("skipping "+ eachRefund.orderNumber)
        }        
    }
}

//reset Refund
// async function resetTodayRefund(){
//     const refund = await refundDb.find({status:true})
//     for(const refundItem of refund){
//         console.log(refundItem.orderNumber)
//         let eachRefundDOne = await refundDb.updateOne(
//             {orderNumber:refundItem.orderNumber},
//             { $set:{
//                 close:true
//             }},
//         )
//         console.log(eachRefundDOne)
//     }
//     // console.log(eachRefundDOne)
//     // mailer.alertDailyCompleteReset("bamidele@wosiwosi.co.uk", "refund")
// }


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
    // const temporaryArray =[]
    const completedOrder = await singlOrder.find()
    // temporaryArray.push(completedOrder)
    // console.log(completedOrder.length)
    for(const eachCompletedOrder of completedOrder){
        if(eachCompletedOrder.status == false){ //if order is locked, skip it
            console.log(completedOrder.orderNumber  + " skipped")
        } else{ 
            let refund, replace, redo, orderNumber

            orderNumber = eachCompletedOrder.orderNumber
            // main = eachCompletedOrder


            // look for redund 
            let refundOrder = await refundDb.findOne({orderNumber:orderNumber, close:true})
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
                orderNumber:orderNumber,
                status:eachCompletedOrder.status,
                date:eachCompletedOrder.date,
                note:eachCompletedOrder.note,
                meatPicker:eachCompletedOrder.meatPicker,
                dryPicker:eachCompletedOrder.dryPicker,
                packer:eachCompletedOrder.packer,
                lock:eachCompletedOrder.lock,
                hideProduct:eachCompletedOrder.hideProduct,
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


// revert movement temporary
async function revertMovement(){
    const revert = await redundantDb.find()
    for(const eachRevert of revert){
        let alreadyAvailable = await singlOrder.findOne({orderNumber:eachRevert.orderNumber})
        if(alreadyAvailable){
            console.log("skipped order " + alreadyAvailable.orderNumber)
            await redundantDb.deleteOne({orderNumber:eachRevert.orderNumber})
        }else{
            console.log("working on " + eachRevert.orderNumber)
            const resaveOrder = new singlOrder({
                orderNumber:eachRevert.orderNumber,
                status:eachRevert.status,
                date:eachRevert.date,
                note:eachRevert.note,
                meatPicker:eachRevert.meatPicker,
                dryPicker:eachRevert.dryPicker,
                packer:eachRevert.packer,
                lock:eachRevert.lock,
                hideProduct:eachRevert.hideProduct,
            })
            resaveOrder.save()
            await redundantDb.deleteOne({orderNumber:eachRevert.orderNumber})
        }
    }
    console.log("all done")

}

// -----------------------TASKS--------------

//daily task 9pm
cron.schedule('0 20 * * 1-4', () => {
    getAllRefund(); //send refund message
  }, {
    scheduled: true,
    timezone: "Europe/London"
});

//daily task 9pm
cron.schedule('0 21 * * 1-4', () => {
    resetTodayCompletedOrder(); // reset completed order
  }, {
    scheduled: true,
    timezone: "Europe/London"
});

//Friday weekly task
cron.schedule('0 10 * * 5', ()=>{
    moveToRedundant();   //transfer orders to redundant
},{
    scheduled: true,
    timezone: "Europe/London"
}
)

//every 5 min work
cron.schedule('*/5 * * * *', ()=>{
    
},{
    scheduled: true,
    timezone: "Europe/London"
}
)


module.exports= cron