const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const dynamodb = new AWS.DynamoDB.DocumentClient();
const Stock = require("../models/stocks");
const sns = new AWS.SNS({ region: 'us-east-1' });
const sqs = new AWS.SQS({ region: 'us-east-1' });

// Get the ARN of the SNS topic
const getTopicArn = async () => {
    const params = {
      Name: 'NewStockAlert' /* required */
      
    };
  
    try {
      const data = await sns.createTopic(params).promise();
      return data.TopicArn;
    } catch (err) {
      console.error(err);
    }
  };

  // Get the URL of the SQS queue
const getQueueUrl = async () => {
    const params = {
      QueueName: 'NewProductQueue' /* required */
    };
  
    try {
      const data = await sqs.getQueueUrl(params).promise();
      return data.QueueUrl;
    } catch (err) {
      console.error(err);
    }
  };


   // add stocks
const registerStock = async (req, res) => {
    try {
        console.log(req.headers);  // Log the headers of the incoming request

        // Check if req.body or req.body.body is undefined
        if (!req.body || !req.body.body) {
            throw new Error("req.body or req.body.body is undefined");
            }
            // Retrieve the stock object from the request body
            const stock = JSON.parse(req.body.body);
                // const stock = req.body;
            console.log( stock)
            // Create a new Stock instance using the stock object    
            const newStock = new Stock(stock);
            console.log("Hello World")
            // Save the stock object to the DynamoDB table
            const stockObj = await newStock.save();
                    console.log(stockObj)
            console.log("Hello world1")

            console.log(req.body.body)
            // Return the saved stock object
            res.status(200).send({ message: 'Stock registered successfully', stock: stockObj });
        } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Failed to register Stock',
            error: {
                message: error.message,
                stack: error.stack
            }
        });
        }
        };

// add products to stock
const addProductToStock = async (req, res) => {
    try {
        let stockID = req.params.stockid;
        const stock_ID =  parseInt(stockID)
        const stock = await Stock.query('stockID').eq(stock_ID).exec();
        var stockObj = {}
        var stocknewobj = {}

        
        if(stock.length > 0)
        {
            stockObj = stock[0]
           
            stockObj.products = req.body.products;
            const newproduct  = new Stock(stockObj)
            stocknewobj = await newproduct.save();
        }
        else
        {
            throw new Error ("Stock not Found")
        }

        console.log(stocknewobj);
        // Send the product details to the SQS queue
        const queueParams = {
            MessageBody: `The Products` + JSON.stringify(stocknewobj.products) + `have been added to the Stock named ${stocknewobj.stockName}`  ,
            QueueUrl: process.env.QUEUE_URL
        };

        await sqs.sendMessage(queueParams).promise();

        // Add the userEmail as a subscriber to the SNS topic
        const subscribeParams = {
            Protocol: 'email',
            TopicArn: process.env.TOPIC_ARN,
            Endpoint: stocknewobj.stockEmail
        };
        await sns.subscribe(subscribeParams).promise();

        const message = `
Product Entry Confirmation\n 
A New product has been added to the Store ${stocknewobj.stockName}. Please check the database for the product details.
`;

// Publish the Stock details to the subscribed user's email
const publishParams = {
    Subject: 'Product Entry Confirmation',
    TopicArn: 'arn:aws:sns:us-east-1:867581980728:StockAlert',
    MessageStructure: 'json',
    Message: JSON.stringify({
        default: `Product Entry Confirmation\nA New product has been added to the Store ${stocknewobj.stockName}. Please check the database for the product details.`,
        email: `Product Entry Confirmation\n A New product has been added to the Store\n ${stocknewobj.stockName}.\n Please check the database for the product details.`
    })
};

await sns.publish(publishParams).promise();
        res.status(200).send({ message: 'Added products successfully', stocknewobj: stocknewobj })
    } catch (error) {
        console.log("Hello"+error);
        res.status(500).send({ message: 'Failed to add products', errorcode: error });
    }
};



const getAllProductsFromQueue = async (req, res) => {
    try {
        
        const queueUrl = process.env.QUEUE_URL;

        const receiveParams = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 10 // Fetch a maximum of 10 messages at a time
        };
        var data =  await sqs.receiveMessage(receiveParams).promise();
        var productlist = [];

        for(var i=0; i<data.Messages.length; i++)
        {
            const message = data.Messages[i].Body;
            // Get the start and end of the JSON string
            const start = message.indexOf('[');
            const end = message.indexOf(']') + 1;

            // Extract the JSON string and parse it into an object
            const jsonString = message.slice(start, end);
            const jsonObject = JSON.parse(jsonString);
            productlist.push(jsonObject);
        }
        console.log(productlist);

        res.status(200).send({ message: 'Information retrieved from Queue', productlist });
    } catch (error) {   
        console.log(error);
        res.status(500).send({ message: 'Failed to receive message from Queue', error: error });
    }
};

// get products for specific stock
const getProductsForSpecificStock = async (req, res) => {
    try {
        
        let stockID = req.params.stockid;
        const stock_ID =  parseInt(stockID)
        const stock = await Stock.query('stockID').eq(stock_ID).exec();

        
         // Return the saved stock object
        res.status(200).send({ message: 'Products Retrieved from Stock successfully', stock: stock[0].products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Failed to retrieve product details from the Stock', error: error });
    }
};


// update product Name for specific stock
// const updateProductNameForSpecificStock = async (req, res) => {
//     try {
        
//         let stockID = req.params.stockid;
//         const stock_ID =  parseInt(stockID);
//         let productID = req.params.productid;
//         const product_ID =  parseInt(productID)
//         let productNAME = req.params.productname;

//         const stock = await Stock.query('stockID').eq(stock_ID).exec();
//         const stockdetails = stock[0]
//         const product = stockdetails.products.find(product => product.productID === product_ID)
//         console.log(product);

//         // If Product not found, return error
//         if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//         }

//         product.productNAME = productNAME;

//         // Save the updated productname
//         await Stock.update(stockdetails);


//         // var newobj = {}
//         // newobj.stockID = stockdetails.stockID
//         // newobj.stockName = stockdetails.stockName
//         // newobj.stockEmail = stockdetails.stockEmail

//          // Return the saved stock object
//         res.status(200).send({ message: 'Product name Updated successfully', stock: stockdetails });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({ message: 'Failed to update product name from the Stock', error: error });
//     }
// };

// delete product from a specific stock
const deleteProduct = async (req, res) => {
    try {
        let stockID = req.params.stockid;
        const stock_ID =  parseInt(stockID);
        let productID = req.params.productid;
        const product_ID =  parseInt(productID)

        const stock = await Stock.query('stockID').eq(stock_ID).exec();
        const stockdetails = stock[0]
        
        // Find the product index using product ID
        const productIndex = stockdetails.products.findIndex(product => product.productID === product_ID);

        // If Product not found, return error
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove the product from the products array
        stockdetails.products.splice(productIndex, 1);

        // Save the updated stockdetails
        await Stock.update(stockdetails);

        // Return the updated stock object
        res.status(200).send({ message: 'Product deleted successfully', stock: stockdetails });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Failed to delete product from the Stock', error: error });
    }
};


module.exports = {
    registerStock, addProductToStock, getAllProductsFromQueue, getProductsForSpecificStock, deleteProduct
};