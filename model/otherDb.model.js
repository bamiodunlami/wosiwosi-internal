const mongoose = require ('mongoose');
const appRoot = require ('app-root-path');
const path = require ("path");
const rootpath = path.resolve(process.cwd());
appRoot.setPath(rootpath)

mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const talkSchema = mongoose.Schema({
    number:Number,
    pickTime:String,
    submitTime:String,
    pickedBy:String
})

const Talk = new mongoose.model("Talk", talkSchema)

console.log("hello")

module.exports ={
    Talk:Talk
}