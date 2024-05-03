//sendMsg.js

const WebSocket = require('ws'); // Ensure WebSocket is required if used directly
const { ws } = require("./websocket-connection"); // Adjust the path as necessary

/**
 * Sends a message over a WebSocket connection.
 * @param {string} name - The name of the sender.
 * @param {string} transcription - The transcribed message to send.
 * @param {string} metadata - Optional metadata associated with the message.
 */
function sendMsg(name, transcription, metadata = '') {
    if (name.length < 1 || transcription.length < 1) {
        console.error("Name or transcription cannot be empty.");
        return false; // Indicate failure
    }

    // Format the message
    const messageDate = new Date();
    const newMsg = JSON.stringify({
        name: name,
        date: messageDate.toLocaleDateString(),
        time: messageDate.toLocaleTimeString(),
        transcription: transcription,
        metadata: metadata,
        channel: 'main' // Consider using a variable or constant for channel names
    });

    // Check if the WebSocket connection is open before sending
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(newMsg);
        return true; // Indicate success
    } else {
        console.error("WebSocket is not open.");
        return false; // Indicate failure
    }
}

exports.sendMsg = sendMsg;
