document.addEventListener('DOMContentLoaded', function() {
  const settingsBtn = document.getElementById('settings-btn');
  const backBtn = document.getElementById('back-btn');
  const errorMessage = document.getElementById('error-message');
  
  // Get error message from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message');
  if (message) {
    errorMessage.textContent = message;
  }
  
  // Event listeners
  settingsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  backBtn.addEventListener('click', function() {
    window.history.back();
  });
});
