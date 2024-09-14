const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your actual API key and external user ID
const apiKey = process.env.API_KEY;
const externalUserId = process.env.EXTERNAL_USER_ID;

// Function to create a chat session
async function createChatSession() {
  const url = 'https://api.on-demand.io/chat/v1/sessions';
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
  };
  const body = JSON.stringify({
    pluginIds: [],
    externalUserId: externalUserId
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  const data = await response.json();
  console.log("Response from creating a chat:", data);

  // Check if the request was unauthorized
  if (data.message === 'Unauthorized') {
    throw new Error('Unauthorized: Invalid API key or permissions');
  }

  // Check if the data object and ID are present
  if (data.data && data.data.id) {
    console.log("Session ID:", data.data.id);
    return data.data.id; // Extract session ID
  } else {
    throw new Error('Failed to create chat session: ' + data.message);
  }
}

// Function to submit a query
async function submitQuery(sessionId, query) {
  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: query, // The query from the frontend
        pluginIds: ['plugin-1715808194', 'plugin-1717420060'],
        responseMode: 'sync'
      },
      {
        headers: {
          apikey: apiKey
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting query:', error);
    throw error;
  }
}

// Endpoint to handle chatbot interaction
router.post('/chatbot', async (req, res) => {
  try {
    const sessionId = await createChatSession();
    const query = req.body.query; // The query from the frontend
    const queryResponse = await submitQuery(sessionId, query);
    return res.json(queryResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Error interacting with chatbot', error });
  }
});

module.exports = router;
