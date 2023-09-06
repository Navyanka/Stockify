const dynamoose = require("dynamoose");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const AWS = require("aws-sdk");
require("dotenv").config();

const dynamodb = new DynamoDB({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    sessionToken: process.env.sessionToken
  }
});

dynamoose.aws.sdk = dynamodb;

const ProductSchema = new dynamoose.Schema({
    productID: Number,
    productNAME:String,
    productPRICE: Number,
    stockID : Number,
});

const StocksSchema = new dynamoose.Schema({
    stockID: {
        type: Number,
        hashKey: true
    },
    stockName:{type: String},
    stockEmail : {type: String},
    products: {
        type: Array,
        schema: [ProductSchema]
    }
});

const Stock = dynamoose.model(process.env.TABLE_NAME, StocksSchema);
//const Stock = dynamoose.model('Stock', StocksSchema);

module.exports = Stock;

