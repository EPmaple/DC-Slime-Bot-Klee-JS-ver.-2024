/*
This command is mainly used for adding new members in the midst of a Ragna
 */
const fs = require('fs');
const path = require('path');
const { createPersonDoc, insertPersonDoc, createSlimeDoc}
    = require("../../database/create");
const { updateCachedMemberList, addObjectToCachedIndividualSlimeCounts }
    = require("../../cache/initCache");
const { log, handleError } = require('../../helpers/logging');
const {getPeopleCollection} = require("../../database/initDb");
const {ObjectId} = require("mongodb");
const {getCurrentDateAndDate} = require("../../helpers/time");
const {getName} = require("../../helpers/members");
const {updatePersonSlimesPositively} = require("../../database/update");
// __dirname contains the directory name of the current module
const memberListPath = path.join(__dirname, '../../consts/memberList.js');

/*
example of what updatedContent looks like:
const updatedContent = `
const nameId = {
  "johnDoe": "123",
  "janeDoe": "456"
};
const idName = {
  "123": "johnDoe",
  "456": "janeDoe"
};
module.exports = { nameId, idName };
`;
 */

module.exports = {
    name: 'addMember',
    description: 'Add a new member',
    async execute(commandName, message, args) {
        try {
            /*
            The args of the command addMember must be of form
            !addMember <discord_user_id> <name>
             */
            if (args.length < 2) {
                await message.reply({
                   content: 'Invalid command format. ' +
                       'Use !addMember discordUserId name',
                    allowedMentions: { repliedUser: false }
                });
                return;
            }

            const discordUserId = args[0];
            const name = args[1];

            // ADD THE NEW MEMBER TO THE DATABASE
            // Create the formatted person doc via createPerson
            const personDoc = createPersonDoc(discordUserId, name);
            await insertPersonDoc(personDoc);
            // ADD THE NEW MEMBER TO THE DATABASE

            // ADD THE NEW MEMBER TO THE CACHE
            updateCachedMemberList(name, discordUserId);
            addObjectToCachedIndividualSlimeCounts(discordUserId);
            // ADD THE NEW MEMBER TO THE CACHE

            // ***************************************************************

            // ADD THE NEW MEMBER TO consts/memberList.js
            const { nameId, idName } = require(memberListPath);

            nameId[name] = discordUserId;
            idName[discordUserId] = name;

            /*
            *** Create the updated content for the file ***
            JSON.stringify converts the object to a JSON string, including the
            curly braces and indentations for readability
             */
            const updatedContent = `
            const nameId = ${JSON.stringify(nameId, null, 2)};
            const idName = ${JSON.stringify(idName, null, 2)};
            module.exports = { nameId, idName }; 
            `;

            // *** Write the updated content to the file ***
            fs.writeFileSync(memberListPath, updatedContent, 'utf8');

            /*
                require.resolve(moduleName) returns the resolved absolute path of
            the module, used to find out where a module file is located
                modulePath = require.resolve(moduleName)
                delete require.cache[modulePath], removes the module from the
            cache, forcing Node.js to reload the module the next time it is
            required
             */
            delete require.cache[require.resolve(memberListPath)];

            /*
            Re-require the updated module, load the updated member list from the file
             */
            require(memberListPath);

            await message.reply({
                content: `${name} with ID ${discordUserId} has been successfully
            added as a member.`,
                allowedMentions: { repliedUser: false}
            });

            return updatedMemberList; // updatedMemberList.nameId/idName
        } catch (error) {
            log(`Error in command function addMember(): ${error}`)
            handleError(error);
            await message.reply({
                content: 'An error occurred during the addMember kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}






