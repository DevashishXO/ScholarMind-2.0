import os
from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

def call_groq_llm(messages, model="llama-3.3-70b-versatile", max_tokens=1024, temperature=0.2):
    response = client.chat.completions.create(
        messages=messages,
        model=model,
        max_completion_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content