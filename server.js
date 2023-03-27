const express = require("express");
const csvFileToJson = require("csvtojson");
const { Postgres } = require("pg");
require("dotenv").config(".env");

const app = express();

const Postgres = new Postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.post("/uploadecsv", async (req, res) => {
  try {
    const convertedJsonArray = await csvFileToJson().fromFile(
      "process.env.CSV_FILE_PATH"
    );
    // console.log(convertedJsonArray);
    const connection = await Postgres.connect();
    await connection.query("BEGIN");
    const insertQuery =
      "INSERT INTO users(name, age, address, additional_info) VALUES($1, $2, $3, $4) RETURNING id";
    for (let i = 0; i < convertedJsonArray.length; i++) {
      const { firstName, lastName, age, ...remaining } = convertedJsonArray[i];
      const address = {
        line1: remaining["address.line1"],
        line2: remaining["address.line2"],
        city: remaining["address.city"],
        state: remaining["address.state"],
      };
      const additionalInfo = { ...remaining };
      delete additionalInfo["address.line1"];
      delete additionalInfo["address.line2"];
      delete additionalInfo["address.city"];
      delete additionalInfo["address.state"];
      const { records } = await connection.query(insertQuery, [
        `${firstName} ${lastName}`,
        parseInt(age),
        address,
        additionalInfo,
      ]);
      console.log(`Inserted user with ID ${records[0].id}`);
    }
    await connection.query("COMMIT");
    res.send("row Added successfully");

    const query =
      "SELECT COUNT(*) as count, age FROM users GROUP BY age ORDER BY age";
    const { records } = await connection.query(query);
    console.log(records);
    console.log("Age distribution of Users:");
    console.log("Age\tCount");
    records.forEach((item) => console.log(`${item.age}\t${item.count}`));
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
