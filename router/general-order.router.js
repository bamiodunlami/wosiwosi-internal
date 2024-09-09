const express = require ('express')
const router = express.Router()

const appRoot = require("app-root-path");
const path = require("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath);


const generalOrder = require (appRoot + "/controller/general-order.controller.js")

router

// AJAX
.get("/orderInfo", generalOrder.checkStatusOfOrderToProcess) // (ajax call from orderToProcess.js) this function is used to check status and details of order already done in the orderAvailableToProcess page
.post('/get-order-details', generalOrder.getRefundOrderDetails) // ajax to get all status of single order (refund in particular)
.get('/order-to-process', generalOrder.retrieveSavedForProcessing) //send order to process file
.get('/order-processing-status', generalOrder.getSingleOrderProcessingStatus)

// OTHERS
.get('/searchsingleorder', generalOrder.searchSingleOrder) //search for order number
.get('/processingorder', generalOrder.orderAvailableToProcess) //view page with list of orders available for processing
.get('/single-order-processing', generalOrder.singleOrderProcessing) // single order processing page
.post('/note', generalOrder.orderNote) //note for both admin and staff
.post("/complete", generalOrder.orderDone) // a particular order has beem completed
.get("/completed-order", generalOrder.completedOrder) //view completed order
.post('/replace', generalOrder.replace) //request for a refund by staff
.post('/refund', generalOrder.refund)

.post('/meatpacked', generalOrder.meatPacked)


module.exports=router