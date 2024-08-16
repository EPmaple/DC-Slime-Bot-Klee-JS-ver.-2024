/*
database/update.js
 */

const { getPeopleCollection, getSlimeRecordsCollection, mongoDbClient }
    = require("./initDb.js");
const { getCachedData, updateCachedTotalSlimeCount } = require('../cache/initCache');
const { ObjectId } = require('mongodb');
const { createSlimeDoc } = require('./create');
const { getCurrentDateAndDate, getNumOfZoomsInPastSevenDays }
    = require('../helpers/time');
const { getName } = require('../helpers/members');
const { log } = require('../helpers/logging');


async function updatePersonSlimesPositively(discordUserId, slimesToAdd, slimeDocsToAdd) {
    let session;
    try {
        /*
        Session, a logical construct tha groups a series of operations into a
        single context, essential for performing multi-document txns
         */
        session = mongoDbClient.startSession();
        /*
        Txns allow you to perform multiple read and write operations across
        multiple collections and docs as a single atomic operation
         */
        session.startTransaction();

        // *******************************************************************

        // Filter object: to find the doc with the specified '_id'
        const filter = { _id: discordUserId };
        /*
        Update object: push each element from the slimeIds array to the end
        of the person's slimes array
         */
        const update = { $push: { slimes: { $each: slimesToAdd } } }
        /*
        By passing the session object as option operator, we specify the session
        in which the operation is to be executed
         */
        const updateResult = await getPeopleCollection()
            .updateOne(filter, update, { session });

        // Check if the update operation modified any doc
        if (updateResult.modifiedCount === 0) {
            throw new Error('Aborting transaction: failed to update the matching ' +
                'document with the slimeIds in the database.');
        }

        // *******************************************************************

        /*
        insertResult is a JSON object, so we use JSON.stringify to convert the
        object to JSON string
         */
        const insertResult = await getSlimeRecordsCollection()
            .insertMany(slimeDocsToAdd, { session });

        // log(`insertResult for debug: ${JSON.stringify(insertResult)},
        // insertedCount: ${insertResult.insertedCount},
        // insertedIds: ${JSON.stringify(insertResult.insertedIds)}`);

        // Check if all slime docs were inserted
        if (insertResult.insertedCount !== slimeDocsToAdd.length) {
            throw new Error('Aborting transaction: failed to insert all corresponding ' +
                'slime documents into slimeRecordsCollection in the database.');
        }

        // Commit the txn if both operations succeed
        await session.commitTransaction();

    } catch (error) {
        // If error, meaning any of the operations failed, abort the txn
        await session.abortTransaction();
        throw error
    } finally {
        await session.endSession();
    }
}




/* example of result from the first aggregation pipeline below
[
    {
        "slimes": ["12", "14"]
    }
]
 */
