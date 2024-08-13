const mongoose = require ("mongoose");
mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const refundSchema = mongoose.Schema({
    orderNumber:String,
    staffId:String,
    fname:String,
    date:String,
    product:[],
    status:Boolean,
    close:Boolean,
    readStatus:Boolean,
    customer_details:{}
})


refundDb = new mongoose.model("refund", refundSchema)

//DB Update and migration
async function migrateUsers() {
    try {
      const mig = await refundDb.find();
      // Update each user record with the new field
      for (let i=0; i<mig.length; i++) {
            mig[i].close = false
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
//   migrateUsers();

module.exports = refundDb