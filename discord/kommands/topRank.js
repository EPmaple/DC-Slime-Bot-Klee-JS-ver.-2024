const { getTop3SlimeRankings } = require('../../database/read');
const {log, handleError} = require("../../helpers/logging");

module.exports = {
    name: "topRank",
    description: "Get the Names and Slime Counts for the Top Three Ranks.",
    aliases: ["rank"],
    async execute(commandName, message, args) {
        try {
            const rankings = await getTop3SlimeRankings();

            let firstSlimeCount, secondSlimeCount, thirdSlimeCount;
            const first = [];
            const second = [];
            const third = [];

            /*
                Process the rankings, an array of objects with properties: name,
            slimeCount, rank
                Using destructuring to extract the properties from each object in
            the rankings array
             */
            for (const { name, slimeCount, rank } of rankings) {
                if (rank === 1) {
                    firstSlimeCount = slimeCount;
                    first.push(name);
                } else if (rank === 2) {
                    secondSlimeCount = slimeCount;
                    second.push(name);
                } else if (rank === 3) {
                    thirdSlimeCount = slimeCount;
                    third.push(name);
                }
            }

            // Format the response string
            let response = '';
            if (first.length > 0) {
                response += `The current first (with ${firstSlimeCount} slimes): `+
                `${first.join(', ')}.\n`
            }
            if (second.length > 0) {
                response += `The current second (with ${secondSlimeCount} slimes): `+
                `${second.join(', ')}.\n`;
            }
            if (third.length > 0) {
                response += `The current third (with ${thirdSlimeCount} slimes): `+
                `${third.join(', ')}.\n`;
            }
            response += "They are the best! ⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾";

            await message.reply({
                content: response,
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            log(`Error in command function topRank(): ${error}`);
            handleError(error);
            await message.reply({
                content: 'An error occurred during the topRank kommand, please try' +
                    ' again later.',
                allowedMentions: { repliedUser: false }
            });
        }
    }
}