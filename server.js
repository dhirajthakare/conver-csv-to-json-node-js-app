const express = require("express");
const csvFileToJson = require("csvtojson");
const { Postgres } = require("pg");
require("dotenv").config(".env");

const fs = require("fs");
const { parse } = require("csv-parse");

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
    res.status(500).send("Internal server error");
  }
});

let labels;
let records = [];
let sendResponce = [];
let newarr = {};

app.get("/csvtojsoncustomeparser", async (req, res) => {
  labels;
  records = [];
  sendResponce = [];

  fs.createReadStream("csvSheet.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", function (row) {
      records.push(row);
    });
  setTimeout(() => {
    let responce = claculatejson(records);
    res.json(responce);
  }, 1000);
});

function claculatejson(data) {
  let firstRow = data[0];

  for (let index = 1; index < data.length; index++) {
    labels = convertJsonArray(firstRow, data[index]);
    sendResponce.push(labels);
  }

  return sendResponce;
}

function convertJsonArray(labels, currentData) {
  newarr = {};

  for (let index = 0; index < labels.length; index++) {
    split = labels[index].split(".");
    makeDynamicObj(newarr, split, currentData[index]);
  }

  return newarr;
}

function makeDynamicObj(curentarr, keyPath, value) {
  lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in curentarr)) {
      curentarr[key] = {};
    }
    curentarr = curentarr[key];
  }
  curentarr[keyPath[lastKeyIndex]] = value;
}

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
