document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const initialView = document.getElementById('initial-view');
  const loadingView = document.getElementById('loading-view');
  const resultsView = document.getElementById('results-view');
  const codeInput = document.getElementById('code-input');
  const languageSelect = document.getElementById('language-select');
  const analyzeBtn = document.getElementById('analyze-btn');
  const backBtn = document.getElementById('back-btn');
  const efficiencyScoreContainer = document.getElementById('efficiency-score-container');
  const efficiencyRating = document.getElementById('efficiency-rating');
  const carbonImpact = document.getElementById('carbon-impact');
  const recommendationsList = document.getElementById('recommendations-list');
  const languageComparison = document.getElementById('language-comparison');
  const settingsBtn = document.getElementById('settings-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');

  // API key for Google Gemini - must be provided by the user
  let API_KEY = '';
  // Updated API URL to the latest version
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent';

  // Event listeners
  analyzeBtn.addEventListener('click', analyzeCode);
  backBtn.addEventListener('click', showInitialView);
  settingsBtn.addEventListener('click', openSettings);
  downloadPdfBtn.addEventListener('click', downloadPdf);

  // Global variables to store analysis data
  let currentAnalysisData = null;
  let currentCodeLanguage = '';
  let currentCodeSnippet = '';

  // Function to check for API key and show a warning if it's missing
  function checkApiKey() {
    chrome.storage.local.get(['apiKey'], function(result) {
      if (!result.apiKey) {
        console.warn("No API key found in storage");
        alert("Please set your Google Gemini API key in the settings before using the extension.");
      }
    });
  }

  // Check if API key exists when popup opens
  checkApiKey();

  // Auto-analyze on paste if enabled
  codeInput.addEventListener('paste', function(e) {
    chrome.storage.local.get(['autoAnalyze'], function(result) {
      if (result.autoAnalyze) {
        // Small delay to allow the paste to complete
        setTimeout(function() {
          if (codeInput.value.trim()) {
            analyzeCode();
          }
        }, 100);
      }
    });
  });

  // Load any saved code from storage and API key if available
  chrome.storage.local.get(['savedCode', 'savedLanguage', 'defaultLanguage', 'openFromContextMenu', 'apiKey'], function(result) {
    if (result.savedCode) {
      codeInput.value = result.savedCode;
    }
    
    if (result.savedLanguage) {
      languageSelect.value = result.savedLanguage;
    } else if (result.defaultLanguage) {
      languageSelect.value = result.defaultLanguage;
    }
    
    // Get API key directly from storage
    if (result.apiKey) {
      API_KEY = result.apiKey;
      console.log("API key loaded from storage (first few characters):", API_KEY.substring(0, 4) + "...");
    } else {
      // If no API key is found, redirect to options page
      console.warn("No API key found in storage");
      chrome.runtime.openOptionsPage();
      alert("Please set your Google Gemini API key in the settings before using the extension.");
      return;
    }
    
    // If opened from context menu, automatically analyze the code
    if (result.openFromContextMenu) {
      chrome.storage.local.remove('openFromContextMenu');
      if (codeInput.value.trim()) {
        analyzeCode();
      }
    }
  });

  // Function to open settings page
  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  // Function to analyze code
  async function analyzeCode() {
    const code = codeInput.value.trim();
    const language = languageSelect.value;
    
    // Save to storage
    chrome.storage.local.set({
      savedCode: code,
      savedLanguage: language
    });

    if (!code) {
      alert('Please enter some code to analyze.');
      return;
    }

    // Check if API key is available
    if (!API_KEY) {
      alert('API key is missing. Please set your Google Gemini API key in the settings.');
      chrome.runtime.openOptionsPage();
      return;
    }

    // Show loading view
    initialView.classList.add('hidden');
    loadingView.classList.remove('hidden');
    
    // Start the loading animation
    startLoadingAnimation();

    try {
      const result = await getCodeAnalysis(code, language);
      displayResults(result);
      currentAnalysisData = result;
      currentCodeLanguage = language;
      currentCodeSnippet = code;
    } catch (error) {
      console.error('Error analyzing code:', error);
      alert('An error occurred while analyzing the code: ' + error.message);
      showInitialView();
    }
  }

  // Function to start the loading animation
  function startLoadingAnimation() {
    // Get loading tips elements
    const loadingTips = document.querySelectorAll('.loading-tips');
    
    // Set initial opacity for all tips except the first one
    loadingTips.forEach((tip, index) => {
      if (index > 0) {
        tip.style.opacity = '0';
      }
    });
    
    // Create a rotating set of loading tips
    let currentTipIndex = 0;
    const tipRotationInterval = setInterval(() => {
      // Hide current tip
      if (loadingTips[currentTipIndex]) {
        loadingTips[currentTipIndex].style.opacity = '0';
      }
      
      // Move to next tip
      currentTipIndex = (currentTipIndex + 1) % loadingTips.length;
      
      // Show next tip
      if (loadingTips[currentTipIndex]) {
        loadingTips[currentTipIndex].style.opacity = '1';
      }
    }, 4000);
    
    // Store the interval ID so we can clear it later
    window.loadingAnimationInterval = tipRotationInterval;
  }

  // Function to get code analysis from Gemini API
  async function getCodeAnalysis(code, language) {
    const prompt = `
      Analyze the following ${language} code for energy efficiency and resource usage. 
      Provide a comprehensive analysis including:
      
      1. An efficiency score from 0-100
      2. A brief explanation of the score
      3. Estimated carbon impact of running this code
      4. 3-5 specific recommendations to improve efficiency
      5. A comparison of how this code might perform in terms of energy efficiency if implemented in other programming languages
      
      Here's the code:
      
      ${code}
      
      Format your response as a JSON object with the following structure:
      {
        "score": number,
        "explanation": "string",
        "carbonImpact": "string",
        "recommendations": ["string", "string", ...],
        "languageComparison": "string"
      }
      
      Important: Do not use markdown formatting like ** for bold text in your response.
    `;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024
      }
    };

    try {
      console.log('Making API request to:', API_URL);
      console.log('Using API key (first few characters):', API_KEY.substring(0, 4) + '...');
      
      // Construct the full URL with the API key
      const fullUrl = `${API_URL}?key=${API_KEY}`;
      console.log('Full URL (without key):', API_URL + '?key=HIDDEN');
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        // Log more details about the error
        try {
          const errorJson = JSON.parse(errorText);
          console.error('API error details:', errorJson);
        } catch (e) {
          // If it's not JSON, just log the text
          console.error('API error text:', errorText);
        }
        
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response received:', data);
      
      try {
        // The response format may have changed, so let's handle different possible formats
        let responseText;
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          // New format
          console.log('Using candidates[0].content.parts[0].text format');
          responseText = data.candidates[0].content.parts[0].text;
        } else if (data.content && data.content.parts) {
          // Alternative format
          console.log('Using content.parts[0].text format');
          responseText = data.content.parts[0].text;
        } else {
          console.error('Unexpected API response format:', data);
          throw new Error('Unexpected API response format. Please check the console for details.');
        }
        
        console.log('Response text:', responseText);
        
        // Extract the JSON from the response text
        // First, try to parse the entire response as JSON
        let analysisResult;
        try {
          analysisResult = JSON.parse(responseText);
          console.log('Successfully parsed response as JSON directly');
        } catch (e) {
          console.warn('Failed to parse response as JSON directly, trying to extract JSON from text');
          // If that fails, try to extract JSON from the text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              analysisResult = JSON.parse(jsonMatch[0]);
              console.log('Successfully extracted and parsed JSON from response text');
            } catch (e2) {
              console.error('Failed to parse extracted JSON:', e2);
              throw new Error('Failed to parse JSON from API response');
            }
          } else {
            console.error('No JSON pattern found in response text');
            throw new Error('No JSON found in API response');
          }
        }
        
        // Remove markdown stars from text
        function removeMarkdownStars(text) {
          return text.replace(/\*\*/g, '');
        }
        
        // Remove markdown stars from analysis result
        analysisResult.explanation = removeMarkdownStars(analysisResult.explanation);
        analysisResult.carbonImpact = removeMarkdownStars(analysisResult.carbonImpact);
        analysisResult.recommendations = analysisResult.recommendations.map(recommendation => removeMarkdownStars(recommendation));
        analysisResult.languageComparison = removeMarkdownStars(analysisResult.languageComparison);
        
        // Validate the analysis result has the expected structure
        if (!analysisResult.score || !analysisResult.recommendations) {
          console.error('Invalid analysis result structure:', analysisResult);
          
          // Try to create a valid structure if possible
          return {
            score: analysisResult.score || 50,
            explanation: analysisResult.explanation || "Analysis completed with partial results",
            carbonImpact: analysisResult.carbonImpact || "Carbon impact could not be determined",
            recommendations: analysisResult.recommendations || ["No specific recommendations available"],
            languageComparison: analysisResult.languageComparison || "Language comparison data not available"
          };
        }
        
        return analysisResult;
      } catch (error) {
        console.error('Error parsing API response:', error);
        
        // Provide a fallback response
        return {
          score: 50,
          explanation: "We encountered an issue analyzing your code. This is a fallback response.",
          carbonImpact: "Unable to determine carbon impact due to analysis error.",
          recommendations: [
            "Try again with a simpler code sample",
            "Check that your code is valid and complete",
            "The API may be experiencing issues, try again later"
          ],
          languageComparison: "Unable to provide language comparison due to analysis error."
        };
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Function to display analysis results
  function displayResults(result) {
    // Clear the loading animation interval
    if (window.loadingAnimationInterval) {
      clearInterval(window.loadingAnimationInterval);
      window.loadingAnimationInterval = null;
    }
    
    // Hide loading view and show results view
    loadingView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    
    // Get elements
    const efficiencyScoreContainer = document.getElementById('efficiency-score-container');
    const efficiencyRating = document.getElementById('efficiency-rating');
    const scoreExplanation = document.getElementById('score-explanation');
    const carbonImpact = document.getElementById('carbon-impact');
    const recommendationsList = document.getElementById('recommendations-list');
    const languageComparison = document.getElementById('language-comparison');
    
    // Set efficiency score
    const score = result.score;
    let scoreColor, ratingText, ratingClass;
    
    if (score >= 90) {
      scoreColor = 'text-green-600';
      ratingText = 'Excellent';
      ratingClass = 'bg-green-100 text-green-800';
    } else if (score >= 75) {
      scoreColor = 'text-green-500';
      ratingText = 'Very Good';
      ratingClass = 'bg-green-100 text-green-700';
    } else if (score >= 60) {
      scoreColor = 'text-yellow-500';
      ratingText = 'Good';
      ratingClass = 'bg-yellow-100 text-yellow-800';
    } else if (score >= 40) {
      scoreColor = 'text-orange-500';
      ratingText = 'Fair';
      ratingClass = 'bg-orange-100 text-orange-800';
    } else {
      scoreColor = 'text-red-500';
      ratingText = 'Poor';
      ratingClass = 'bg-red-100 text-red-800';
    }
    
    efficiencyScoreContainer.innerHTML = `
      <div class="text-3xl font-bold ${scoreColor}">${score}</div>
      <div class="text-xs text-gray-500">out of 100</div>
    `;
    
    efficiencyRating.innerHTML = `<span class="px-2 py-1 rounded-full ${ratingClass} text-xs font-medium">${ratingText}</span>`;
    
    // Set explanation
    scoreExplanation.textContent = result.explanation || '';
    
    // Function to remove markdown stars from text
    function removeMarkdownStars(text) {
      return text.replace(/\*\*/g, '');
    }
    
    // Set carbon impact with icon and remove markdown stars
    carbonImpact.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">${removeMarkdownStars(result.carbonImpact)}</div>
      </div>
    `;
    
    // Set recommendations with animation and remove markdown stars
    recommendationsList.innerHTML = '';
    result.recommendations.forEach((recommendation, index) => {
      const li = document.createElement('li');
      li.className = 'fade-in';
      li.style.animationDelay = `${index * 0.1}s`;
      li.textContent = removeMarkdownStars(recommendation);
      recommendationsList.appendChild(li);
    });
    
    // Set language comparison and remove markdown stars
    languageComparison.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">${removeMarkdownStars(result.languageComparison)}</div>
      </div>
    `;
  }

  // Function to download PDF
  function downloadPdf() {
    if (!currentAnalysisData) {
      alert('No analysis data available to download.');
      return;
    }

    // Show loading indicator
    downloadPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generating...';
    downloadPdfBtn.disabled = true;

    try {
      const { jsPDF } = window.jspdf;
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set document properties
      doc.setProperties({
        title: 'Green Code Analysis Report',
        subject: 'Code Efficiency Analysis',
        author: 'Green Code Analyzer',
        keywords: 'code efficiency, energy consumption, green coding',
        creator: 'Green Code Analyzer Extension'
      });
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15; // Standard margin for all sides
      const contentWidth = pageWidth - (2 * margin);
      
      // Current Y position tracker
      let yPos = margin;
      
      // Function to add a new page when needed
      function addNewPageIfNeeded(requiredSpace) {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          
          // Add header to new page
          doc.setFillColor(240, 240, 240);
          doc.rect(0, 0, pageWidth, 10, 'F');
          
          doc.setTextColor(0, 100, 0);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Green Code Analyzer - Continued', pageWidth / 2, 7, { align: 'center' });
          
          // Reset position
          yPos = 15; // Start below the header
          return true;
        }
        return false;
      }
      
      // Function to create a section with title and content
      function addSection(title, content, minHeight = 30) {
        // Calculate content height
        doc.setFontSize(10);
        const contentLines = doc.splitTextToSize(content, contentWidth - 10);
        const contentHeight = contentLines.length * 5 + 20; // 5mm per line + padding
        const sectionHeight = Math.max(minHeight, contentHeight);
        
        // Check if we need a new page
        addNewPageIfNeeded(sectionHeight + 5);
        
        // Draw section box
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, yPos, contentWidth, sectionHeight, 2, 2, 'FD');
        
        // Add title
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, yPos + 10);
        
        // Add content
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(contentLines, margin + 5, yPos + 20);
        
        // Update position
        yPos += sectionHeight + 5;
      }
      
      // Function to add a list section
      function addListSection(title, items, minHeight = 40) {
        // Calculate content height
        let totalContentHeight = 15; // Title + initial padding
        const processedItems = [];
        
        items.forEach((item, index) => {
          doc.setFontSize(10);
          // Limit each item to ensure it fits
          let processedItem = item;
          if (item.length > 200) {
            processedItem = item.substring(0, 200) + '...';
          }
          
          const itemLines = doc.splitTextToSize(processedItem, contentWidth - 15);
          totalContentHeight += itemLines.length * 5 + 5; // 5mm per line + spacing
          processedItems.push({
            text: processedItem,
            lines: itemLines
          });
        });
        
        const sectionHeight = Math.max(minHeight, totalContentHeight);
        
        // Check if we need a new page
        const needsNewPage = addNewPageIfNeeded(sectionHeight + 5);
        
        // Draw section box
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, yPos, contentWidth, sectionHeight, 2, 2, 'FD');
        
        // Add title
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, yPos + 10);
        
        // Add items
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        let itemYPos = yPos + 20;
        processedItems.forEach((item, index) => {
          // Check if this item needs a new page
          if (itemYPos + (item.lines.length * 5) > pageHeight - margin) {
            doc.addPage();
            
            // Add header to new page
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, pageWidth, 10, 'F');
            
            doc.setTextColor(0, 100, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Green Code Analyzer - Continued', pageWidth / 2, 7, { align: 'center' });
            
            // Reset position
            itemYPos = 20;
            
            // Redraw the section box on the new page
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(margin, 15, contentWidth, pageHeight - 30, 2, 2, 'FD');
            
            // Add title again
            doc.setTextColor(0, 100, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${title} (Continued)`, margin + 5, itemYPos - 5);
            
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
          }
          
          // Add bullet point
          doc.text(`${index + 1}.`, margin + 5, itemYPos);
          
          // Add item text
          doc.text(item.lines, margin + 15, itemYPos);
          
          // Update position
          itemYPos += item.lines.length * 5 + 5;
        });
        
        // Update position
        if (needsNewPage) {
          yPos = itemYPos + 5;
        } else {
          yPos += sectionHeight + 5;
        }
      }
      
      // Function to add code section
      function addCodeSection(title, language, code, minHeight = 50) {
        // Clean code but don't limit it - show full code as requested
        let displayCode = code;
        
        // Replace non-ASCII characters with spaces to avoid rendering issues
        displayCode = displayCode.replace(/[^\x00-\x7F]/g, ' ');
        
        // Calculate content height
        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        const codeLines = doc.splitTextToSize(displayCode, contentWidth - 10);
        
        // Calculate height needed for code - with minimum of 50mm
        const contentHeight = codeLines.length * 4 + 25; // 4mm per line + padding
        const sectionHeight = Math.max(minHeight, contentHeight);
        
        // Check if we need a new page
        addNewPageIfNeeded(sectionHeight + 5);
        
        // If code is very long, it might need multiple pages
        if (sectionHeight > pageHeight - 30) {
          // For very long code, we'll split it across multiple pages
          
          // First page
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.5);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPos, contentWidth, pageHeight - yPos - margin, 2, 2, 'FD');
          
          // Add title
          doc.setTextColor(0, 100, 0);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(title, margin + 5, yPos + 10);
          
          // Add language
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`Language: ${language}`, margin + 5, yPos + 18);
          
          // Calculate how many lines fit on first page
          const linesPerPage = Math.floor((pageHeight - yPos - margin - 25) / 4);
          const firstPageLines = codeLines.slice(0, linesPerPage);
          
          // Add code for first page
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(8);
          doc.setFont('courier', 'normal');
          doc.text(firstPageLines, margin + 5, yPos + 25);
          
          // Continue with additional pages if needed
          let remainingLines = codeLines.slice(linesPerPage);
          let pageNum = 1;
          
          while (remainingLines.length > 0) {
            doc.addPage();
            
            // Add header to new page
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, pageWidth, 10, 'F');
            
            doc.setTextColor(0, 100, 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Green Code Analyzer - Continued', pageWidth / 2, 7, { align: 'center' });
            
            // Draw code box
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(margin, 15, contentWidth, pageHeight - 25, 2, 2, 'FD');
            
            // Add title again
            doc.setTextColor(0, 100, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${title} (Continued)`, margin + 5, 25);
            
            // Calculate lines for this page
            const nextPageLines = remainingLines.slice(0, Math.floor((pageHeight - 40) / 4));
            
            // Add code for this page
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(8);
            doc.setFont('courier', 'normal');
            doc.text(nextPageLines, margin + 5, 35);
            
            // Update remaining lines
            remainingLines = remainingLines.slice(nextPageLines.length);
            pageNum++;
          }
          
          // Update position for next section
          yPos = pageHeight; // This will trigger a new page on next section
        } else {
          // For code that fits on one page
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.5);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPos, contentWidth, sectionHeight, 2, 2, 'FD');
          
          // Add title
          doc.setTextColor(0, 100, 0);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(title, margin + 5, yPos + 10);
          
          // Add language
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`Language: ${language}`, margin + 5, yPos + 18);
          
          // Add code
          doc.setTextColor(50, 50, 50);
          doc.setFontSize(8);
          doc.setFont('courier', 'normal');
          doc.text(codeLines, margin + 5, yPos + 25);
          
          // Update position
          yPos += sectionHeight + 5;
        }
      }
      
      // Function to add score section
      function addScoreSection() {
        const score = currentAnalysisData.score;
        let scoreColor, ratingText;
        
        if (score >= 90) {
          scoreColor = [0, 100, 0]; // Dark green
          ratingText = 'Excellent';
        } else if (score >= 75) {
          scoreColor = [34, 139, 34]; // Forest green
          ratingText = 'Very Good';
        } else if (score >= 60) {
          scoreColor = [218, 165, 32]; // Golden rod
          ratingText = 'Good';
        } else if (score >= 40) {
          scoreColor = [255, 140, 0]; // Dark orange
          ratingText = 'Fair';
        } else {
          scoreColor = [178, 34, 34]; // Firebrick red
          ratingText = 'Poor';
        }
        
        // Calculate content height
        doc.setFontSize(10);
        const explanationLines = doc.splitTextToSize(currentAnalysisData.explanation, contentWidth - 30);
        const contentHeight = explanationLines.length * 5 + 30; // 5mm per line + padding
        const sectionHeight = Math.max(50, contentHeight);
        
        // Check if we need a new page
        addNewPageIfNeeded(sectionHeight + 5);
        
        // Draw section box
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, yPos, contentWidth, sectionHeight, 2, 2, 'FD');
        
        // Add title
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Efficiency Analysis', margin + 5, yPos + 10);
        
        // Draw score circle
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.circle(margin + 15, yPos + 25, 10, 'F');
        
        // Add score text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(score.toString(), margin + 15, yPos + 27, { align: 'center' });
        
        // Add rating text
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.setFontSize(10);
        doc.text(ratingText, margin + 15, yPos + 40, { align: 'center' });
        
        // Add explanation
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(explanationLines, margin + 30, yPos + 25);
        
        // Update position
        yPos += sectionHeight + 5;
      }
      
      // Add header
      const currentDate = new Date().toLocaleDateString();
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 20, 'F');
      
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Green Code Analyzer', pageWidth / 2, 10, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Report generated on ${currentDate}`, pageWidth / 2, 16, { align: 'center' });
      
      // Update position after header
      yPos = 25;
      
      // Add efficiency score section
      addScoreSection();
      
      // Add carbon impact section
      addSection('Carbon Impact', currentAnalysisData.carbonImpact, 40);
      
      // Add recommendations section
      addListSection('Recommendations', currentAnalysisData.recommendations, 60);
      
      // Add language comparison section
      addSection('Language Efficiency Comparison', currentAnalysisData.languageComparison, 40);
      
      // Add code snippet if available
      if (currentCodeSnippet && currentCodeSnippet.length > 0) {
        addCodeSection('Analyzed Code', currentCodeLanguage, currentCodeSnippet, 60);
      }
      
      // Add footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Add footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
        
        // Add footer text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Generated by Green Code Analyzer', margin, pageHeight - 5);
        
        // Add page number
        doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }
      
      // Save the PDF
      doc.save('Green_Code_Analysis_Report.pdf');
      
      // Reset button state
      downloadPdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-1"></i>Download PDF';
      downloadPdfBtn.disabled = false;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
      
      // Reset button state
      downloadPdfBtn.innerHTML = '<i class="fas fa-file-pdf mr-1"></i>Download PDF';
      downloadPdfBtn.disabled = false;
    }
  }

  // Function to go back to initial view
  function showInitialView() {
    // Clear the loading animation interval
    if (window.loadingAnimationInterval) {
      clearInterval(window.loadingAnimationInterval);
      window.loadingAnimationInterval = null;
    }
    
    resultsView.classList.add('hidden');
    loadingView.classList.add('hidden');
    initialView.classList.remove('hidden');
  }
});
