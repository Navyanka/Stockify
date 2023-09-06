const express = require("express");
const bodyParser = require('body-parser');
const stockRouter = require('./routes/routes');

const app = express();

app.use(bodyParser.json());


app.use(express.json());
app.use('/api/stocks', stockRouter);
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});