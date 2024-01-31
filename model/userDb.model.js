const mongoose = require ('mongoose')
const passportLocalMongoose = require ('passport-local-mongoose')
const appRoot = require ('app-root-path')
const path = require ('path')
const rootpath = path.resolve(process.cwd())
appRoot.setPath(rootpath)


mongoose.connect(`mongodb+srv://odunlamibamidelejohn:${process.env.DBPASS}@wosiwosiorder.svc0u4z.mongodb.net/?retryWrites=true&w=majority`)

const userSchema = mongoose.Schema({
    username:String,
    fname:String,
    lname:String,
    role:String,
    status:Boolean,
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

// Add to database
async function migrateUsers() {
    try {
      const mig = await User.find();
      for (let i=0; i<mig.length; i++) {
        mig[i].status = true;
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



module.exports= {
    User:User
}