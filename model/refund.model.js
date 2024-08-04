const mongoose = require ("mongoose");
mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const refundSchema = mongoose.Schema({
    orderNumber:String,
    staffId:String,
    fname:String,
    date:String,
    product:[],
    status:Boolean,
    readStatus:Boolean,
    customer_details:{}
})

module.exports = new mongoose.model("refund", refundSchema)

