// Configuration
const GEMINI_API_KEY = 'AIzaSyCjYOZLpOIFbOWIoH2fMM7Y3WqzXbEqpd4'; // You'll need to add your API key here
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Cache for storing processed transcripts
const transcriptCache = new Map();

// Process the question using Gemini API
async function processQuestion(question, context) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('API key not configured');
    }

    const prompt = `Given the following YouTube video transcript, please answer the question. 
    If the answer cannot be found in the transcript, say so clearly.
    
    Transcript:
    ${context}
    
    Question: ${question}
    
    Answer:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
}

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processQuestion') {
    processQuestion(request.question, request.context)
      .then(answer => sendResponse({ answer }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Required for async response
  }
  
  if (request.action === 'openPopup') {
    try {
      // Get the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        if (tabs[0]) {
          // Open the extension popup
          chrome.action.openPopup((windowId) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true });
            }
          });
        } else {
          sendResponse({ error: 'No active tab found' });
        }
      });
    } catch (error) {
      sendResponse({ error: error.message });
    }
    return true; // Required for async response
  }
}); 