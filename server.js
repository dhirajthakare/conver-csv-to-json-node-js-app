const express = require("express");
const csvFileToJson = require("csvtojson");
const { Postgres } = require("pg");
require("dotenv").config(".env");

const app = express();

app.get("/csvtojson", async (req, res) => {
  try {
    const convertedJsonArray = await csvFileToJson().fromFile("csvSheet.csv");

    let mydata = [];

    for (let i = 0; i < convertedJsonArray.length; i++) {
      mydata.push(convertedJsonArray[i]);
    }

    res.send(mydata);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
