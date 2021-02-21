const express = require("express");
const bodyParser = require("body-parser");
const parking = require("./routes/parking");

const app = express();

app.use(bodyParser.json());

app.use("/parking", parking);

module.exports = {
  app,
};
