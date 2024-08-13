const mongoose = require ('mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const completeSchema = mongoose.Schema({
    orderNumber:String,
    status:Boolean,
    note:[],
    meatPicker:{
        id:String,
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
    dryPicker:{
        id:String,
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
    packer:{
        id:String,
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
})

const completed = new mongoose.model("completed", completeSchema);

module.exports = completed;