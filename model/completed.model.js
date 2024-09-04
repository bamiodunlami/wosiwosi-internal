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
        product:[],
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
    dryPicker:{
        id:String,
        product:[],
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
    packer:{
        id:String,
        product:[],
        fname:String,
        active:Boolean,
        time:String,
        status:Boolean
    },
})

const complete = new mongoose.model("complete", completeSchema);

module.exports = complete;