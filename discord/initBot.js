// initBot.js
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('../config.json');
const kommandHandler = require('../handlers/kommandHandler');
const { log, handleError } = require('../helpers/logging');

const client = new Client({
   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
   GatewayIntentBits.MessageContent]
});

async function initBot() {
    try {
        client.once('ready', () => {
            log('Bot is online!');
        });

        kommandHandler(client); // Load and handle kommands

        await client.login(token);

        log('Successfully initialized discord bot.');
    } catch (error) {
        log(`Error in init function initBot(): ${error}`);
        handleError(error);
        process.exit(1); // Exit with failure
    }
}

module.exports = {
    initBot,
    getClient: () => client
}