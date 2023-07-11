const express =  require ('express')
const router = express.Router()

const appRoot = require ('app-root-path');
const path = require ('path');
const rootpath =  path.resolve(process.cwd());
appRoot.setPath(rootpath);

const woocommerce = require (appRoot + '/controller/woo.js')
const woo = woocommerce.GeneralOrder

// get requst from browser to lead homepage
router.get('/', (req, res) => {
    woo()
    res.render('index')
});

router.get('/finish', (req, res)=>{
    console.log(req.headers.referer)
    res.redirect(req.headers.referer);
});

router.get('/developer', (req, res)=>{
    res.render('mycontrol')
})


router.post('/savemycontrol', (req, res)=>{
    console.log(req.body);
    let newData = req.body;
    let newPafData = JSON.stringify(newData);
    const path = appRoot + '/public/performance.json';
    fs.writeFile(path, newPafData, (err) => {
      if (err) console.log(err);
      console.log("Perfomance Writen");
    });
  
  });


module.exports=router