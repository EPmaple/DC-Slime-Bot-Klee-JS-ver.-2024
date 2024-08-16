const { isNumber } = require('../../helpers/number');
const { idSearch, getName } = require('../../helpers/members');
const { ObjectId } = require("mongodb");
const { getCurrentDateAndDate } = require("../../helpers/time");
const { updateCachedTotalSlimeCount, getCachedData,
    updateCachedIndividualSlimeCounts, getCachedIndividualSlimeCounts }
    = require("../../cache/initCache");
const { createSlimeDoc } = require("../../database/create");
const { updatePersonSlimesNegatively, updatePersonSlimesPositively }
    = require('../../database/update');
const { MENTION_KLEEJSTEST_ROLE } = require('../../consts/const');
const { mongoDbClient, getPeopleCollection, getSlimeRecordsCollection } = require("../../database/initDb");
const { log, handleError } = require("../../helpers/logging");
/*
this command, "!add 1 maple", parse the args, if args length != 2, then error,
else numberOfSlimes = args[0], name = args[1], discordId = idSSearch

!u/!add: no args, add 1 slime to the message author
!u user/!add user: 1 arg, add 1 slime to the specified user
!add numOfSlimes user: 2 args, add the numOfSlimes to the specified user
else, invalid
 */



module.exports = {
    name: 'addSlime',
    description: 'Add a positive or a negative number of slimes to the specified ' +
        'user.',
    aliases: ['add', 'u'],
    async execute(commandName, message, args) {
        try {
            let discordUserId, numOfSlimes;
            // !u/!add: By default, add one slime to message author
            if (args.length === 0) {
                discordUserId = message.author.id;
                numOfSlimes = 1;
            // !u user/!zoom user: Add one slime to the specified user
            } else if (args.length === 1) {
                if (isNumber(args[0])) {
                    await message.reply({
                        content: 'The specified username is not valid.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }

                discordUserId = idSearch(message, args[0]);
                if (discordUserId === null) {
                    await message.reply({
                        content: 'The specified username is not valid.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
                numOfSlimes = 1;
            // !u numOfSlimes user/!add numOfSlimes user
            } else if (args.length === 2) {
                if (!isNumber(args[0])) {
                    await message.reply({
                        content: 'Please enter a valid number for the ' +
                            'numberOfSlimes to be added.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
                numOfSlimes = Number(args[0]);

                discordUserId = idSearch(message, args[1]);
                if (discordUserId === null) {
                    await message.reply({
                        content: 'The specified username is not valid.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
            } else {
                await message.reply({
                    content: 'Invalid command format. ' +
                        'Use !add numOfSlimes name',
                    allowedMentions: { repliedUser: false }
                });
                return;
            }

            /*
            Having arrived here, variables discordUserId and numOfSlimes would
            be valid, and it is most immediate to role mention everyone for the slime
             */
            if (commandName === 'u') {
                const mentionMsg = `${MENTION_KLEEJSTEST_ROLE} ${getName(discordUserId)}\n`;
                await message.reply({
                    content: mentionMsg,
                    allowedMentions: { repliedUser: false }
                });
            }

            // Above are argument parsings ******************************
            // **********************************************************

            if (numOfSlimes > 0) {
                // Create the array containing _id of slimes to be added
                const slimesToAdd = [];
                for (let i = 0; i < numOfSlimes; i++) {
                    slimesToAdd.push(new ObjectId());
                }

                // Create the corresponding slimeDocs using _id
                const slimeDocsToAdd = [];
                const time = getCurrentDateAndDate();
                const name = getName(discordUserId);
                for (const _id of slimesToAdd) {
                    // Increment the total number of slimes, 0 to 1
                    updateCachedTotalSlimeCount();
                    // Use new totalSlimeCount, 1
                    const slimeId = getCachedData().totalSlimeCount;
                    const newSlimeDoc = createSlimeDoc(_id, slimeId, time, discordUserId, name);
                    slimeDocsToAdd.push(newSlimeDoc);
                }

                await updatePersonSlimesPositively(discordUserId, slimesToAdd, slimeDocsToAdd);

                // Above are database updates *****************************

                const originalSlimeCount = getCachedIndividualSlimeCounts(discordUserId);
                // Given successful database update, update the number of slimes
                // in the local cache
                updateCachedIndividualSlimeCounts(discordUserId, numOfSlimes);
                const updatedSlimeCount = getCachedIndividualSlimeCounts(discordUserId);

                let followupMsg;
                const username = getName(discordUserId);
                if (commandName === 'u') {
                    followupMsg = `Woah, a slime! Klee has counted ${updatedSlimeCount} ` +
                    `slimes for ${username}`;
                } else {
                    followupMsg = `The number of slimes ${username} has `+
                    `summoned has been added by Klee (⋆˘ᗜ˘⋆✿), going from `+
                    `${originalSlimeCount} to ${updatedSlimeCount}.`;
                }

                // And then reply with the updated slime count for the specified user
                await message.reply({
                    content: followupMsg,
                    allowedMentions: { repliedUser: false }
                });

            } else { // numOfSlimes would be negative, but we need to pass in a positive
                // number for updatePersonSlimesNegatively to work properly
                const updateResults = await updatePersonSlimesNegatively(discordUserId, -numOfSlimes);

                // Given successful database update, update the number of slimes
                // in the local cache; note numOfSlimes is still a negative number
                // in this scope
                updateCachedIndividualSlimeCounts(discordUserId, numOfSlimes);

                const followupMsg = `The number of slimes ${getName(discordUserId)} has `+
                        `summoned has been subtracted by Klee (⋆˘ᗜ˘⋆✿), going from ` +
                        `${updateResults.originalSlimeCount} to `+
                        `${updateResults.updatedSlimeCount}.`
                await message.reply({
                    content: followupMsg,
                    allowedMentions: { repliedUser: false }
                });
            }

        } catch (error) {
            log(`Error in command function addSlime(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the addSlime kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}








