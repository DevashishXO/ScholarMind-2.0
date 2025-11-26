import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

def call_groq_llm(messages, model="llama-3.3-70b-versatile", max_tokens=1024, temperature=0.2, json_mode=False):
    kwargs = {
        "messages": messages,
        "model": model,
        "max_completion_tokens": max_tokens,
        "temperature": temperature
    }
    
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    
    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content