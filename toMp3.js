const fs = require('fs');
const lame = require('lame');
const WebSocket = require('ws'); // Assuming WebSocket is installed and available

// Assuming you have a WebSocket server URL
const wsURL = 'ws://your-websocket-server.com';
const ws = new WebSocket(wsURL);

// Pipe the live voice input into an mp3 file
async function toMp3(nickname, audioStream) {

    const dir = './tmp';
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    nickname.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const mp3path = `${dir}/${nickname}_${Date.now()}.mp3`;

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

    audioStream.pipe(encoder);
    const mp3Stream = encoder.pipe(fs.createWriteStream(mp3path));

    mp3Stream.on('finish', () => {
        // Assuming you want to send the MP3 file path or contents to the WebSocket server
        if (ws.readyState === WebSocket.OPEN) {
            // Modify this part based on whether you want to send the path or the file content
            ws.send(JSON.stringify({nickname: nickname, mp3path: mp3path}));
        } else {
            console.error('WebSocket is not open.');
        }
    });

    return mp3path;
}

exports.toMp3 = toMp3;