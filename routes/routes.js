const express = require('express');
const router = express.Router();

const StocksController = require('../controlers/stocks_controlers');

router.post('/addstockwithproducts', StocksController.registerStock); 
router.post('/addproduct/:stockid', StocksController.addProductToStock); 
router.get('/getallproducts', StocksController.getAllProductsFromQueue);  

router.get('/getproductsforspecificstock/:stockid', StocksController.getProductsForSpecificStock);

router.get('/deleteproduct/:stockid/:productid', StocksController.deleteProduct);


module.exports = router;






