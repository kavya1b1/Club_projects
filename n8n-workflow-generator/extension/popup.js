document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup script loaded');
    
    // DOM elements
    const testBtn = document.getElementById('test-connection');
    const apiKeyInput = document.getElementById('api-key');
    const providerSelect = document.getElementById('ai-provider');
    const keyStatus = document.getElementById('key-status');
    const connectionStatus = document.getElementById('connection-status');
    const workflowCount = document.getElementById('workflow-count');
    const successRate = document.getElementById('success-rate');
  
    // API key is already configured in background.js
    const configuredApiKey = 'AIzaSyDfsYq3yITgF0wT2F8gFDIzEQgLVmGYwgA';
    
    // Initialize UI
    initializeUI();
  
    function initializeUI() {
      // Show that API key is configured
      apiKeyInput.placeholder = 'API Key configured ✅';
      connectionStatus.classList.add('connected');
      
      // Load usage statistics
      loadUsageStats();
      
      // Show initial success message
      showStatus('✅ Extension ready! Your Gemini API key is configured.', 'success');
    }
  
    // Test connection button
    testBtn.addEventListener('click', async function() {
      testBtn.disabled = true;
      testBtn.textContent = '🔄 Testing...';
      
      try {
        // Test the connection by making a simple API call
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${configuredApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: 'Hello, this is a connection test. Please respond with "Connection successful".'
                }]
              }]
            })
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          console.log('API test response:', data);
          
          showStatus('✅ Connection successful! API is working perfectly.', 'success');
          connectionStatus.classList.add('connected');
          
          // Update usage stats
          incrementUsageStats();
          
        } else {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('Connection test failed:', error);
        showStatus(`❌ Connection failed: ${error.message}`, 'error');
        connectionStatus.classList.remove('connected');
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = '🔍 Test Connection';
      }
    });
  
    function showStatus(message, type) {
      keyStatus.textContent = message;
      keyStatus.className = `status ${type}`;
      keyStatus.style.display = 'block';
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          keyStatus.style.display = 'none';
        }, 5000);
      }
    }
  
    function loadUsageStats() {
      // Load stats from chrome storage
      chrome.storage.local.get(['usage_stats'], function(result) {
        if (result.usage_stats) {
          const stats = result.usage_stats;
          workflowCount.textContent = stats.generated || 0;
          successRate.textContent = `${stats.success_rate || 100}%`;
        }
      });
    }
  
    function incrementUsageStats() {
      chrome.storage.local.get(['usage_stats'], function(result) {
        const stats = result.usage_stats || {
          generated: 0,
          successful: 0,
          success_rate: 100
        };
        
        stats.generated += 1;
        stats.successful += 1;
        stats.success_rate = Math.round((stats.successful / stats.generated) * 100);
        stats.last_used = new Date().toLocaleDateString();
        
        chrome.storage.local.set({ usage_stats: stats }, function() {
          loadUsageStats();
        });
      });
    }
  
    // Add some helpful tips
    console.log('🤖 n8n AI Workflow Generator is ready!');
    console.log('💡 Tips:');
    console.log('   • Visit your n8n instance to see the AI interface');
    console.log('   • Try prompts like "Send Slack message when email arrives"');
    console.log('   • The generated JSON will be copied to your clipboard');
    console.log('   • Import it manually in n8n using "Import from clipboard"');
  });