const { getPeopleCollection, getSlimeRecordsCollection } = require("./initDb");
const { ObjectId } = require('mongodb');
const {log, handleError} = require("../helpers/logging");

/*
A cursor is an object that allows you to iterate over the results of an
aggregation; the cursor is an Iterable<Document>

We then convert the cursor to an array of documents, result[0] accesses the first
and only doc in the array, and result[0].count accesses the count field in the
first doc
 */

// ******************************************************

/* ex. of a person doc:
{
_id : "123456789",
name : "17maple",
slimes : ["512434312", "324613423"],
zooms : [
    { _id: "new ObjectId()", time: "2024-05-18T12:00:00Z" },
    { _id: "new ObjectId()", time: "2024-05-19T14:00:00Z" }
    ]
}
_id is used as the key so MongoDB uses this discordUserId as the doc id
 */
// slimes and zooms parameters default to empty arrays if not provided
function createPersonDoc(discordUserId, name, slimes = [], zooms = []) {
    return {
        _id : discordUserId,
        name,
        slimes,
        zooms
    };
}

// ******************************************************

/* example of result
{
   "acknowledged" : true,
   "insertedId" : ObjectId("56fc40f9d735c28df206d078")
}
 */
async function insertPersonDoc(personDoc) {
    try {
        const result = await getPeopleCollection().insertOne(personDoc);
        if (result.acknowledged && result.insertedId) {
            log(`Person document inserted with _id: ${result.insertedId}`);
        } else {
            throw new Error(`Failed to insert person document.`);
        }
        return result;
    } catch (error) {
        // log(`Error in database function insertPersonDoc(${personDoc}): ${error}`);
        // handleError(error);
        throw error
    }
}

// ******************************************************
/* ex. of a slime doc:
{
_id: "04138803",
slimeId: "12",
time: 2024-05-01T10:00:00Z,
summonerId: "123456789",
summonerName: "17maple"
}
 */
function createSlimeDoc(_id, slimeId, time, summonerId, summonerName) {
    return {
        _id, // MongoDB-generated unique ID should be passed in
        slimeId,
        time,
        summonerId,
        summonerName
    }
}

// async function insertSlimeDocs(slimeDocs) {
//     try {
//         const result = await slimeRecordsCollection.insertMany(slimeDocs);
//         if (result.acknowledged && result.insertedIds.length === slimeDocs.length) {
//             log(`Slime documents inserted with _id: ${result.insertedIds}`);
//         } else {
//             throw new Error(`Failed to insert slime documents.`);
//         }
//         return result;
//
//     } catch (error) {
//         // log(`Error in database function insertSlimeDocs(${slimeDocs}): ${error}`);
//         // handleError(error);
//         throw new error;
//     }
// }

module.exports = {
    insertPersonDoc, createPersonDoc, createSlimeDoc
}




