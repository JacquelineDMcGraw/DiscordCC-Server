const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const wav = require('wav');
const deepSpeech = require('deepspeech');
const WebSocket = require('ws'); // WebSocket is correctly imported
const config = require('./config.json');

const modelPath = 'ADD YOUR DEEPSPEECH MODEL PATH';
const scorerPath = 'ADD YOUR DEEPSPEECH SCORER PATH';
const model = new deepSpeech.Model(modelPath);
exports.model = model;
model.enableExternalScorer(scorerPath);

const bufferSize = 512;
const ws = new WebSocket('ws://your-websocket-server.com'); // Ensure this URL is correct

async function speechToText(nickname, mp3path) {
    const path = mp3path.replace('.mp3', '.wav');
    ffmpeg(mp3path)
        .format('wav')
        .save(path)
        .on('error', (err) => {
            fs.unlinkSync(mp3path); // Ensure cleanup of mp3 regardless of success or failure
            console.log('Error converting MP3 to WAV:', err);
        })
        .on('end', () => {
            fs.unlinkSync(mp3path); // Cleanup original MP3 file after conversion
            transcribe(path, nickname);
        });
}
exports.speechToText = speechToText;

async function transcribe(path, nickname) {
    let modelStream = model.createStream();
    const fileStream = fs.createReadStream(path, { highWaterMark: bufferSize });
    const reader = new wav.Reader();
    
    reader.on('error', (err) => {
        console.log('Error reading WAV file:', err);
    });

    reader.on('format', (format) => {
        if (format.sampleRate !== model.sampleRate()) {
            console.error(`Invalid sample rate: ${format.sampleRate}, expected: ${model.sampleRate()}`);
            return;
        }
        reader.on('data', (data) => {
            modelStream.feedAudioContent(data);
        });
        reader.on('end', () => {
            const transcription = modelStream.finishStream();
            fs.unlinkSync(path); // Cleanup WAV file after processing
            sendTranscription(nickname, transcription);
        });
    });
    fileStream.pipe(reader);
}

function sendTranscription(nickname, transcription) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ nickname, message: `${config.prefix}voice 0` })); // Turn off voice indicator
        ws.send(JSON.stringify({ nickname, message: transcription })); // Send the transcription
    } else {
        console.error("WebSocket is not open.");
    }
}
