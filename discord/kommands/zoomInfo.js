const { getZoomInfoByUserId } = require("../../database/read");
const { idSearch } = require("../../helpers/members");
const {log, handleError} = require("../../helpers/logging");

module.exports = {
    name: "zoomInfo",
    description: "Get the Zoom Count and the Zoom Times for the Specified User.",
    aliases: ["zself"],
    async execute(commandName, message, args) {
        try {
            let discordUserId;
            if (args.length === 0) {
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

            // Having arrived here, discordUserId IS assigned a string
            const result = await getZoomInfoByUserId(discordUserId);
            if (result.zoomCount === 0) {
                await message.reply({
                    content: `${result.name} has not yet zoomed this season.`,
                    allowedMentions: { repliedUser: false }
                });

            } else {
                const zoomCount = result.zoomCount;
                const zoomTimes = result.zoomTimes.join(', ');
                const username = result.name;
                await message.reply({
                    content: `${username} has ${zoomCount} zooms at times: \n ${zoomTimes}`,
                    allowedMentions: { repliedUser: false }
                });
            }

        } catch (error) {
            log(`Error in command function zoomInfo(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the zoomInfo kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}