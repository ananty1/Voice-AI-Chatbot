from typing import Union

from fastapi import FastAPI,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from  fastapi.responses import StreamingResponse


from functions.TextToSpeech import TextToSpeech
from functions.SpeechToText import SpeechToText
from functions.chatBotResponse import talkWithAI
app = FastAPI()

origins = [
    'http://localhost:3000',
    'https://voice-ai-chatbot-zmq6.vercel.app/'
    'https://voice-ai-chatbot-zmq6.vercel.app'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
    
    return {"item_id": item_id, "q": q}

@app.post("/post-audio/")
async def post_audio(file: UploadFile):
    
    audio_file_path = f"./functions/{file.filename}"
    with open(audio_file_path, "wb") as buffer:
        buffer.write(await file.read())  # Async file handling
    
    # Read the saved audio file for processing
    with open(audio_file_path, "rb") as audio_input:
        result = SpeechToText(audio_input)
    
    filename = "chat_memory.json"  # Path to store the conversation history
    textResult = talkWithAI(filename, result)

    # Generate TTS (Text-to-Speech) from the result
    tts_filename = f"{file.filename}.wav"
    TextToSpeech(textResult, file.filename)

    # Return the generated TTS audio as a response
    tts_file_path = f"./functions/{tts_filename}"
    
    return StreamingResponse(open(tts_file_path, "rb"), media_type="audio/wav")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app)



