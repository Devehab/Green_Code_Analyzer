document.addEventListener('DOMContentLoaded', function() {
  // Get button elements
  const openOptionsBtn = document.getElementById('open-options');
  const startAnalyzingBtn = document.getElementById('start-analyzing');
  
  // Open options page when the settings button is clicked
  openOptionsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // Open popup when the start analyzing button is clicked
  startAnalyzingBtn.addEventListener('click', function() {
    // We can't directly open the popup, so we'll open a new tab with our demo page
    chrome.tabs.create({ url: 'popup.html' });
  });
  
  // Add animation to feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    // Add a slight delay to each card for a staggered animation effect
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
});
