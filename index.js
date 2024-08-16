// index.js
const { initDbConnection } = require('./database/initDb');
const { initBot } = require('./discord/initBot');
const { initCachedData } = require('./cache/initCache');
const { initSynchronization } = require('./helpers/initSync');
const { log } = require('./helpers/logging');

async function main() {
    try {
        await initDbConnection();
        await initBot();
        await initSynchronization();
        await initCachedData();
        log('All initializations completed successfully. Bot is now ready!')
    } catch (error) {
        console.error('Error during initialization: ', error);
        process.exit(1); // Exit with failure
    }
}

/*
    The IIFE is necessary b/c you can't use await directly at the top level in a
CommonJS module. By using an async IIFE, you can await the main function call
    IIFE (Immediately Invoked Function Expression) is a function that is defined
and executed immediately after its creation. It allows you to run code
immediately within a local scope, which helps avoid polluting the global namespace.
 */
(async () => {
    await main();
})();