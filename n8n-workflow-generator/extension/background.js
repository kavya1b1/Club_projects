// Background service worker for n8n AI Workflow Generator
class WorkflowGenerator {
    constructor() {
      this.apiKey = ' Your Gemini API key'
      this.setupMessageListener();
    }
  
    setupMessageListener() {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'GENERATE_WORKFLOW') {
          this.generateWorkflow(message.prompt)
            .then(workflow => {
              sendResponse({ success: true, workflow });
            })
            .catch(error => {
              console.error('Workflow generation error:', error);
              sendResponse({ error: error.message });
            });
          return true; // Keep message channel open for async response
        }
      });
    }
  
    async generateWorkflow(prompt) {
      console.log('Generating workflow for prompt:', prompt);
      
      const systemPrompt = `You are an expert n8n workflow generator. Create a complete n8n workflow JSON from user descriptions.
  
  CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text.
  
  Required JSON structure:
  {
    "name": "Generated Workflow",
    "nodes": [
      {
        "parameters": {},
        "name": "Node Name",
        "type": "n8n-nodes-base.nodeType",
        "typeVersion": 1,
        "position": [x, y],
        "id": "unique-id"
      }
    ],
    "connections": {},
    "active": false,
    "settings": {},
    "staticData": {}
  }
  
  Common n8n node types:
  - n8n-nodes-base.webhook (HTTP triggers)
  - n8n-nodes-base.httpRequest (API calls)
  - n8n-nodes-base.code (JavaScript execution)
  - n8n-nodes-base.gmail (Gmail operations)
  - n8n-nodes-base.slack (Slack messaging)
  - n8n-nodes-base.set (data transformation)
  - n8n-nodes-base.if (conditional logic)
  - n8n-nodes-base.scheduleTime (time-based triggers)
  - n8n-nodes-base.merge (combine data)
  
  Node positioning rules:
  - Start at position [240, 300]
  - Space nodes 300px apart horizontally: [240, 300], [540, 300], [840, 300]
  - Use unique IDs like "webhook1", "slack1", "code1"
  
  Example workflow structure:
  {
    "name": "Email to Slack Notification",
    "nodes": [
      {
        "parameters": {
          "httpMethod": "POST",
          "path": "webhook-test",
          "responseMode": "onReceived"
        },
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [240, 300],
        "id": "webhook1"
      },
      {
        "parameters": {
          "channel": "#general",
          "text": "New email received: {{$json.subject}}"
        },
        "name": "Slack",
        "type": "n8n-nodes-base.slack",
        "typeVersion": 1,
        "position": [540, 300],
        "id": "slack1"
      }
    ],
    "connections": {
      "Webhook": {
        "main": [[{"node": "Slack", "type": "main", "index": 0}]]
      }
    },
    "active": false,
    "settings": {},
    "staticData": {}
  }
  
  Now create a workflow for: "${prompt}"`;
  
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: systemPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
              }
            })
          }
        );
  
        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log('Gemini response:', data);
  
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }
  
        const generatedText = data.candidates[0].content.parts[0].text;
        console.log('Generated text:', generatedText);
        
        // Extract JSON from the response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in AI response');
        }
  
        const workflowJson = JSON.parse(jsonMatch[0]);
        
        // Validate and enhance the workflow
        return this.validateAndEnhanceWorkflow(workflowJson);
  
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
      }
    }
  
    validateAndEnhanceWorkflow(workflow) {
      // Ensure required fields exist
      if (!workflow.name) workflow.name = 'Generated Workflow';
      if (!workflow.nodes) workflow.nodes = [];
      if (!workflow.connections) workflow.connections = {};
      if (!workflow.settings) workflow.settings = {};
      if (!workflow.staticData) workflow.staticData = {};
      workflow.active = false;
  
      // Add unique IDs and validate positions
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          node.id = `node_${Date.now()}_${index}`;
        }
        if (!node.typeVersion) {
          node.typeVersion = 1;
        }
        if (!node.position || !Array.isArray(node.position)) {
          node.position = [240 + (index * 300), 300];
        }
        if (!node.parameters) {
          node.parameters = {};
        }
      });
  
      console.log('Final workflow:', workflow);
      return workflow;
    }
  }
  
  // Initialize the workflow generator
  console.log('Initializing n8n Workflow Generator...');
  new WorkflowGenerator();