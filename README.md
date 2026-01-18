# YouTube Video Assistant Chrome Extension

A Chrome extension that enhances YouTube video viewing by providing AI-powered assistance through natural language questions. The extension uses the Gemini API to analyze video transcripts and provide intelligent responses to user queries.

## 🚀 Features

- **Smart Video Assistance**
  - Ask questions about video content in natural language
  - Get AI-powered responses based on video transcripts
  - Real-time question answering while watching videos

- **User Interface**
  - Clean and intuitive "Ask for Help" button overlay
  - Seamless integration with YouTube interface
  - Responsive design that works on all video sizes

- **Technical Capabilities**
  - Automatic transcript extraction
  - Advanced error handling
  - Secure API communication
  - Cross-origin resource sharing (CORS) support

## 🛠️ Installation

### Prerequisites
- Google Chrome browser
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd youtube-assistant
   ```

2. Configure the backend:
   - Create a `.env` file in the `backend` directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your-api-key-here
     ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right corner)
   - Click "Load unpacked"
   - Select the extension directory

## 💡 Usage

1. Navigate to any YouTube video
2. Look for the "Ask for Help" button in the bottom right corner
3. Click the button to open the question interface
4. Type your question about the video content
5. Click "Ask Question" to receive an AI-powered response

## ⚠️ Limitations

- Requires video transcripts to be available
- Works only on YouTube video pages
- Requires an active internet connection
- Depends on Gemini API availability

## 🔍 Troubleshooting

### Common Issues

1. **Extension not working**
   - Ensure the backend server is running
   - Check if the video has available transcripts
   - Verify your Gemini API key is valid

2. **No response to questions**
   - Check browser console for error messages
   - Verify backend server status
   - Ensure proper API key configuration

3. **Button not appearing**
   - Refresh the YouTube page
   - Check if you're on a valid video page
   - Verify extension is properly installed

### Debugging
- Open Chrome DevTools (F12)
- Check the Console tab for error messages
- Monitor Network tab for API requests
- Verify backend server logs

## 📝 Development

### Project Structure
```
youtube-assistant/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── content.js
└── README.md
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please:
1. Check the troubleshooting section
2. Open an issue in the repository
3. Contact the maintainers

---

Made with ❤️ by [Your Name] 