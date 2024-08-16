const { getTotalSlimeCount, getIndividualCounts }
    = require("../database/read");
const {log, handleError} = require("../helpers/logging");

/*
cachedData is an object, and objects in JS are reference types. When an object
is exported and required in another file, the reference to that object is
exported. Any updates to the object will be reflected wherever the object
is referenced.
 */
let cachedData = {
    nameId: {},
    idName: {},
    totalSlimeCount: 0,
    individualSlimeCounts: []
}

// const nameId = {};
// const idName = {};

/* Example of result
const result = [
    { name: "17maple", _id: "253994447782543361" },
    { name: "Cats", _id: "359361962414440449" },
    { name: "Cats On Mars", _id: "359361962414440449" }
];
await pauses the execution of the async function until the promise is resolved
 */
// async function cacheMemberList() {
//     try {
//         const result = await getNameAndId();
//
//         if (result === null) {
//             console.warn('No documents found in the peopleCollection. ' +
//                 'MemberList fail to be cached.');
//             return;
//         }
//
//         result.forEach(element => {
//             const name = element.name;
//             const _id = element._id.toString();
//
//             cachedData.nameId[name] = _id;
//             cachedData.idName[_id] = name;
//         });
//
//         console.log('Member list cached successfully.')
//     } catch (error) {
//         // console.error('Error caching member list during startup: ', error);
//         log(`Error in init function cacheMemberList(): ${error}`);
//         handleError(error);
//     }
// }

function updateCachedMemberList(name, _id) {
    cachedData.nameId[name] = _id;
    cachedData.idName[_id] = name;
}


// ************************************************


async function cacheTotalSlimeCount() {
    try {
        cachedData.totalSlimeCount = await getTotalSlimeCount(); // Cache the result
        log('Successfully cached total slime count.');

    } catch (error) {
        // log(`Error in init function cacheTotalSlimeCount(): ${error}`);
        // handleError(error);
        throw error
    }
}

function updateCachedTotalSlimeCount() {
    cachedData.totalSlimeCount += 1;
}


// ************************************************


async function cacheIndividualSlimeCounts() {
    try {
        cachedData.individualSlimeCounts = await getIndividualCounts();
        log('Successfully cached individual slime counts.');

    } catch (error) {
        // log(`Error in init function cacheIndividualSlimeCounts(): ${error}`);
        // handleError(error);
        throw error;
    }
}

function updateCachedIndividualSlimeCounts(discordUserId, numOfSlimes) {
    try {
        /*
        find() method of Array returns the first element in the provided array
        that satisfies the provided testing function. If no values satisfy the
        testing function, undefined is returned.
         */
        const user = cachedData.individualSlimeCounts.find(user => user._id === discordUserId);
        if (user) {
            log(`user.slimeCount: ${typeof user.slimeCount}, numOfSlimes: ${typeof numOfSlimes}`)
            user.slimeCount += numOfSlimes;
            if (user.slimeCount < 0) {
                user.slimeCount = 0;
            }

        } else {
            throw new Error(`User with ID ${discordUserId} not found in cache.`);
        }
    } catch (error) {
        // log(`Error in cache function
        // updateCachedIndividualSlimeCounts(${discordUserId}, ${numOfSlimes}): ${error}`);
        // handleError(error);
        throw error;
    }
}

function addObjectToCachedIndividualSlimeCounts(discordUserId, numOfSlimes = 0) {
    cachedData.individualSlimeCounts.push({ _id: discordUserId, slimeCount: numOfSlimes });
    // console.log(`Added new user with ID ${discordUserId} and initial slime
    // count ${numOfSlimes} to cache.`);
}

function getCachedIndividualSlimeCounts(discordUserId) {
    try {
        const user = cachedData.individualSlimeCounts.find(user => user._id === discordUserId);
        if (user) {
            return user.slimeCount;
        } else {
            throw new Error(`User with ID ${discordUserId} not found in cache.`);
        }
    } catch (error) {
        // log(`Error in cache function getCachedIndividualSlimeCounts(${discordUserId}): ${error}`);
        // handleError(error);
        throw error;
    }
}


// ************************************************

async function initCachedData() {
    try {
        // await cacheMemberList();
        await cacheTotalSlimeCount();
        await cacheIndividualSlimeCounts();
        log('Successfully cached necessary data.');
    } catch (error) {
        // console.log('Error initializing cached data: ', error);
        log(`Error in init function initCachedData(): ${error}`);
        handleError(error);
        process.exit(1); // Exit with failure
    }
}


module.exports = {
    initCachedData,
    getCachedData: () => cachedData,
    updateCachedMemberList, updateCachedTotalSlimeCount,
    updateCachedIndividualSlimeCounts,
    addObjectToCachedIndividualSlimeCounts,
    getCachedIndividualSlimeCounts
}

