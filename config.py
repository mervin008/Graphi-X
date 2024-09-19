from dotenv import load_dotenv
import os
load_dotenv()

SERVER_URL = os.getenv("SERVER_URL")
PORT = os.getenv("PORT")
ENV = os.getenv("ENV")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")