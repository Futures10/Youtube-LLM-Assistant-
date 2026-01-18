document.addEventListener('DOMContentLoaded', function() {
  const questionInput = document.getElementById('questionInput');
  const askButton = document.getElementById('askButton');
  const answerDiv = document.getElementById('answer');
  const transcriptDiv = document.getElementById('transcript');

  // Function to get transcript
  function getTranscript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getVideoContext'}, function(response) {
        if (response.error) {
          transcriptDiv.textContent = 'Error: ' + response.error;
        } else {
          transcriptDiv.textContent = response.context || 'No transcript available';
        }
      });
    });
  }

  // Function to ask question
  function askQuestion() {
    const question = questionInput.value.trim();
    if (!question) return;

    answerDiv.textContent = 'Thinking...';
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'askQuestion',
        question: question
      }, function(response) {
        if (response.error) {
          answerDiv.textContent = 'Error: ' + response.error;
        } else {
          answerDiv.textContent = response.answer || 'No answer available';
        }
      });
    });
  }

  // Event listeners
  askButton.addEventListener('click', askQuestion);
  questionInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      askQuestion();
    }
  });

  // Get transcript when popup opens
  getTranscript();
}); 