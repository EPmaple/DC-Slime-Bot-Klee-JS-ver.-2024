// helpers/initSync.js
const { getPeopleCollection } = require('../database/initDb');
const { nameId, idName } = require('../consts/memberList');
const { getNameAndId } = require('../database/read');
const { createPersonDoc, insertPersonDoc } = require('../database/create');
const { log, handleError } = require("./logging");

// initSynchronization() must be called after initDbConnection()
async function initSynchronization() {
    try {
        await syncMembers();
        log('Successfully verified synchronization.')
    } catch (error) {
        log(`Error in init function initSynchronization(): ${error}`);
        handleError(error);
        process.exit(1); // Exit with failure
    }
}

async function syncMembers() {
    try {
        log('Starting synchronization of the database with const/memberList.js.');

        const dbMembers = await getNameAndId();

        if (dbMembers === null || dbMembers.length === 0) {
            log('No documents found in the database. Assuming this is a new collection.');
        }

        /*
            Use optional chaining and default to an empty array if dbMembers is null
            When used inside new Map(), each array becomes a key-value pair in the
        resulting map
         */
        const dbMemberMap = new Map(dbMembers?.map(member => [member._id, member.name])
            || [])

        let membersToAdd = 0;

        for (const [discordUserId, name] of Object.entries(idName)) {
            if (!dbMemberMap.has(discordUserId)) {
                const personDoc = createPersonDoc(discordUserId, name);
                await insertPersonDoc(personDoc);
                log(`Added ${name} with ID ${discordUserId} to the database.`);
                membersToAdd++;
            }
        }

        if (membersToAdd === 0) {
            log('The database is already in sync with const/memberList.js. ' +
                'No updates were necessary.');
        } else {
            log('The database has been synced up with const/memberList.js. ' +
                `${membersToAdd} new members were added.`);
        }
    } catch (error) {
        // log(`Error in init function syncMembers(): ${error}`);
        // handleError(error);
        throw error;
    }
}

module.exports = {
    initSynchronization,
}



