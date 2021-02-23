require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const parking = require("./routes/parking");
const cors = require("cors")

const app = express();

app.use(cors())

app.use(bodyParser.json());

app.use("/parking", parking);

module.exports = {
  app,
};
