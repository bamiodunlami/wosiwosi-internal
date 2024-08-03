const mongoose = require ('mongoose')

const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const notificationSchema = mongoose.Schema({
    notificationId:Number,
    senderId:String,
    senderFname:String,
    senderDuty:String,
    orderNumber:String,
    date:String,
    readStatus:Boolean,
    directedTo:String,
    message:String,
})

// const User = new mongoose.model('User', userSchema);
module.exports = new mongoose.model('notification', notificationSchema);
