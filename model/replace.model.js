const mongoose = require ('mongoose')

const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const replaceSchema = mongoose.Schema({
    orderNumber:String,
    staffId:String,
    fname:String,
    date:String,
    product:[],
})

// const User = new mongoose.model('User', userSchema);
module.exports = new mongoose.model('replace', replaceSchema);
