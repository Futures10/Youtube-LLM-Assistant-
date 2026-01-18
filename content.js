// Add the "Ask for Help" button overlay
function addHelpButton() {
  const button = document.createElement('button');
  button.id = 'youtube-assistant-button';
  button.textContent = 'Ask for Help';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background-color: #ff0000;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;
  
  button.addEventListener('click', () => {
    try {
      // Check if the extension is still available
      if (!chrome.runtime?.id) {
        console.error('Extension context is invalid. Please refresh the page.');
        return;
      }

      // Open the extension popup
      chrome.runtime.sendMessage({ action: 'openPopup' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error opening popup:', chrome.runtime.lastError);
          // Show error to user
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px;
            background-color: #ff4444;
            color: white;
            border-radius: 4px;
            z-index: 99999;
          `;
          errorDiv.textContent = 'Error: Please refresh the page and try again.';
          document.body.appendChild(errorDiv);
          setTimeout(() => errorDiv.remove(), 3000);
        }
      });
    } catch (error) {
      console.error('Error handling button click:', error);
    }
  });

  document.body.appendChild(button);
}

// Function to get video ID from URL
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    console.log('Extracted video ID:', videoId);
    return videoId;
}

// Function to fetch transcript
async function fetchTranscript(videoId) {
    if (!videoId) {
        console.error('No video ID found in URL');
        return null;
    }

    try {
        console.log('Fetching transcript for video ID:', videoId);
        const response = await fetch(`http://localhost:8000/transcript/${videoId}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch transcript:', response.status, errorText);
            throw new Error(`Failed to fetch transcript: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received transcript data:', data);
        return data.transcript;
    } catch (error) {
        console.error('Error fetching transcript:', error);
        return null;
    }
}

// Function to ask question
async function askQuestion(videoId, question) {
    if (!videoId) {
        console.error('No video ID found in URL');
        return null;
    }

    try {
        console.log('Asking question for video ID:', videoId);
        console.log('Question:', question);
        
        const response = await fetch(`http://localhost:8000/ask-question/${videoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to get answer:', response.status, errorText);
            throw new Error(`Failed to get answer: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Received answer:', data);
        return data.answer;
    } catch (error) {
        console.error('Error asking question:', error);
        return null;
    }
}

// Function to format transcript for display
function formatTranscript(transcript) {
    if (!transcript) {
        console.log('No transcript data to format');
        return 'No transcript available';
    }
    
    console.log('Formatting transcript with', transcript.length, 'segments');
    let formattedText = '';
    transcript.forEach(segment => {
        const minutes = Math.floor(segment.start / 60);
        const seconds = Math.floor(segment.start % 60);
        const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        formattedText += `${timestamp} - ${segment.text}\n`;
    });
    return formattedText;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    
    if (request.action === 'getVideoContext') {
        const videoId = getVideoId();
        console.log('Processing getVideoContext for video ID:', videoId);
        
        fetchTranscript(videoId)
            .then(transcript => {
                const formattedTranscript = formatTranscript(transcript);
                console.log('Sending formatted transcript');
                sendResponse({ context: formattedTranscript });
            })
            .catch(error => {
                console.error('Error in getVideoContext:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
    
    if (request.action === 'askQuestion') {
        const videoId = getVideoId();
        console.log('Processing askQuestion for video ID:', videoId);
        
        askQuestion(videoId, request.question)
            .then(answer => {
                console.log('Sending answer');
                sendResponse({ answer });
            })
            .catch(error => {
                console.error('Error in askQuestion:', error);
                sendResponse({ error: error.message });
            });
        return true;
    }
});

// Add the help button when the page loads
if (window.location.hostname === 'www.youtube.com' && window.location.pathname === '/watch') {
    console.log('YouTube watch page detected, adding help button');
    addHelpButton();
} 