async function updatePersonSlimesNegatively(discordUserId, numberOfSlimes) {
    let session
    try {
        session = mongoDbClient.startSession(); // Start a new session
        session.startTransaction(); // Start a txn within the session

        const pipeline = [
            { $match : { _id : discordUserId } },
            { $project : { _id: 0, slimes: 1 } }
        ];
        /*
        await getPeopleCollection().aggregate(pipeline) returns a cursor object
        containing the matching docs, and each doc is represented using objects
         */
        const result = await getPeopleCollection().aggregate(pipeline, { session }).toArray();

        if (result.length === 0) {
            throw new Error('Aborting transaction: no document found with the ' +
                'specified discordUserId.');
        }

        const slimesArray = result[0].slimes;
        let slimesToRemove, updatedSlimesArray;
        if (slimesArray.length <= numberOfSlimes) {
            // If the slimesArray has fewer elements than numberOfSlimes, a
            // shallow copy by .slice() takes all elements
            slimesToRemove = slimesArray.slice();
            updatedSlimesArray = [];
        } else { // Otherwise, get the last 'numberOfSlimes' elements
            // .slice(-2) takes the last two elements of the array
            slimesToRemove = slimesArray.slice(-numberOfSlimes);
            updatedSlimesArray = slimesArray.slice(0, -numberOfSlimes);
        }

        // Update the person's doc with the new slimes array
        const updateFilter = { _id: discordUserId };
        const update = { $set: { slimes: updatedSlimesArray } };
        const updateResult = await getPeopleCollection().updateOne(updateFilter, update, { session });

        if (updateResult.modifiedCount === 0) {
            throw new Error("Aborting transaction: failed to update the person's " +
                "slimesArray in the database.");
        }

        const deleteFilter = { _id: { $in: slimesToRemove } };
        // Delete the corresponding slime docs from the slimeRecordsCollection
        const deleteResult = await getSlimeRecordsCollection().deleteMany(
            deleteFilter, { session }
        );

        if (deleteResult.deletedCount !== slimesToRemove.length) {
            throw new Error('Aborting transaction: failed to delete all corresponding ' +
                'slime docs from the slimeRecordsCollection in the database.');
        }

        await session.commitTransaction();
        return {
            originalSlimeCount: slimesArray.length,
            updatedSlimeCount:  updatedSlimesArray.length
        }

    } catch (error) {
        // If error, meaning any of the operations failed, abort the txn
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}


async function updatePersonZoomPositively(discordUserId, zoomsToAdd) {
    let session
    try {
        session = mongoDbClient.startSession(); // Start a new session
        session.startTransaction(); // Start a txn within the session

        const pipeline = [
            { $match : { _id : discordUserId } },
            { $project : { _id: 0, zooms: 1 } }
        ];

        const pipelineResult = await getPeopleCollection().aggregate(pipeline, { session }).toArray();

        if (pipelineResult.length === 0) {
            throw new Error("Aborting transaction: no document found with the " +
                "specified discordUserId.");
        }

        const zoomsArray = pipelineResult[0].zooms;
        const originalZoomCount = zoomsArray.length;
        zoomsToAdd.forEach(zoom => {
            zoomsArray.push(zoom);
        })
        const updatedZoomCount = zoomsArray.length;

        const filter = { _id: discordUserId };
        const update = { $push: { zooms: { $each: zoomsToAdd } } }
        const updateResult = await getPeopleCollection().updateOne(filter, update, { session });
        log(JSON.stringify(updateResult))

        if (updateResult.modifiedCount === 0) {
            throw new Error('Aborting transaction: failed to update the matching ' +
                'person document with the new zooms in the database.');
        }

        await session.commitTransaction();

        return {
            originalZoomCount,
            updatedZoomCount,
            numOfZoomsInPastSevenDays: getNumOfZoomsInPastSevenDays(zoomsArray)
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}


async function updatePersonZoomNegatively(discordUserId, numberOfZooms) {
    let session
    try {
        session = mongoDbClient.startSession(); // Start a new session
        session.startTransaction(); // Start a txn within the session

        const pipeline = [
            { $match : { _id : discordUserId } },
            { $project : { _id: 0, zooms: 1 } }
        ];

        const pipelineResult = await getPeopleCollection().aggregate(pipeline, { session }).toArray();

        if (pipelineResult.length === 0) {
            throw new Error("Aborting transaction: no document found with the " +
                "specified discordUserId.");
        }

        const zoomsArray = pipelineResult[0].zooms;
        let zoomsToRemove, updatedZoomsArray;
        if (zoomsArray.length <= numberOfZooms) {
            zoomsToRemove = zoomsArray.slice();
            updatedZoomsArray = [];
        } else {
            zoomsToRemove = zoomsArray.slice(-numberOfZooms);
            updatedZoomsArray = zoomsArray.slice(0, -numberOfZooms);
        }

        /*
        If you perform an update operation where the value being set is
        identical to the current value, no actual modification will occur
        in the database
         */
        if (zoomsArray.length === 0 && updatedZoomsArray.length === 0) {
            await session.commitTransaction();
            return null;
        }

        const filter = { _id: discordUserId };
        const update = { $set: { zooms: updatedZoomsArray } };
        const updateResult = await getPeopleCollection().updateOne(filter, update, { session });

        if (updateResult.modifiedCount === 0) {
            throw new Error("Aborting transaction: failed to update the person's " +
                "zoomsArray in the database.");
        }

        await session.commitTransaction();

        return {
            originalZooms: zoomsArray.length,
            updatedZooms: updatedZoomsArray.length
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}


module.exports = {
    updatePersonSlimesNegatively,
    updatePersonSlimesPositively,
    updatePersonZoomPositively,
    updatePersonZoomNegatively
}

