const koaBody = require("koa-body");
const Router  = require('koa-router');

const authenticated  = require("../middleware/authenticated.js");
const get_code       = require("../middleware/validation/get_code.js");
const check_code     = require("../middleware/validation/check_code.js");
const login          = require("../middleware/validation/login.js");
const register       = require("../middleware/validation/register.js");
const set_user       = require("../middleware/validation/set_user.js");
const address        = require("../middleware/validation/address.js");
const set_address    = require("../middleware/validation/set_address.js");
const delete_address = require("../middleware/validation/delete_address.js");
const order          = require("../middleware/validation/order.js");

const apiController  = require('../controllers/apiController.js');
const userController = require('../controllers/userController.js');

const router = new Router({
    //prefix: '/api'
});

router.get('/', apiController.index);
router.get('/test', apiController.test);

router.post('/validate-init', koaBody(), apiController.validateInit);
router.get('/user', authenticated, apiController.user);
router.patch('/user', authenticated, koaBody(), set_user.validator, apiController.setUser);

router.get('/code/:hash', get_code.validator, apiController.getCode);
router.post('/code', koaBody(), check_code.validator, apiController.checkCode);
router.get('/check/:code', apiController.checkCode);
router.post('/refresh', koaBody(), apiController.refresh);

router.post('/login', koaBody(), login.validator, apiController.login);
router.post('/register', koaBody(), register.validator, apiController.register);

router.get('/user/addresses', authenticated, apiController.getAddresses);
router.post('/user/address', authenticated, koaBody(), address.validator, apiController.addAddress);
router.patch('/user/address', authenticated, koaBody(), set_address.validator, apiController.setAddress);
router.delete('/user/address/:address_id', authenticated, delete_address.validator, apiController.deleteAddress);
router.get('/user/card', authenticated, apiController.getCard);
router.get('/user/cards', authenticated, apiController.getCards);
router.post('/user/order', authenticated, koaBody(), order.validator, apiController.createOrder);
router.get('/user/orders', authenticated, apiController.getOrders);
router.get('/user/products', authenticated, apiController.getProducts);

exports.router = router;