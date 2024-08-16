const { idSearch, getName} = require('../../helpers/members');
const { isNumber } = require("../../helpers/number");
const { ObjectId } = require("mongodb");
const { getCurrentDateAndDate } = require("../../helpers/time");
const { updatePersonZoomPositively, updatePersonZoomNegatively }
    = require('../../database/update');
const {log, handleError} = require("../../helpers/logging");
const {getPeopleCollection} = require("../../database/initDb");

/*
!zoom/!addZoom
!zoom user/!addZoom user
!zoom number user/!addZoom number user
else invalid
 */

module.exports = {
    name: 'addZoom',
    description: 'Add a positive or a negative number of zooms to the specified ' +
        'user.',
    aliases: ['zoom'],
    async execute(commandName, message, args) {
        try {
            let discordUserId, numOfZooms;
            // !zoom/!addZoom: By default, add one zoom to message author
            if (args.length === 0) {
                discordUserId = message.author.id;
                numOfZooms = 1;

            // !zoom user/!addZoom user: Add one zoom to the specified user
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
                    })
                    return;
                }
                numOfZooms = 1;

            // !zoom numOfZooms user
            } else if (args.length === 2) {
                if (!isNumber(args[0])) {
                    await message.reply({
                        content: 'Please enter a valid number for the ' +
                            'numberOfSlimes to be added.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
                numOfZooms = Number(args[0]);

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

            // **********************************************************
            const username = getName(discordUserId);

            if (numOfZooms > 0) {
                const zoomsToAdd = []; // Array of zoom objects
                for (let i = 0; i < numOfZooms; i++) {
                    const zoom = {
                        _id: new ObjectId(),
                        time: getCurrentDateAndDate()
                    }
                    zoomsToAdd.push(zoom);
                }
                // zoomsToAdd.forEach(zoom => {
                //     log(JSON.stringify(zoom))
                // })

                const object = await updatePersonZoomPositively(discordUserId, zoomsToAdd);

                const response = `The number of times ${username} zoomed has been `+
                `changed from ${object.originalZoomCount} to ${object.updatedZoomCount}.\n`+
                `Zooms in the last 7 days: ${object.numOfZoomsInPastSevenDays}. `+
                `ヽ( \`д´*)ノ Why did you zoom ?!`
                await message.reply({
                    content: response,
                    allowedMentions: { repliedUser: false }
                })

            } else { // Then numOfZooms would be negative, let's make it positive so it
                // matches with the logic in updatePersonZoomNegatively
                const object = await updatePersonZoomNegatively(discordUserId, -numOfZooms);
                if (object === null) {
                    const response = `No more zooms can be removed from ${username} for ` +
                        `s/he currently has zero zooms.`
                    await message.reply({
                        content: response,
                        allowedMentions: { repliedUser: false }
                    })
                    return
                }

                const response = `The number of times ${username} zoomed has been `+
                `changed from ${object.originalZooms} to ${object.updatedZooms}.`
                await message.reply({
                    content: response,
                    allowedMentions: { repliedUser: false }
                })
            }

        } catch (error) {
            log(`Error in command function addZoom(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the addZoom kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}


