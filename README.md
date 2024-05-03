
# Discord Closed Captions - Server

A simple bot that transcribes speech in a Discord voice chat using [DeepSpeech](https://github.com/mozilla/DeepSpeech) and shares it with [DCC-Client](https://github.com/ilyatsykunov/discordcc-client) users using a WebSocket connection.

![DiscordCC-Screenshot](https://user-images.githubusercontent.com/37341595/118252568-d0749380-b4a0-11eb-8efa-e37de031c247.jpg)

## Setup

First of all, a [Discord bot](https://discord.com/developers/applications) will need to be registered. To get the bot to work, you will need an acoustic model for Deep Speech ([download pre-made model](https://github.com/mozilla/DeepSpeech/releases/tag/v0.9.3)) and a WebSocket server setup for real-time communication.

### Configuring the WebSocket Server

You will need to set up a WebSocket server that the Discord bot can connect to for sending the transcribed text in real-time. This server will communicate with the DCC-Client to display the transcriptions.

1. Set up a WebSocket server. You can use libraries like `ws` for Node.js to create one.
2. Note down the WebSocket server URL. You will need to configure this in the Discord bot.

### Configuring the Discord Bot

In `index.js`, add your WebSocket server URL in the following field:

```javascript
const webSocketServerUrl = "ADD YOUR WEBSOCKET SERVER URL";
```

Add your Discord bot token in the following field at the end of `index.js`:

```javascript
client.login("ADD DISCORD BOT TOKEN");
```

Add your Discord server ID and the voice channel ID token in the following fields in `config.json`:

```javascript
"serverID": "ADD DISCORD SERVER ID",
"voiceChannelID": "ADD YOUR VOICE CHANNEL ID"
```

Finally, add the path to your model and scorer in the following fields in `speechToText.js`:

```javascript
const modelPath = 'ADD YOUR DEEPSPEECH MODEL PATH';
const scorerPath = 'ADD YOUR DEEPSPEECH SCORER PATH';
```

### Configuring the DCC-Client

To see the transcriptions on the screen, the DCC-Client will need to be set up to connect to your WebSocket server.

Update the DCC-Client configuration to use your WebSocket server URL.
Ensure the DCC-Client is running and can establish a connection to the WebSocket server for real-time transcription display.
