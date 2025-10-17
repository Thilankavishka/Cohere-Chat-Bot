# backend.py
import cohere
from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

def chat_with_cohere(prompt):
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise ValueError("COHERE_API_KEY not found in environment variables")
    
    co = cohere.ClientV2(api_key)
    response = co.chat(
        model="command-a-03-2025",
        messages=[{"role": "user", "content": prompt}]
    )

    # Extract assistant text based on official structure: response.message.content[0].text
    text = None
    if hasattr(response, "message") and response.message is not None:
        content = getattr(response.message, "content", None)
        if isinstance(content, (list, tuple)) and len(content) > 0:
            item = content[0]
            if hasattr(item, "text"):
                text = item.text
            elif isinstance(item, dict) and "text" in item:
                text = item["text"]

    if not text:
        # Improved fallback: Check for errors or return a default message
        if hasattr(response, "finish_reason") and response.finish_reason == "error":
            raise ValueError(f"API Error: {getattr(response, 'message', 'Unknown error')}")
        text = "Sorry, I couldn't generate a response at this time."

    return text

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({'error': 'Missing prompt in request'}), 400
        
        prompt = data['prompt'].strip()
        if not prompt:
            return jsonify({'error': 'Prompt cannot be empty'}), 400
            
        reply = chat_with_cohere(prompt)
        return jsonify({'reply': reply})
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cohere Chatbot</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/static/index.js"></script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)