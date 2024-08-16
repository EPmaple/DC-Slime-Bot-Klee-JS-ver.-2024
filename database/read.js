const { getCurrentDateAndDate } = require('../helpers/time');
const { getPeopleCollection, getSlimeRecordsCollection } = require("./initDb");
const {log, handleError} = require("../helpers/logging");
// ******************************************************
/*
result = {
    "count": 13,
    "name": "17maple"
}
 */
async function getSlimesCountByUserId(discordUserId) {
    try {
        /*  !!!!!!!!!!!!!!!!!!!!!!!
        If no docs match the criteria in the $match stage, the pipeline
        effectively has no docs to process further, and the final output
        of the aggregation pipeline will be an empty array
         */
        const pipeline = [
            { $match : { _id : discordUserId } }, // Match docs with the specified _id
            { $project: { _id: 0, name: 1, count: { $size: "$slimes" } } }
        ];
        // const pipeline = [
        //     { $match : { _id : discordUserId } }, // Match docs with the specified _id
        //     { $unwind : "$slimes" }, // Deconstruct the slimes array, creates a separate doc for each value in the array
        //     { $group : { _id: null, count: { $sum: 1 } } }, // Group docs and sum the slimes
        //     { $project : { _id : 0, count : 1} } // Project the count field, exclude _id
        // ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();

        if (result.length > 0) {
            return result[0]; // Return the doc, doc.name or doc.count
        } else {
            throw new Error("No document found with the specified discordUserId " +
                `${discordUserId}.`);
        }
    } catch (error) {
        // log(`Error in database function getSlimesCountByUserId(${discordUserId}):
        // ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
// returns type string; "2024-05-18"
// const getCurrentDate = () => {
//     const date = new Date();
//     // console.log(date); // e.g., Sat May 18 2024 12:34:56 GMT+0000 (UTC)
//     const isoString = date.toISOString(); // e.g., "2024-05-18T12:34:56.789Z"
//     return isoString;
//     // return currentDate = isoString.slice(0, 10); // "2024-05-18"
// }

/*
uses the dynamically created regular expression to match docs where the time
field starts with currentDate
 */
async function getDailySlimesCount() {
    const currentDate = getCurrentDateAndDate().slice(0, 10);

    try {
        const pipeline = [
            { $match: { time: { $regex: `^${currentDate}` } } },
            // { $match : { time : /^{currentDate}/ } },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ];

        /*
        if no docs match the criteria in the $match stage, the pipeline has no
        docs to process further and the final output of the aggregation
        pipeline will be an empty array
         */
        const result = await getSlimeRecordsCollection().aggregate(pipeline).toArray();

        let formattedResult = {
            date: currentDate,
            count: 0
        };
        if (result.length > 0) {
            formattedResult.count = result[0].count;
        }
        return formattedResult;
    } catch (error) {
        // log(`Error in database function getDailySlimesCount(): ${error}`);
        // handleError(error);
        throw error;
    }
}


// result will be an array of objects, where each object is
// { _id: ..., slimeCount: ... }
async function getIndividualCounts() {
    try {
        const pipeline = [
            { $project: { _id: 1, slimeCount: { $size: "$slimes" } } }
        ]

        const result = await getPeopleCollection().aggregate(pipeline).toArray();
        if (result.length === 0) {
            throw new Error('The length of the result array is zero, meaning ' +
                'there is no doc in the peopleCollection.');
        }

        return result;
    } catch (error) {
        // log(`Error in database function getIndividualCounts(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
/* Example of result
const result = [
    { name: "17maple", _id: "253994447782543361" },
    { name: "Cats", _id: "359361962414440449" },
    { name: "Cats On Mars", _id: "359361962414440449" }
];
 */
async function getNameAndId() {
    try {
        /*
        in mongoDB, id(memberId) is always returned unless o.w. specified
         */
        const pipeline = [
            { $project: { name: 1, _id: 1 } }
        ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();

        /*
        The length check below is for safety, as the peopleCollection of every
        database should've been initialized with default docs for every member
         */
        // if (result.length === 0) {
        //     throw new Error('The length of the result array is zero, meaning ' +
        //         'there is no doc in the peopleCollection.');
        // }

        return result;
    } catch (error) {
        // log(`Error in database function getNameAndId(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
// Format of output is similar to getSeasonalZoomInfo() down below
/*
{
    "individualCounts": [
        { "name": "Minh", "slimeCount": 4 },
        { "name": "Vent", "slimeCount": 4 },
        { "name": "DaFoo", "slimeCount": 3 }
    ],
    "totalCount": [
        { "totalSlimeCount": 11 }
    ]
}
 */
async function getSeasonalSlimeInfo() {
    try {
        const pipeline = [
            { $facet: { individualCounts: [ { $project: { _id: 0, name: 1, slimeCount: { $size: "$slimes" } } } ],
                    totalCount: [
                        { $unwind: "$slimes" },
                        { $group: { _id: null, totalSlimeCount: { $sum: 1 } } },
                        { $project: { _id: 0, totalSlimeCount: 1 } }
                    ] } }
        ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();

        if (result.length === 0) {
            throw new Error('The length of the result array is zero, meaning ' +
                'there is no doc in the peopleCollection.');
        }

        /*
        result is an array, result[0] returns the first json object in the
        array, which has elements "individualCounts" and "totalCount"
         */
        return result[0];
    } catch (error) {
        // log(`Error in database function getSeasonalSlimeInfo(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
/*
{
    "individualCounts": [
        { "name": "Minh", "zoomCount": 4 },
        { "name": "Vent", "zoomCount": 4 },
        { "name": "DaFoo", "zoomCount": 3 }
    ],
    "totalCount": [
        { "totalZoomCount": 11 }
    ]
}
 */
async function getSeasonalZoomInfo() {
    try {
        const pipeline = [
            { $facet: { individualCounts: [ { $project: { _id: 0, name: 1, zoomCount: { $size: "$zooms" } } } ],
                    totalCount: [
                        { $unwind: "$zooms" },
                        { $group: { _id: null, totalZoomCount: { $sum: 1 } } },
                        { $project: { _id: 0, totalZoomCount: 1 } }
                    ] } }
        ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();

        if (result.length === 0) {
            throw new Error('The length of the result array is zero, meaning ' +
                'there is no doc in the peopleCollection.');
        }

        return result[0];
    } catch (error) {
        // log(`Error in database function getSeasonalZoomInfo(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************

/*
example output:
[
    { "name": "Maple", "slimeCount": 10, "rank": 1 },
    { "name": "Gunther", "slimeCount": 10, "rank": 1 },
    { "name": "Alice", "slimeCount": 9, "rank": 2 },
    { "name": "Bob", "slimeCount": 8, "rank": 3 }
]
 */
async function getTop3SlimeRankings() {
    try {
        const pipeline = [
            { $project: { name: 1, slimeCount: { $size: "$slimes"} } },
            { $sort: { slimeCount: -1 } },
            { $setWindowFields: { partitionBy : null, sortBy : { slimeCount : -1 }, output : { rank : { $denseRank: {} } } } },
            { $match : { rank : { $in : [1,2,3] } } }, // Filter for first, second, third
            { $project : { _id : 0, name : 1, slimeCount : 1, rank : 1 } }
        ];
        // const pipeline = [
        //     { $unwind : "$slimes" }, // Unwind the slimes array
        //     // Grouping by _id (discordUserId), and use $first to carry forward the name field
        //     { $group : { _id : "$_id", name : { $first : "$name" }, slimeCount : { $sum : 1 } } },
        //     { $sort : { slimeCount : -1 } }, // Sort by slimeCount in descending order
        //     /*
        //         partitionBy : null treats the previous aggregated docs as a single group
        //         output : { rank : { $denseRank: {} } }, we are adding the 'rank' field to each
        //     doc from the previous aggregation
        //      */
        //     { $setWindowFields: { partitionBy : null, sortBy : { slimeCount : -1 }, output : { rank : { $denseRank: {} } } } },
        //     { $match : { rank : { $in : [1,2,3] } } }, // Filter for first, second, third
        //     { $project : { _id : 0, name : 1, slimeCount : 1, rank : 1 } }
        // ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();
        /*
            Given all members are initialized with default slimes array of size zero,
        if everyone has zero slimes summoned, then still everyone is rank 1
            The array is returned to be used in a "for each"
         */
        if (result.length === 0) {
            throw new Error('The length of the array is zero, meaning there is no ' +
                'doc in the peopleCollection.');
        }
        return result;
    } catch (error) {
        // log(`Error in database function getTop3SlimeRankings(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
/*
Example result:
result = [
    {
        "count": 12
    }
]
 */
async function getTotalSlimeCount() {
    try {
        const pipeline = [
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0, count: 1 } }
        ];
        const result = await getSlimeRecordsCollection().aggregate(pipeline).toArray();
        /*
        Meaning there are no docs in the slimeRecordsCollection, and thus the
        totalSlimeCount should be 0
         */
        if (result.length === 0) {
            return 0;
        }
        return result[0].count; // totalSlimeCount

    } catch (error) {
        // log(`Error in database function getTotalSlimeCount(): ${error}`);
        // handleError(error);
        throw error;
    }
}

// ******************************************************
/* example output of result, where the object is result[0]
[
    {
        "name": "17maple",
        "zoomCount": 3,             default: 0
        "zoomTimes": [              default: []
            "2024-05-01T10:00:00Z",
            "2024-05-02T11:00:00Z",
            "2024-05-03T12:00:00Z"
        ]
    }
]
 */
async function getZoomInfoByUserId(discordUserId) {
    try {
        const pipeline = [
            { $match : { _id : discordUserId } },
            /*
            Use $size to count the number of elements in zooms array
            zoomTimes is an array containing the time field of each zoom doc in zooms array
             */
            { $project : { _id : 0, name : 1, zoomCount : { $size : "$zooms" }, zoomTimes : "$zooms.time" } }
        ];

        const result = await getPeopleCollection().aggregate(pipeline).toArray();
        if (result.length === 0) {
            throw new Error(`The length of the array is zero, meaning there is no `+
            `matching doc for discordUserId: ${discordUserId} in the peopleCollection.`);
        }
        // log(JSON.stringify(result[0]))
        return result[0];
    } catch (error) {
        // log(`Error in database function getZoomInfoByUserId(): ${error}`);
        // handleError(error);
        throw error;
    }
}


module.exports = {
    getSlimesCountByUserId, getDailySlimesCount,
    getTop3SlimeRankings, getZoomInfoByUserId,
    getSeasonalZoomInfo, getSeasonalSlimeInfo,
    getNameAndId, getTotalSlimeCount, getIndividualCounts
};

