// Background script for Green Code Analyzer

// Initialize context menu items and default settings when the extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Extension installed or updated');
  
  // Create context menu item
  chrome.contextMenus.create({
    id: "analyzeSelectedCode",
    title: "Analyze Code for Energy Efficiency",
    contexts: ["selection"]
  });
  
  // Initialize default settings without an API key
  chrome.storage.local.get(['apiKey'], function(result) {
    // Set default settings without an API key
    if (!result.apiKey) {
      chrome.storage.local.set({ 
        defaultLanguage: 'javascript',
        autoAnalyze: false,
        apiKeyRequired: true
      }, function() {
        console.log('Default settings saved');
      });
    }
    
    // Open welcome page on install (not on update)
    if (details.reason === 'install') {
      chrome.tabs.create({
        url: 'welcome.html'
      });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "analyzeSelectedCode") {
    // Get the selected text
    const selectedText = info.selectionText;
    
    // Check if API key exists before opening popup
    chrome.storage.local.get(['apiKey'], function(result) {
      if (!result.apiKey) {
        // If no API key, open options page instead
        chrome.runtime.openOptionsPage();
        // Show notification to user
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
        
        // Clear badge after 5 seconds
        setTimeout(function() {
          chrome.action.setBadgeText({ text: "" });
        }, 5000);
      } else {
        // Open the popup with the selected text
        chrome.storage.local.set({
          savedCode: selectedText,
          openFromContextMenu: true
        }, function() {
          // Open the popup
          chrome.action.openPopup();
        });
      }
    });
  }
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    sendResponse({success: true});
    return true;
  }
  
  if (request.action === "testApiKey") {
    testApiKey(request.apiKey)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Keep the message channel open for the async response
  }
});

// Function to test API key
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
