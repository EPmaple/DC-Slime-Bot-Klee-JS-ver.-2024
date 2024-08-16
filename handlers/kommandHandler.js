/*
built-in Node.js modules
fs for interacting with file system, such as reading files or directories
path for handling and transforming paths
 */
const fs = require('fs');
const path = require('path');
const { log, handleError } = require('../helpers/logging');
const { CID_BOTTESTING_CHANNEL } = require('../consts/const');

/*
exports a function that takes client as parameter
allows the bot client to be passed in and set up command handling
 */
module.exports = (client) => {
    /*
    commands property will be automatically created if they don't already exist in
    the object
     */
    client.commands = new Map();

    /*
    __dirname is a Node.js global variable that refers to the path relative to the file
    in which __direname is used
     */
    const commandFiles = fs.readdirSync(path.join(__dirname, '../discord/kommands'))
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../discord/kommands/${file}`);
        // Key: command.name
        // Value: the entire command object with properties: name, description, execute
        client.commands.set(command.name.toLowerCase(), command);
    }

    client.on('messageCreate', async (message) => {
        // Check if the message is from BOTTESTING channel
        if (message.channel.id !== CID_BOTTESTING_CHANNEL) return;

        /*
        In the context of a messageCreate event, message.member refers to the
        member object of the author of the message within the server(guild)
         */
        log(`[chat] ${message.member.displayName}: ${message.content}`);

        if (!(message.content.startsWith('!') || message.content.startsWith('.'))
        || message.author.bot) return;
        /*
            slice(1) removes the first character: "!addPerson" => "addPerson"
            split() divides the string into an array of substrings;
        the regular expression / +/ is to split the string at one or more spaces,
        + means "one or more", so / +/ matches any sequence of one or more spaces
        "add 1 me" => ["add", "1", "me"]
            shift() removes the first element of the args array and returns it; used
         to separate the command name from its arguments
         const args = ["add", "1", "me"];      const commandName = args.shift();
         args is now ["1", "me"]       commandName is now "add"
         */
       const args = message.content.slice(1).split(/ +/);
       const commandName = args.shift().toLowerCase();

       /*
       Find the command either by name or alias, if both OR conditions fail,
       'undefined' will be returned
        */
       const command = client.commands.get(commandName) ||
           /*
                The spread syntax ... takes the map iterator object from .values()
           and expands it into individual command objects, and the square brackets
           creates a new array containing these command objects
                cmd.aliases is not 'null' or 'undefined'
            */
           [...client.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

       if (!command) {
           await message.reply(`The command '${commandName}' is not supported.`);
           return;
       }

       try {
           // Pass in msg for message.reply, args for parsing
            await command.execute(commandName, message, args);
       } catch (error) {
           log(`Error in kommandHandler(): ${error}`);
           handleError(error);
           await message.reply(`There was an error trying to execute command ${commandName}`);
       }
    });
};


/*
const centralizedErrorHandler = (error, message, commandName, args) => {
    log(`Error in command '${commandName}' with args ${JSON.stringify(args)}: ${error}`);
    handleError(error);

    message.reply(`An error occurred while executing the command '${commandName}'. Please try again later.`);
};
 */