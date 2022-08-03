const { MongoClient } = require("mongodb");
import "dotenv/config";

let connection_string = process.env.CONNECTION_STRING;

// Create a new MongoClient
const client = new MongoClient(connection_string);
let db = null;
// eksportamo Promise koji resolva na konekciju
export default () => {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject("Database connection failed!");
      } else {
        console.log("Database connected successfully!");
        db = client.db("stranded-away");
        resolve(db);
      }
    });
  });
};
