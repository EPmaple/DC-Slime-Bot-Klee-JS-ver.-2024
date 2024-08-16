const { idSearch } = require('../../helpers/members');
const { getSlimesCountByUserId } = require('../../database/read');
const {log, handleError} = require("../../helpers/logging");
/*
!self, without any parameters, would return the slime info of the message author
else, !slimeCount username, shows the slime count of the user w/ username
 */

module.exports = {
    name: 'slimeCount',
    description: 'Get the Slime Count of the said user, or the message author ' +
        'if unspecified',
    aliases: ['sself'],
    async execute(commandName, message, args) {
        try {
            let discordUserId;
            if (args.length === 0) { // If user unspecified
                discordUserId = message.author.id;

            } else { // Possibly a user specified
                const originalString = args.join(' ');
                discordUserId = idSearch(message, originalString);
                if (discordUserId === null) {
                    const response = `The specified username ${message} is not valid.`
                    await message.reply({
                        content: response,
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
            }
            // log(`logging discordUserId for debug: ${discordUserId}`)
            // Having arrived here, discordUserId IS assigned a string
            const result = await getSlimesCountByUserId(discordUserId);
            // getSlimesCountByUserId() may throw an error, and it would be
            // handled by the catch block
            const slimeCount = result.count;
            const name = result.name;
            const response = `User ${name} has summoned ${slimeCount} slimes.`
            await message.reply({
                content: response,
                allowedMentions: { repliedUser: false }
            });

        } catch (error) {
            log(`Error in command function slimeCount(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the slimeCount kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}