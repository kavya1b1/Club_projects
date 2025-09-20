Multi-Model Chatbot (OpenRouter Free Models and Preview)
A modern, visually appealing, React-based chatbot web app that integrates multiple large language models (LLMs) using the OpenRouter API.
Users can select and switch between various free and preview models seamlessly.

Features
Clean and friendly chatbot UI with animated background bubbles

Support for multiple AI models from OpenRouter, including OpenAI GPT-4o, Google Gemini, NVIDIA Nemotron Nano, and others

Conversation view with user and bot avatars, timestamps, and typing indicators

Model selector with color-coded badges for easy identification

Environment variable-based API key management for security

Rate-limit and error handling with user feedback

Lightweight and easy to customize React frontend, no Tailwind CSS

Getting Started
Prerequisites
Node.js and npm installed on your machine

An OpenRouter API key (freely available from https://openrouter.ai/ after sign-up)

Setup
Clone the repository or initialize your React project

Create a .env file in your project root and add:

text
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
Install dependencies:

bash
npm install
Start the development server:

bash
npm start
Open http://localhost:3000 in your browser

Usage
Select your preferred AI model from the dropdown

Type your message and send

Chat responses will appear from the selected model

Switch models anytime to compare responses or avoid rate limits

Project Structure
text
/src
  /App.js            # Main React component with chatbot logic
  /App.css           # Custom CSS styles including animated background
  /index.js          # React app entry point
/.env                # Environment variables (API key; not committed)
/.gitignore          # Ignores node_modules, .env, etc.
package.json         # Project dependencies and scripts
