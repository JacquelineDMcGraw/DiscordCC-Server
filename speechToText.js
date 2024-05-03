//speechToText.js
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const WebSocket = require('ws');
const config = require('./config.json');

// Assuming you have installed the necessary packages for Whisper and Hugging Face
const { transcribeWithWhisper } = require('./whisperIntegration');
const { transcribeWithHuggingFace } = require('./huggingFaceIntegration');

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
    try {
        // Try Whisper first
        let transcription = await transcribeWithWhisper(path);
        if (!transcription) {
            // If Whisper fails or returns no content, fallback to Hugging Face
            transcription = await transcribeWithHuggingFace(path);
        }
        fs.unlinkSync(path); // Cleanup WAV file after processing
        sendTranscription(nickname, transcription);
    } catch (error) {
        console.error("Error during transcription process:", error);
        fs.unlinkSync(path); // Ensure cleanup of WAV file in case of error
    }
}

function sendTranscription(nickname, transcription) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ nickname, message: `${config.prefix}voice 0` })); // Turn off voice indicator
        ws.send(JSON.stringify({ nickname, message: transcription })); // Send the transcription
    } else {
        console.error("WebSocket is not open.");
    }
}