import cohere

from dotenv import load_dotenv  
import os

load_dotenv()


def chat_with_cohere(prompt, api_key):

    co = cohere.ClientV2(api_key)
    response = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}]
    )

    # ...existing code...
    # extract assistant text (handles common v2 shapes)
    text = None
    if hasattr(response, "message") and response.message is not None:
        content = getattr(response.message, "content", None)
        if isinstance(content, (list, tuple)) and content:
            item = content[0]
            text = getattr(item, "text", None) or (item.get("text") if isinstance(item, dict) else None)

    # fallback for alternative shapes
    if not text and hasattr(response, "output") and response.output:
        first = response.output[0]
        content = getattr(first, "content", None) or (first.get("content") if isinstance(first, dict) else None)
        if isinstance(content, (list, tuple)) and content:
            item = content[0]
            text = getattr(item, "text", None) or (item.get("text") if isinstance(item, dict) else None)

    if text:
        return text
    else:
        return response # fallback to full object if extraction failed        

while True:
    response=input("Enter your question:")
    if response.lower() == "exit":
        break   

    reply = chat_with_cohere(response,api_key=os.getenv("api_key"))
    
    print("Cohere:", reply)   



