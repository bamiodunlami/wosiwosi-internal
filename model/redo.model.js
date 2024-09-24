const mongoose = require ('mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const { readdir } = require('fs')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const redoSchma = mongoose.Schema({
    orderNumber:String,
    status:Boolean,
    date:String,
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
    lock:Boolean,
    exclude:[]
})

const redo = new mongoose.model("redo", redoSchma);

//DB Update and migration
async function migrateUsers() {
    try {
      const mig = await singleOrder.find();
      // Update each user record with the new field
      for (let i=0; i<mig.length; i++) {
            mig[i].date = "no data capture"
            await mig[i].save()
      }
  
      console.log('Data migration completed successfully.');
      console.log(mig);
  
      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Data migration failed:', error);
    }
  }
  // migrateUsers();

module.exports = redo;