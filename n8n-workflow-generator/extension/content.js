// content.js - Injects AI interface into n8n and handles workflow generation

class N8nAIInjector {
    constructor() {
      console.log('n8n AI Injector starting...');
      this.waitForN8nToLoad();
    }
  
    waitForN8nToLoad() {
      const checkForN8n = () => {
        const n8nElements = [
          document.querySelector('[data-test-id="canvas"]'),
          document.querySelector('.node-view'),
          document.querySelector('#app'),
          document.querySelector('.workflow-canvas')
        ];
        const n8nLoaded = n8nElements.some(el => el !== null)
          || window.location.pathname.includes('workflow')
          || document.title.includes('n8n')
          || document.readyState === 'complete';
  
        if (n8nLoaded) {
          console.log('n8n detected, injecting AI interface...');
          setTimeout(() => this.injectAIInterface(), 1000);
        } else {
          setTimeout(checkForN8n, 1000);
        }
      };
      checkForN8n();
    }
  
    injectAIInterface() {
      // Remove existing interface if present
      const existing = document.getElementById('n8n-ai-generator');
      if (existing) existing.remove();
  
      // Create container
      const aiContainer = document.createElement('div');
      aiContainer.id = 'n8n-ai-generator';
      aiContainer.className = 'ai-generator-container';
      aiContainer.innerHTML = `
        <div class="ai-header">
          <span>🤖 AI Workflow Generator</span>
          <button id="ai-toggle" class="ai-toggle">−</button>
        </div>
        <div class="ai-content" id="ai-content">
          <div class="ai-examples">
            <small>💡 Try: "Send Slack message when Gmail email arrives"</small>
          </div>
          <textarea id="ai-prompt" placeholder="Describe your workflow..." rows="4"></textarea>
          <div class="ai-actions">
            <button id="ai-generate" class="ai-generate-btn">
              <span id="generate-text">🚀 Generate Workflow</span>
              <span id="generate-spinner" class="spinner" style="display: none;">⏳ Generating...</span>
            </button>
          </div>
          <div id="ai-status" class="ai-status"></div>
          <div class="ai-instructions" style="display: none;">
            <strong>📋 How to Import:</strong><br>
            1. JSON copied to clipboard ✅<br>
            2. In n8n: Click "+" → "From clipboard"<br>
            3. Paste and import your workflow!
          </div>
        </div>
      `;
      document.body.appendChild(aiContainer);
      this.setupEventListeners();
      console.log('AI interface injected successfully');
    }
  
    setupEventListeners() {
      const generateBtn = document.getElementById('ai-generate');
      const promptTextarea = document.getElementById('ai-prompt');
      const toggleBtn = document.getElementById('ai-toggle');
      const contentDiv = document.getElementById('ai-content');
  
      generateBtn.addEventListener('click', () => this.generateWorkflow());
      promptTextarea.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          this.generateWorkflow();
        }
      });
      toggleBtn.addEventListener('click', () => {
        const isHidden = contentDiv.style.display === 'none';
        contentDiv.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? '−' : '+';
      });
    }
  
    async generateWorkflow() {
      const promptEl = document.getElementById('ai-prompt');
      const generateBtn = document.getElementById('ai-generate');
      const generateText = document.getElementById('generate-text');
      const generateSpinner = document.getElementById('generate-spinner');
      const statusDiv = document.getElementById('ai-status');
      const instructionsDiv = document.querySelector('.ai-instructions');
  
      const prompt = promptEl.value.trim();
      if (!prompt) {
        this.showStatus('❌ Please enter a workflow description', 'error');
        return;
      }
  
      // Show loading state
      generateBtn.disabled = true;
      generateText.style.display = 'none';
      generateSpinner.style.display = 'inline';
      this.showStatus('🤖 Generating workflow with AI...', 'loading');
  
      try {
        // Send message to background script
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'GENERATE_WORKFLOW', prompt }, res => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(res);
            }
          });
        });
  
        if (response.error) throw new Error(response.error);
  
        // Copy JSON to clipboard
        const workflowJson = JSON.stringify(response.workflow, null, 2);
        await navigator.clipboard.writeText(workflowJson);
  
        this.showStatus('✅ Workflow generated! JSON copied to clipboard.', 'success');
        instructionsDiv.style.display = 'block';
        promptEl.value = '';
        console.log('Workflow JSON:', workflowJson);
  
      } catch (err) {
        console.error('Workflow generation failed:', err);
        this.showStatus(`❌ Error: ${err.message}`, 'error');
      } finally {
        generateBtn.disabled = false;
        generateText.style.display = 'inline';
        generateSpinner.style.display = 'none';
      }
    }
  
    attemptN8nImport(workflow) {
      // No auto-import; show instructions only
      const instructionsDiv = document.querySelector('.ai-instructions');
      if (instructionsDiv) instructionsDiv.style.display = 'block';
      console.log('Workflow JSON copied to clipboard. Import manually via "+" → "From clipboard".');
    }
  
    showStatus(msg, type='info') {
      const statusDiv = document.getElementById('ai-status');
      statusDiv.textContent = msg;
      statusDiv.className = `ai-status ${type}`;
      if (type === 'success') {
        setTimeout(() => {
          if (statusDiv.textContent === msg) {
            statusDiv.textContent = '';
            statusDiv.className = 'ai-status';
          }
        }, 8000);
      }
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new N8nAIInjector());
  } else {
    new N8nAIInjector();
  }
  
  // Reinitialize on SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => new N8nAIInjector(), 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  console.log('n8n AI Content Script loaded');
  