from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from typing import Optional
import json
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.0-flash')

# Define request model
class QuestionRequest(BaseModel):
    question: str

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your extension's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_transcript(transcript_data):
    formatted_segments = []
    for segment in transcript_data:
        formatted_segment = {
            "text": segment["text"],
            "start": segment["start"],
            "duration": segment["duration"]
        }
        formatted_segments.append(formatted_segment)
    return formatted_segments

@app.get("/transcript/{video_id}")
async def get_transcript(video_id: str, language: Optional[str] = "en"):
    try:
        logger.info(f"Attempting to fetch transcript for video ID: {video_id}")
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
        logger.info(f"Successfully fetched transcript with {len(transcript)} segments")
        formatted_transcript = format_transcript(transcript)
        return {"transcript": formatted_transcript}
    except TranscriptsDisabled:
        logger.error(f"Transcripts are disabled for video: {video_id}")
        raise HTTPException(status_code=404, detail="Transcripts are disabled for this video")
    except NoTranscriptFound:
        logger.error(f"No transcript found for video: {video_id}")
        raise HTTPException(status_code=404, detail="No transcript found for this video")
    except Exception as e:
        logger.error(f"Error fetching transcript for video {video_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question/{video_id}")
async def ask_question(video_id: str, request: QuestionRequest):
    try:
        logger.info(f"Processing question for video ID: {video_id}")
        logger.info(f"Question: {request.question}")
        
        # Get the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Combine transcript into a single text
        full_transcript = " ".join([segment["text"] for segment in transcript])
        
        # Create prompt for Gemini
        prompt = f"""Based on the following video transcript, please answer this question: {request.question}
        
        Transcript:
        {full_transcript}
        
        Please provide a clear and concise answer based on the transcript content."""
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        return {
            "answer": response.text,
            "question": request.question
        }
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Transcripts are disabled for this video")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 