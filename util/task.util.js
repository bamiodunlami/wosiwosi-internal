const appRoot = require('app-root-path');
const path = require('path');
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);

const cron = require('node-cron');
const singleOrder = require('../model/order.model');

const User = require(appRoot + '/model/user.model.js');
const mailer = require(appRoot + '/util/mailer.util.js');
const singlOrder = require(appRoot + '/model/order.model.js');
const replaceDb = require(appRoot + '/model/replace.model.js');
const refundDb = require(appRoot + '/model/refund.model.js');
const completedDb = require(appRoot + '/model/completed.model.js');
const redundantDb = require(appRoot + '/model/redundant.model.js');
const notificationDb = require(appRoot + '/model/notification.model.js');
// const redoDb = require (appRoot + "/model/redo.model.js")
// const redundantDb = require (appRoot + "/model/redundant.model.js")

//get refunds, send mail, move to redundant
async function getAllRefund() {
  const refundData = await refundDb.find();

  for (const eachRefund of refundData) {
    //enter into each refund

    let allApproved = [];

    //enter into product array and check if refund approved or not
    for (const eachProduct of eachRefund.product) {
      //break out of the loop if any product refund is not approved
      if (eachProduct.approval === false) {
        // isApproved = false; //flag
      } else {
        allApproved.push(eachProduct);
      }
    }

    console.log(allApproved)

    //if it's approved
    if (allApproved.length > 0) {
      console.log( 'approved ' +  allApproved.length + ' refund of ' + eachRefund.orderNumber);

      let totalAmount = 0;

      //get data of all refund product
      let getProductData = allApproved;
      let refundProductData = getProductData.map((item) =>`${item.productName} x ${item.productQuantity} @ £${item.productPrice}`).join(', ');
      // console.log(refundProductData)

      //get total amound
      for (const eachAmount of eachRefund.product) {
        totalAmount = totalAmount + Number(eachAmount.productPrice);
      }

      //send mail
      //  console.log(eachRefund.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", eachRefund.orderNumber, eachRefund.customer_details.fname, refundProductData, totalAmount)
      //   await mailer.refundMail(eachRefund.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", eachRefund.orderNumber, eachRefund.customer_details.fname, refundProductData, totalAmount)
      try{
        const completedOrder = await singlOrder.findOne({orderNumber: eachRefund.orderNumber});
        if (completedOrder.status == true) {
            // order is completed, refund email and other processes can be done

            //save order to redundant
            const saveRedundant = new redundantDb({
            orderNumber: eachRefund.orderNumber,
            status: completedOrder.status,
            date: completedOrder.date,
            note: completedOrder.note,
            productPicked: completedOrder.productPicked,
            meatPicker: completedOrder.meatPicker,
            dryPicker: completedOrder.dryPicker,
            packer: completedOrder.packer,
            lock: completedOrder.lock,
            hideProduct: completedOrder.hideProduct,
            refund: eachRefund,
            });
            const saveToRedundant = await saveRedundant.save();

            //if it's saved
            if (saveToRedundant) {
                // send email
                await mailer.refundMail(eachRefund.customer_details.email,"laura@wosiwosi.co.uk, seyiawo@wosiwosi.co.uk, gbenga@wosiwosi.co.uk, bamidele@wosiwosi.co.uk", eachRefund.orderNumber, eachRefund.customer_details.fname, refundProductData, totalAmount)

                //delete order from completed
                await redundantDb.updateOne({orderNumber:eachRefund.orderNumber}, {
                    $set:{
                        close:true
                    }
                })
                await singleOrder.deleteOne({ orderNumber: eachRefund.orderNumber });
                await refundDb.deleteOne({ orderNumber: eachRefund.orderNumber});
            } else {
            console.log(eachRefund.orderNumber + ' not saaved');
            mailer.orderNotSavedToRedundant("bamidele@wosiwosi.co.uk", eachRefund.orderNumber)
            }
        } else {
            // complete button not presses, so email and other processes not done, send email to admin
            console.log(eachRefund.orderNumber +" complete button not presses, so email and other processes not done")
            mailer.sendOrderNotCompleteMail("bamidele@wosiwosi.co.uk", "laura@wosiwosi.co.uk", eachRefund.orderNumber)
        }
      }catch(e){
        console.log(e)
      }
    } else {
      console.log('skipping ' + eachRefund.orderNumber + " because refund was not approved");
    }
  }
  mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', 'order with refunds saved to redundant');
  console.log('redundant done');
}

//no refund, move completed from order to process into redundant
async function moveOrderToRedundant() {
  const completedOrder = await singlOrder.find({status:true});
  for ( const eachOrder of completedOrder){
    const saveRedundant = new redundantDb({
        orderNumber: eachOrder.orderNumber,
        status: eachOrder.status,
        date: eachOrder.date,
        note: eachOrder.note,
        productPicked: eachOrder.productPicked,
        meatPicker: eachOrder.meatPicker,
        dryPicker: eachOrder.dryPicker,
        packer: eachOrder.packer,
        lock: eachOrder.lock,
        hideProduct: eachOrder.hideProduct,
      });
      const saveToRedundant = await saveRedundant.save();
      if (saveToRedundant) {
        await singleOrder.deleteOne({ orderNumber: eachOrder.orderNumber });
      } else {
        console.log('not saaved');
        mailer.orderNotSavedToRedundant("bamidele@wosiwosi.co.uk", eachOrder.orderNumber)
      }
  }
  mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', ' order without refund moved to redundant');
}

