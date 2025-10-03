# TypeFlow 🚀

A modern, clean typing trainer inspired by Monkeytype. Practice your typing skills with AI-generated sentences.

## Features

✨ **Clean UI** - Distraction-free, Monkeytype-inspired design
🎯 **AI-Powered** - Dynamic sentence generation using Groq AI
📊 **Real-time Stats** - Track WPM, accuracy, time, and characters
🎨 **Smooth Animation** - Blinking cursor and color-coded feedback
📱 **Responsive** - Works perfectly on desktop

## Installation

1. Clone the repository:

```bash
git clone https://github.com/prince2004patel/TypeFlow.git
cd typeflow
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your Groq API key (optional):

```bash
export GROQ_API_KEY=your_api_key_here
```

4. Run the application:

```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
typeflow/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html     # HTML template
├── static/
│   ├── style.css      # Styles
│   └── script.js      # JavaScript logic
├── .gitignore
├── .env
└── README.md
```

## Configuration

- **Words**: Choose between 15-20, 20-25, or 25-30 word sentences
- **Difficulty**: Easy, Medium, or Hard vocabulary levels
