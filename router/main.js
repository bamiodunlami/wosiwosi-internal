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

module.exports=router