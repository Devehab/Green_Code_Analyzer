// PDF Generator Library for Green Code Analyzer
// This file handles the generation of PDF reports

// Make jsPDF available to other scripts
window.jspdf = window.jspdf || {};

// Function to generate PDF from analysis results
function generatePDF(analysisData, codeLanguage, codeSnippet) {
  return new Promise((resolve, reject) => {
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
      
      // Add logo and title
      const currentDate = new Date().toLocaleDateString();
      
      // Add header with tool name and date
      doc.setFillColor(76, 175, 80, 0.1);
      doc.rect(0, 0, 210, 25, 'F');
      
      doc.setDrawColor(76, 175, 80);
      doc.setLineWidth(0.5);
      doc.line(0, 25, 210, 25);
      
      doc.setFontSize(20);
      doc.setTextColor(0, 100, 0);
      doc.text('Green Code Analyzer', 105, 12, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report generated on ${currentDate}`, 105, 18, { align: 'center' });
      
      // Add efficiency score section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Efficiency Analysis', 15, 35);
      
      // Draw score circle
      const score = analysisData.score;
      let scoreColor;
      let ratingText;
      
      if (score >= 90) {
        scoreColor = [0, 150, 0];
        ratingText = 'Excellent';
      } else if (score >= 75) {
        scoreColor = [50, 150, 50];
        ratingText = 'Very Good';
      } else if (score >= 60) {
        scoreColor = [180, 180, 0];
        ratingText = 'Good';
      } else if (score >= 40) {
        scoreColor = [200, 120, 0];
        ratingText = 'Fair';
      } else {
        scoreColor = [200, 0, 0];
        ratingText = 'Poor';
      }
      
      // Draw score circle
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2], 0.2);
      doc.circle(30, 50, 10, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(score.toString(), 30, 52, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(ratingText, 30, 65, { align: 'center' });
      
      // Add explanation
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const explanationLines = doc.splitTextToSize(analysisData.explanation, 150);
      doc.text(explanationLines, 50, 47);
      
      // Add carbon impact section
      doc.setFontSize(16);
      doc.text('Carbon Impact', 15, 85);
      
      doc.setFillColor(200, 230, 200);
      doc.roundedRect(15, 90, 180, 20, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const carbonLines = doc.splitTextToSize(analysisData.carbonImpact, 170);
      doc.text(carbonLines, 20, 98);
      
      // Add recommendations section
      doc.setFontSize(16);
      doc.text('Recommendations', 15, 125);
      
      doc.setFontSize(11);
      let yPos = 135;
      
      analysisData.recommendations.forEach((recommendation, index) => {
        const bulletLines = doc.splitTextToSize(`${index + 1}. ${recommendation}`, 170);
        doc.text(bulletLines, 20, yPos);
        yPos += 7 * bulletLines.length;
        
        // Add a new page if we're running out of space
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add language comparison
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Language Efficiency Comparison', 15, yPos);
      yPos += 10;
      
      doc.setFillColor(220, 230, 240);
      doc.roundedRect(15, yPos, 180, 20, 2, 2, 'F');
      
      doc.setFontSize(11);
      const langLines = doc.splitTextToSize(analysisData.languageComparison, 170);
      doc.text(langLines, 20, yPos + 8);
      yPos += 25 + (langLines.length * 5);
      
      // Add code snippet if there's room
      if (codeSnippet && codeSnippet.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.text('Analyzed Code', 15, yPos);
        yPos += 10;
        
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(15, yPos, 180, 40, 2, 2, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        // Truncate code if too long
        let displayCode = codeSnippet;
        if (displayCode.length > 500) {
          displayCode = displayCode.substring(0, 500) + '...';
        }
        
        doc.text(`Language: ${codeLanguage}`, 20, yPos + 6);
        const codeLines = doc.splitTextToSize(displayCode, 170);
        doc.text(codeLines, 20, yPos + 12);
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by Green Code Analyzer - Making code more environmentally friendly', 105, 290, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: 'right' });
      }
      
      // Save the PDF
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
}

// Export the function
window.generatePDF = generatePDF;
