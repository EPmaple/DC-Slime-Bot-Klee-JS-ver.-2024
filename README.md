# DC Slime Bot Klee JS ver. 2024
## Rewritten By
- Tony Cen Cen | tcen@bu.edu
## Rewritten From
https://github.com/EPmaple/DC-slime-bot-Klee-

## Pre-requisites
- Create your discord bot
- Create your own mongoDB cluster on MongoDB Atlas
- Create your own config.json from the template below, and place it at the same level as index.js in the directory

## config.json template
- Replace every curly brace with the corresponding string representation
- mongoURL refers to the connection string of your mongoDB cluster on MongoDB Atlas
```
{
  "token": {discord bot token}
	"clientId": {discord bot client id},
	"guildId": {guild/server to listen to},
	"CID_BOTTESTING_CHANNEL": {channel to listen to},
	"mongoURL": {mongoURL},
	"dbName": {database name},
	"peopleCollectionName": "people",
	"slimeRecordsCollectionName": "slimeRecords"
}
```

## Notes
- Prior to starting the bot, you must go on to MongoDB Atlas to make sure your MongoDB cluster is online
- To start, run the file index.js


