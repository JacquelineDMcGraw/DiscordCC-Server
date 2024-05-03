//index.js
const fs = require('fs');
const dotenv = require('dotenv');
const { Client, Intents, Collection } = require('discord.js');
const config = require('./config.json');
const { speechToText } = require("./speechToText");
const { toMp3 } = require("./toMp3");
const WebSocket = require('ws');

dotenv.config();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
exports.client = client;

client.commands = new Collection();

// Load the commands from the /commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// WebSocket connection setup with reconnection logic
const wsUrl = 'ws://localhost:8080';
let ws;

function connectWebSocket() {
    ws = new WebSocket(wsUrl);

    ws.on('open', () => console.log('Connected to WebSocket server'));
    ws.on('message', handleIncomingMessage);
    ws.on('close', () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connectWebSocket, 1000);
    });
    ws.on('error', error => console.error('WebSocket error:', error));
}

function handleIncomingMessage(data) {
    console.log(data);
    try {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'greeting':
                console.log('Greeting received:', message.content);
                break;
            case 'update':
                console.log('Update received:', message.content);
                break;
            default:
                console.log('Unknown message type:', message);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.commands.get('clearCache').execute();
    connectWebSocket();
    joinVoiceChannel();
});

async function joinVoiceChannel() {
    try {
        const channel = await client.channels.fetch(config.voiceChannelID);
        const connection = await channel.join();
        listen(connection);
    } catch (err) {
        console.error('Error joining voice channel:', err);
    }
}

function listen(connection) {
    connection.on('speaking', (user, speaking) => {
        if (speaking.bitfield) {
            const audioStream = connection.receiver.createStream(user, { mode: 'pcm' });
            const path = `./temp/${user.id}-${Date.now()}.pcm`;
            const outputStream = fs.createWriteStream(path);
            audioStream.pipe(outputStream);
            audioStream.on('end', async () => {
                outputStream.close();
                const mp3Path = await toMp3(path);
                speechToText(user.id, mp3Path);
            });
        }
    });
}

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(message, args);
    } catch (error) {
        console.error('Command execution error:', error);
        message.reply('There was an error trying to execute that command!');
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
