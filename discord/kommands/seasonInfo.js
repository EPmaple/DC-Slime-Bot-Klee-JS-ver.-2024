const { getSeasonalSlimeInfo, getSeasonalZoomInfo } = require('../../database/read');
const {log, handleError} = require("../../helpers/logging");

module.exports = {
    name: 'seasonInfo',
    description: 'Get the current ragna season info',
    aliases: ['sinfo'],
    async execute(commandName, message, args) {
        try {
            let response = '';

            const seasonalSlimeInfo = await getSeasonalSlimeInfo();

            if (!seasonalSlimeInfo) { // if is 'null'
                response += 'No data found for Seasonal Slime Info.\n';
            } else {
                /*
                Optional operator is used to safe guard against the structure
                of seasonalSlimeInfo not as expected
                 */
                const totalSlimeCount = seasonalSlimeInfo.totalCount[0]?.totalSlimeCount
                || 0;

                const individualCounts = seasonalSlimeInfo.individualCounts; // Array
                const individualCountsString = individualCounts.map(c =>
                `${c.name}: ${c.slimeCount}`).join(', ');

                response += `Seasonal Slime Count: ${totalSlimeCount}, and Seasonal Slime `+
                `Record: \n \t {${individualCountsString}}.\n`;
            }

            const seasonalZoomInfo = await getSeasonalZoomInfo();

            if (!seasonalZoomInfo) { // if it is 'null'
                response += "No data found for Seasonal Zoom Info.\n";
            } else {
                /*
                seasonalZoomCounts.totalCount[0] grabs the first doc in the result
                If totalZoomCount is null or undefined then 0 would be returned
                Else totalZoomCount of the only doc would be returned
                 */
                const totalZoomCount = seasonalZoomInfo.totalCount[0]?.totalZoomCount
                || 0;

                const individualCounts = seasonalZoomInfo.individualCounts; // Array
                const individualCountsString = individualCounts.map(c =>
                `${c.name}: ${c.zoomCount}`).join(', ');

                response += `Seasonal Zoom Count: ${totalZoomCount}, and Seasonal Zoom `+
                `Record: \n \t {${individualCountsString}}.\n`;
            }

            if (response.trim() !== "") {
                await message.reply({
                    content: response,
                    allowedMentions: { repliedUser: false }
                });
            }
        } catch (error) {
            log(`Error in command function seasonInfo(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the seasonInfo kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}