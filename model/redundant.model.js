const mongoose = require ('mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const redundantSchema = mongoose.Schema({
    date:String,
    orderNumber:String,
    main:{},
    refund:{},
    replacement:{},
    redo:{}
})

const redundant = new mongoose.model("redundant", redundantSchema);

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

module.exports = redundant;