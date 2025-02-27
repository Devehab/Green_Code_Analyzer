document.addEventListener('DOMContentLoaded', function() {
  const copyJsBtn = document.getElementById('copy-js');
  const copyPythonBtn = document.getElementById('copy-python');
  const copyJavaBtn = document.getElementById('copy-java');
  
  const codeBlocks = document.querySelectorAll('pre code');
  
  copyJsBtn.addEventListener('click', function() {
    copyToClipboard(codeBlocks[0].textContent);
    showCopiedMessage(copyJsBtn);
  });
  
  copyPythonBtn.addEventListener('click', function() {
    copyToClipboard(codeBlocks[1].textContent);
    showCopiedMessage(copyPythonBtn);
  });
  
  copyJavaBtn.addEventListener('click', function() {
    copyToClipboard(codeBlocks[2].textContent);
    showCopiedMessage(copyJavaBtn);
  });
  
  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
  
  function showCopiedMessage(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
    button.disabled = true;
    
    setTimeout(function() {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 2000);
  }
});
