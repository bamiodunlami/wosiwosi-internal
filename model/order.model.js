const mongoose = require ('mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const singleOrderSchema = mongoose.Schema({
    orderNumber:String,
    status:Boolean,
    note:[],
    picker:{
        id:String,
        status:Boolean
    },
    packer:{
        id:String,
        status:Boolean,
    },
    booking:{
        status:Boolean
    }
    
})

const singleOrder = mongoose.model("singleOrder", singleOrderSchema);

module.exports = singleOrder;