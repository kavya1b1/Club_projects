n8n Workflow Generator Chrome Extension 🤖

Overview ✨

This Chrome extension allows users to automatically generate complete n8n workflows from a single plain text prompt using an AI language model (from OpenRouter) and assists in automating workflow creation for any task.

The generated workflow is returned as JSON and automatically copied to your clipboard for easy import into your n8n instance.

You can build complex automation workflows quickly—no manual drag-and-drop required. 🚀

Features ✔️

Input a plain-text description of the automation you want. 📝

Uses a powerful LLM (OpenRouter DeepSeek R1) to generate fully functional n8n workflows. 🤖

Outputs native n8n workflow JSON copied directly to your clipboard. 📋

Supports Gmail email classification automation as an example use case. 📧

Simple, user-friendly interface as a Chrome extension popup. 🖥️

How it Works ⚙️

. Screenshot 2025-09-20 at 11 20 29 am

.

Screenshot 2025-09-20 at 11 26 53 am
.

Screenshot 2025-09-20 at 11 27 26 am
.

Screenshot 2025-09-20 at 11 29 24 am . User opens the extension and types their workflow description as a text prompt. ✍️
The prompt is sent to OpenRouter’s AI model which returns the n8n workflow JSON. 💬

The JSON is automatically copied to the clipboard. 📋

The user can then paste/import the workflow inside their n8n editor. 📥

The generated n8n workflow is fully-formed and ready to run. ▶️

Example Use Case: Gmail Email Classification Automation 📬 Your emails are automatically classified with AI into categories like Marketing, Notifications, FYI, etc.

Labels are then applied to Gmail messages automatically.

Helps keep your inbox organized with minimal manual setup. 🎯

Installation 🛠️

Download or clone this repository.

Open Chrome and navigate to chrome://extensions/.

Enable Developer Mode.

Click Load unpacked and select the extension directory.

(Optional) Pin the extension to your toolbar for quick access. 📌

Usage 🚀

Click the extension icon.

Enter a clear prompt describing the automation workflow you want. ✍️

Click Generate Workflow.

The workflow JSON is copied to your clipboard. 📋

Open your n8n editor.

Click Import and paste the JSON to create the workflow instantly. 🔄
