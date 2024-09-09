# Destiny Child Slime Bot -Klee- JS ver. 2024
## Rewritten By
- Tony Cen Cen | tcen17@bu.edu
## Rewritten From
https://github.com/EPmaple/DC-slime-bot-Klee-

---

# Project Setup

### 1. Create `config.json`

- Create a `config.json` file using the template provided below. Replace the placeholders (e.g., `{discord bot token}`) with the appropriate values. Place the `config.json` file at the same level as `index.js` in your project directory.

### 2. Obtain Discord Bot Credentials

#### Create Your Discord Bot:
1. Navigate to the [Discord Developer Platform](https://discord.com/developers/docs/intro).
2. Log in using your Discord account.
3. Click on **"Applications"** in the left sidebar.
4. Select the bot application you want to retrieve the credentials from, or create a new application if necessary.

#### Retrieve `clientId` (Client ID):
1. Go to the **"General Information"** tab.
2. Find the **Client ID** under the "APPLICATION ID" section.
3. Replace `{discord bot client id}` in the template below with your Client ID, surrounded by quotes.

#### Retrieve `token` (Bot Token):
1. Navigate to the **"Bot"** tab in the left sidebar.
2. Under the "Build-A-Bot" section, click the **"Copy"** button next to **TOKEN** to copy your bot's token.
3. If you do not retain the previous token, click **"Reset Token"** to generate a new one.
4. Replace `{discord bot token}` in the template below with your Bot Token, surrounded by quotes.

### 3. Set Up Discord Server and Channel IDs

#### Retrieve `guildId` (Server ID):
1. In Discord, right-click on the server you want the bot to listen to.
2. Click **"Copy Server ID"** and replace `{guild/server to listen to}` in the template below with this Server ID, surrounded by quotes.

#### Retrieve `CID_BOTTESTING_CHANNEL` (Channel ID):
1. In the same Discord server, right-click on the channel you want the bot to listen to.
2. Click **"Copy Channel ID"** and replace `{channel to listen to}` in the template below with this Channel ID, surrounded by quotes.

### 4. Configure MongoDB Atlas

#### Create a MongoDB Cluster:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and log in, or create an account if you don't have one.
2. If you don’t have a project, you'll be prompted to create one. Click **"Create Project,"** name it, and click **"Next."**
3. Create a cluster by clicking **"Build a Cluster"** or **"Create a Cluster."**
4. Stick with the default settings and select the **"M0 Sandbox"** free tier option.
5. Click **"Create Cluster"** to start the creation process (this may take a few minutes).

#### Set Up Cluster Access:

1. **Add a Database User:**
    - Go to **"Database Access"** in the left-hand sidebar.
    - Click **"Add New Database User."**
    - Create a username and password, then set the user permissions to **"Read and write to any database"** for simplicity (you can modify this later if needed).
    - Click **"Add User."**

2. **Allow IP Access:**
    - Go to **"Network Access"** in the left-hand sidebar.
    - Click **"Add IP Address"** and enter your corresponding IP address.
    - Click **"Confirm."**

3. **Get the `mongoURL`:**
    - Once your cluster is ready, go back to the cluster overview page.
    - Click the **"Connect"** button.
    - Choose **"Connect your application."**
    - Select the Node.js driver and the latest version.
    - Follow the instructions to install the corresponding MongoDB driver on your system.
    - During installation, go back to the **"Connect to Cluster"** window on MongoDB Atlas, copy the connection string, and replace `<db_password>` with your MongoDB password.
    - Replace `{mongoURL}` in the template below with the completed MongoDB connection string, surrounded by quotes.

### 5. Specify `dbName`

- Replace `{database name}` in the template below with the name of the database you want to connect to in your cluster, surrounded by quotes.

---

## Example `config.json` Template
- Following instructions from the Pre-requisites section, replace every curly brace with the corresponding string representation
```json
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