//reset today's completed order
async function resetTodayCompletedOrder() {
  const completedOrder = await completedDb.find();
  for (const eachCompletedOrder of completedOrder) {
    if (eachCompletedOrder.status == true) {
      await completedDb.deleteOne({ status: true });
    }
  }
  mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', 'competed');
  console.log('reset done');
}

//clear all notification for the day
// async function clearNotification() {
//   const markNotification = await notificationDb.updateMany({},{
//       $set: {
//         readStatus: true,
//       },
//     }
//   );
//   mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', 'clear notification' );
//   console.log('reset done');
// }

//move completed order to redundant db every friday
// async function moveToRedundant() {
//   // const temporaryArray =[]
//   const completedOrder = await singlOrder.findOne({ orderNumber: '66031' });
//   let testComplete = [];
//   testComplete.push(completedOrder);
//   // temporaryArray.push(completedOrder)
//   // console.log(completedOrder.length)
//   for (const eachCompletedOrder of testComplete) {
//     if (eachCompletedOrder.status == false) {
//       //if order is locked, skip it
//       console.log(completedOrder.orderNumber + ' skipped');
//     } else {
//       let refund, replace, redo, orderNumber;

//       orderNumber = eachCompletedOrder.orderNumber;
//       // main = eachCompletedOrder

//       // look for redund
//       let refundOrder = await refundDb.findOne({
//         orderNumber: orderNumber,
//         close: true,
//       });
//       if (refundOrder) {
//         // if orderNumber exist in replacement
//         console.log('refund found');
//         refund = refundOrder;
//       } else {
//         console.log(orderNumber + 'refund found');
//       }

//       // look for replacement
//       let replaceOrder = await replaceDb.findOne({ orderNumber: orderNumber });
//       if (replaceOrder) {
//         // if orderNumber exist in replacement
//         console.log('replacement found');
//         replace = replaceOrder;
//       }

//       //look for redo
//       // let redoOrder = await redoDb.findOne({orderNumber:orderNumber})
//       // if(redoOrder){ // if orderNumber exist in replacement
//       //     redo = redoOrder
//       // }

//       const saveRedundant = new redundantDb({
//         orderNumber: orderNumber,
//         status: eachCompletedOrder.status,
//         date: eachCompletedOrder.date,
//         note: eachCompletedOrder.note,
//         productPicked: eachCompletedOrder.productPicked,
//         meatPicker: eachCompletedOrder.meatPicker,
//         dryPicker: eachCompletedOrder.dryPicker,
//         packer: eachCompletedOrder.packer,
//         lock: eachCompletedOrder.lock,
//         hideProduct: eachCompletedOrder.hideProduct,
//         refund: refund,
//         replacement: replace,
//         // redo:{}
//       });

//       await saveRedundant.save();

//       //delete order from completed
//       await singleOrder.deleteOne({ orderNumber: orderNumber });
//       await refundDb.deleteOne({ orderNumber: orderNumber });
//       await replaceDb.deleteOne({ orderNumber: orderNumber });
//     }
//   }
//   mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', 'redundant');
//   console.log('redundant done');
// }
// moveToRedundant()


//clear refund issued after order moved to redundant 
async function clearRefund() {
  const refundAvailable = await refundDb.find();
  if (refundAvailable.length > 0) {
    for (const order of refundAvailable) {
      let findOrder = await redundantDb.findOne({ orderNumber: order.orderNumber});
      if (findOrder) {
        await redundantDb.updateOne({ orderNumber: order.orderNumber },{
            $set: {
              refund: order,
            },
        });
        await refundDb.deleteOne({ orderNumber: order.orderNumber });
      }

    }
  }
  mailer.alertDailyCompleteReset('bamidele@wosiwosi.co.uk', 'miscellaneous refund');
}
// clearRefund()

//delete notification on friday
async function deleteAllNotifications() {
  const markNotification = await notificationDb.deleteMany();
  mailer.alertDailyCompleteReset(
    'bamidele@wosiwosi.co.uk',
    'all notification deleted'
  );
  console.log('reset done');
}

// -----------------------TASKS--------------

//daily task 8pm
cron.schedule('0 20 * * 1-4', () => { 
    getAllRefund(); //send refund message
  },{
    scheduled: true,
    timezone: 'Europe/London',
  }
);

//daily task 9pm
cron.schedule('0 21 * * 1-4', () => {
    moveOrderToRedundant();
    resetTodayCompletedOrder(); // reset completed order
  },{
    scheduled: true,
    timezone: 'Europe/London',
  }
);

//daily task 10pm
cron.schedule('0 22 * * 1-4',() => {
    deleteAllNotifications();
    // clearRefund();
  },{
    scheduled: true,
    timezone: 'Europe/London',
  }
);


module.exports = cron;
