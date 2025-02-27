document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const apiKeyInput = document.getElementById('api-key');
  const defaultLanguageSelect = document.getElementById('default-language');
  const autoAnalyzeCheckbox = document.getElementById('auto-analyze');
  const saveButton = document.getElementById('save-btn');
  const getApiKeyLink = document.getElementById('get-api-key');
  const testApiKeyButton = document.getElementById('test-api-key');
  const apiTestResult = document.getElementById('api-test-result');

  // Load saved settings
  loadSavedSettings();

  // Open Google AI Studio when the link is clicked
  if (getApiKeyLink) {
    getApiKeyLink.addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://aistudio.google.com/app/apikey' });
    });
  }

  // Function to load saved settings
  function loadSavedSettings() {
    chrome.storage.local.get(['apiKey', 'defaultLanguage', 'autoAnalyze'], function(result) {
      if (result.apiKey) {
        apiKeyInput.value = result.apiKey;
      } else {
        // Show a message if no API key is found
        showApiTestResult('No API key found. Please enter your Google Gemini API key.', 'warning');
      }
      
      if (result.defaultLanguage) {
        defaultLanguageSelect.value = result.defaultLanguage;
      }
      
      if (result.autoAnalyze !== undefined) {
        autoAnalyzeCheckbox.checked = result.autoAnalyze;
      }
    });
  }

  // Test API key functionality
  if (testApiKeyButton) {
    testApiKeyButton.addEventListener('click', async function() {
      const apiKey = apiKeyInput.value.trim();
      
      if (!apiKey) {
        showApiTestResult('Please enter an API key first', 'error');
        return;
      }
      
      // Show loading state
      testApiKeyButton.disabled = true;
      testApiKeyButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Testing...';
      showApiTestResult('Testing API key...', 'info');
      
      try {
        const result = await testApiKey(apiKey);
        if (result.success) {
          showApiTestResult('API key is valid!', 'success');
        } else {
          showApiTestResult(`API key test failed: ${result.error}`, 'error');
        }
      } catch (error) {
        showApiTestResult(`Error testing API key: ${error.message}`, 'error');
      } finally {
        // Reset button state
        testApiKeyButton.disabled = false;
        testApiKeyButton.innerHTML = '<i class="fas fa-vial mr-1"></i>Test API Key';
      }
    });
  }

  // Save settings
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const defaultLanguage = defaultLanguageSelect.value;
    const autoAnalyze = autoAnalyzeCheckbox.checked;
    
    if (!apiKey) {
      showMessage('API key is required. The extension will not function without a valid API key.', 'error');
      apiKeyInput.focus();
      apiKeyInput.classList.add('border-red-500');
      setTimeout(() => {
        apiKeyInput.classList.remove('border-red-500');
      }, 3000);
      return;
    }
    
    // Validate API key format (basic check)
    if (apiKey.length < 20) {
      showMessage('API key appears to be too short. Please enter a valid API key.', 'error');
      return;
    }
    
    // Accept keys that start with AI or AIza (Google API key format)
    if (!apiKey.startsWith('AI') && !apiKey.startsWith('ai') && !apiKey.startsWith('AIza')) {
      showMessage('API key format appears to be invalid. Google API keys typically start with "AI" or "AIza"', 'error');
      return;
    }
    
    chrome.storage.local.set({
      apiKey: apiKey,
      defaultLanguage: defaultLanguage,
      autoAnalyze: autoAnalyze
    }, function() {
      // Show success message
      showMessage('Settings saved successfully!', 'success');
    });
  });
  
  // Function to test the API key
  async function testApiKey(apiKey) {
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Hello, please respond with 'API key is working' if you receive this message."
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10
      }
    };
    
    try {
      const response = await fetch(`${API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API test failed:', errorText);
        
        // Check for specific error types
        if (response.status === 401 || response.status === 403) {
          return { success: false, error: 'Invalid API key or permission denied' };
        } else if (response.status === 429) {
          return { success: false, error: 'Rate limit exceeded. Try again later.' };
        } else {
          return { success: false, error: `HTTP error ${response.status}: ${errorText}` };
        }
      }
      
      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      console.error('API test error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Function to show API test result
  function showApiTestResult(message, type) {
    apiTestResult.textContent = message;
    apiTestResult.className = `mt-2 text-sm ${type === 'error' ? 'text-red-500' : type === 'success' ? 'text-green-500' : 'text-blue-500'}`;
    apiTestResult.classList.remove('hidden');
  }
  
  // Function to show message
  function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg message ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(function() {
      messageElement.remove();
    }, 3000);
  }
});
