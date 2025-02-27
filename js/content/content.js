// This script runs in the context of web pages

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getSelectedCode") {
    // Get any selected text from the page
    const selectedText = window.getSelection().toString();
    sendResponse({code: selectedText});
  }
});

// Add a context menu item for code blocks on websites that have code (like GitHub, StackOverflow, etc.)
document.addEventListener('contextmenu', function(event) {
  // Check if the clicked element is a code block
  const isCodeBlock = event.target.tagName === 'CODE' || 
                      event.target.tagName === 'PRE' ||
                      event.target.closest('pre') !== null ||
                      event.target.closest('code') !== null;
  
  if (isCodeBlock) {
    // Store the element for potential later use
    window.lastRightClickedCodeElement = event.target;
  }
});
