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



// cron.schedule('0 19 * * 1-4', () => {
//     console.log('Running a job at 01:00 at America/Sao_Paulo timezone');
//   }, {
//     scheduled: true,
//     timezone: "Europe/London"
//   });