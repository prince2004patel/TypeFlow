"""
TypeFlow - Modern Typing Trainer
A clean, distraction-free typing practice application
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_llm():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    
    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.7
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    word_count = data.get('wordCount', '15-20')
    difficulty = data.get('difficulty', 'easy')
    
    word_ranges = {
        '15-20': (15, 20),
        '20-25': (20, 25),
        '25-30': (25, 30)
    }
    
    min_words, max_words = word_ranges[word_count]
    
    difficulty_prompts = {
        'easy': 'Use simple, clear vocabulary suitable for everyday conversation and basic writing tasks.',
        'medium': 'Use moderate academic vocabulary with varied sentence structures suitable for general practice.',
        'hard': 'Use advanced academic vocabulary with complex sentence structures for expert-level practice.'
    }
    
    prompt = PromptTemplate(
        input_variables=["min_words", "max_words", "difficulty_instruction"],
        template="""Generate one well-written, natural sentence for typing practice.

Requirements:
- Exactly between {min_words} and {max_words} words
- {difficulty_instruction}
- Grammatically perfect and meaningful
- Use proper punctuation
- No quotes, special formatting, or line breaks
- Return only the sentence

Sentence:"""
    )
    
    try:
        llm = get_llm()
        chain = prompt | llm
        response = chain.invoke({
            "min_words": min_words,
            "max_words": max_words,
            "difficulty_instruction": difficulty_prompts[difficulty]
        })
        sentence = response.content.strip().strip('"').strip("'")
        return jsonify({'sentence': sentence})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)