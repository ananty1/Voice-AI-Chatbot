import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Set up the Gemini API credentials
def talkWithAI(filename, inputText):
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

    # Load past conversation history (if any)
    try:
        with open(filename, 'r') as f:
            pastChat = json.load(f)
    except FileNotFoundError:
        # If file doesn't exist, start a new chat history
        pastChat = []

    # Append the new user message to the full history
    pastChat.append({"role": "user", "parts": inputText})

    # Take the last 5 messages from the history for context
    recentChat = pastChat[-5:]+ pastChat[:1]

    # Initialize the Gemini model
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Start chat with only the last 5 messages as history
    chat = model.start_chat(history=recentChat)

    # Add a request to keep the response short
    prompt = f"{inputText}\n\nPlease keep your response brief, concise, and to the point."

    
    # Send the user input as a message to the chat
    response = chat.send_message(inputText+prompt)

    # Append the AI's response to the full history
    pastChat.append({"role": "model", "parts": response.text})

    # Save the updated full conversation history back to the file
    with open(filename, "w") as f:
        json.dump(pastChat, f, indent=4)

    # Print the AI's response to the console
    return response.text

# Example usage:
# talkWithAI('chat_history.json', 'How is the day?')
