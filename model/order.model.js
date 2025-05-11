const mongoose = require ('mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const singleOrderSchema = mongoose.Schema({
    orderNumber:String,
    status:Boolean,
    date:String,
    note:[],
    customer:{
      fname:String,
      lname:String,
      phone:String,
      address:String,
      city:String,
      postcode:String,
      state:String,
      shipping_amount:Number,
      shipping_method:String,
    },
    productPicked:[],
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
    hideProduct:[]
})

const singleOrder = new mongoose.model("singleOrder", singleOrderSchema);

//DB Update and migration
async function migrateUsers() {
    try {
      const mig = await singleOrder.find();
      // Update each user record with the new field
      for (let i=0; i<mig.length; i++) {
            mig[i].productPicked = []
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

module.exports = singleOrder;