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
    walkieTalkie:{
      number:Number,
      date:String,
      takeTime:String,
      returnTime:String,
      status:Boolean
    },
    active:Boolean,
    role:"string",
    level:Number,
    id:String,
    code:String,
    passChange:Boolean

})

userSchema.plugin(passportLocalMongoose)

module.exports = new mongoose.model('User', userSchema);

// // Add to database
// async function migrateUsers() {
//     try {
//       const mig = await User.findOne({username:"odunlamibamidelejohn@gmail.com"});
//       // for (const i in mig) {
//       //   mig[i].role = "staff"
//       //   mig[i].level = "1"
//       //   await mig[i].save()
//       // }
//       mig.setPassword("Abosede1234@@")
//       mig.save()
//       console.log('Data migration completed successfully.');
//       console.log(mig);
  
//       // Disconnect from MongoDB
//       await mongoose.disconnect();
//     } catch (error) {
//       console.error('Data migration failed:', error);
//     }
//   }
  // migrateUsers();
