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
            console.error('Error converting MP3 to WAV:', err);
            fs.unlink(mp3path, () => { // Asynchronously clean up the MP3 file
                console.log('Deleted MP3 file due to error:', mp3path);
            });
        })
        .on('end', () => {
            transcribe(path, nickname).catch(err => {
                console.error('Transcription failed:', err);
                fs.unlink(path, () => { // Asynchronously clean up the WAV file
                    console.log('Deleted WAV file due to transcription failure:', path);
                });
            });
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
        fs.unlink(path, () => { // Asynchronously clean up the WAV file
            console.log('Deleted WAV file due to error:', path);
        });
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
