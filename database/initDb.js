/*
initDb.js
 */

const { dbName, peopleCollectionName, slimeRecordsCollectionName }
    = require('../config.json')
const { log, handleError } = require('../helpers/logging')
const { MongoClient } = require('mongodb');
const { mongoURL } = require('../config.json')
// const {getSlimesCountByUserId, getZoomInfoByUserId} = require("./read");
// const {idSearch} = require("../helpers/members");

// Connection URL to the MongoDB server
const url = 'mongodb://localhost:27017';
// Create a new MongoClient instance
const mongoDbClient = new MongoClient(mongoURL);

// Declare "db", "peopleCollection" and "slimeRecordsCollection" as global variables
let db, peopleCollection, slimeRecordsCollection;

/*
The MongoDB driver for Node.js will implicitly create the db and the
collection if they do not exit when first accessing them or perform
an operation such as inserting a doc
 */
async function initDbConnection() {
    try {
        // Connect to the MongoDB server
        await mongoDbClient.connect();
        log('Successfully connected to MongoDb server');

        // Create a database object
        db = mongoDbClient.db(dbName);

        // Get a reference to the collection
        peopleCollection = db.collection(peopleCollectionName);
        slimeRecordsCollection = db.collection(slimeRecordsCollectionName);

        log(`Successfully connected to database: ${dbName}`);

        // Close the connection when the process is terminated
        process.on('SIGINT', async () => {
            log('Closing connection to MongoDB');
            await mongoDbClient.close();
            process.exit();
        });

    } catch (error) {
        log(`Error in init function initDbConnection(): ${error}`);
        handleError(error);
        process.exit(1); // Exit with failure
    }
}



module.exports = {
    mongoDbClient, initDbConnection,
    getPeopleCollection: () => peopleCollection,
    getSlimeRecordsCollection: () => slimeRecordsCollection
}

