/*
discord/kommands/daily.js
 */

const { getDailySlimesCount } = require('../../database/read');
const { log, handleError } = require("../../helpers/logging");
const { getUTCDayName } = require('../../helpers/time')

module.exports = {
    name: 'daily',
    description: 'Get Daily Slimes Count',
    async execute(commandName, message, args) {
        try {
            const dailyResult = await getDailySlimesCount();

            const weekday = getUTCDayName();
            const response = `As of ${weekday}, ${dailyResult.date} (UTC), `+
            `we have summoned ${dailyResult.count} slimes so far.`;

            await message.reply({
                content: response,
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            log(`Error in command function daily(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the daily kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}