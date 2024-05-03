//toMp3.js
const fs = require('fs');
const lame = require('lame');
const WebSocket = require('ws'); // Assuming WebSocket is installed and available

// Assuming you have a WebSocket server URL
const wsURL = 'ws://your-websocket-server.com';
const ws = new WebSocket(wsURL);

// Pipe the live voice input into an mp3 file
async function toMp3(nickname, audioStream) {

    const dir = './tmp';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Normalize the nickname to be filesystem-friendly
    nickname = nickname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const mp3path = `${dir}/${nickname}_${Date.now()}.mp3`;

    // Configure the MP3 encoder
    var encoder = new lame.Encoder({
        // input
        channels: 2,
        bitDepth: 16,
        sampleRate: 48000,

        // output
        bitRate: 128,
        outSampleRate: 16000,
        mode: lame.MONO
    });

    // Pipe the audio stream through the encoder
    audioStream.pipe(encoder);
    const mp3Stream = encoder.pipe(fs.createWriteStream(mp3path));

    // Handle the finish and error events of the MP3 stream
    mp3Stream.on('finish', () => {
        // Send the MP3 file path to the WebSocket server if the connection is open
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({nickname: nickname, mp3path: mp3path}));
        } else {
            console.error('WebSocket is not open. Could not send the file path.');
        }
    }).on('error', error => {
        console.error('Error during MP3 streaming:', error);
        // Attempt to clean up the partially written file
        fs.unlink(mp3path, () => {
            console.log('Cleaned up incomplete MP3 file:', mp3path);
        });
    });

    return mp3path;
}

exports.toMp3 = toMp3;
