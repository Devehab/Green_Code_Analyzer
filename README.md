# 🌱 Green Code Analyzer

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-green.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen.svg)](https://github.com/yourusername/green-code-analyzer)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with Google Gemini](https://img.shields.io/badge/Made%20with-Google%20Gemini-blue)](https://ai.google.dev/)

<p align="center">
  <img src="assets/icons/coding.png" alt="Green Code Analyzer Logo" width="128" height="128">
</p>

<p align="center">
  <b>Analyze and optimize your code for energy efficiency and reduced carbon footprint</b>
</p>

## 📋 Overview

Green Code Analyzer is a powerful Chrome extension that leverages Google Gemini AI to analyze code efficiency in terms of energy consumption and resource usage. In an era where software's environmental impact is increasingly important, this tool helps developers write more sustainable and eco-friendly code.

## ✨ Key Features

- **🔍 Intelligent Code Analysis**: Evaluates code patterns and structures for energy efficiency
- **📊 Efficiency Score**: Provides a clear 0-100 score indicating how energy-efficient your code is
- **🌍 Carbon Impact Estimation**: Calculates the environmental footprint of your code
- **💡 Smart Optimization Suggestions**: Offers actionable recommendations to improve efficiency
- **📄 PDF Report Generation**: Export comprehensive analysis reports in PDF format for sharing and documentation
- **🔄 Language Comparison**: Ranks programming languages based on energy efficiency
- **🖱️ Context Menu Integration**: Right-click on any code on the web to analyze it instantly
- **🔠 Multi-Language Support**: Works with JavaScript, Python, Java, C++, Ruby, and more
- **🧩 Well-Organized Codebase**: Structured project with separate directories for libraries, CSS, and JavaScript files

## ✨ Screenshots

<p align="center">
  <i>Screenshots will be added soon</i>
</p>

## 🚀 Getting Started

### Prerequisites

- Google Chrome browser
- Google Gemini API key (Get yours at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

#### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (coming soon)
2. Click "Add to Chrome"
3. Follow the prompts to complete installation

#### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/Devehab/green-code-analyzer.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed in your browser

### Configuration

1. Click on the Green Code Analyzer icon in your toolbar
2. Navigate to Settings (⚙️)
3. Enter your Google Gemini API key
4. Customize your default programming language and other preferences
5. Save your settings

## 💻 How to Use

### Method 1: Using the Extension Popup
1. Click the Green Code Analyzer icon in your Chrome toolbar
2. Paste your code into the text area
3. Select the programming language from the dropdown
4. Click "Analyze Code"
5. Review the detailed efficiency analysis and recommendations
6. Click "Download PDF" to save a comprehensive report of the analysis

### Method 2: Using the Context Menu
1. Select code on any webpage
2. Right-click and select "Analyze Code for Energy Efficiency"
3. The extension will open with the selected code and analyze it automatically

## 🧪 Example Use Cases

- **Web Developers**: Optimize JavaScript and CSS for better performance and lower energy consumption
- **Backend Developers**: Identify resource-intensive algorithms and database queries
- **DevOps Teams**: Analyze deployment scripts for efficiency
- **Students**: Learn best practices for writing environmentally-friendly code
- **Tech Leads**: Enforce green coding standards across teams
- **Documentation**: Generate and share PDF reports of code analysis with team members or stakeholders

## 📄 PDF Reports Feature

The Green Code Analyzer provides comprehensive PDF reports that capture all aspects of your code analysis. These reports are designed to be shared with team members, included in documentation, or used for tracking improvements over time.

### What's Included in the PDF Report:

- **Analysis Summary**: Overall efficiency score and carbon impact metrics
- **Code Details**: The analyzed code snippet with proper formatting and syntax highlighting
- **Recommendations**: Detailed suggestions for improving code efficiency
- **Energy Comparison**: How your code compares to industry standards
- **Timestamp**: When the analysis was performed for reference

### How to Generate and Use PDF Reports:

1. **Generate a Report**: After analyzing your code, click the "Download PDF" button in the results section
2. **Customize Report Content**: All analyzed content is automatically included in the report
3. **Share with Stakeholders**: Send the PDF to team members, managers, or clients to demonstrate your commitment to green coding practices
4. **Documentation**: Include the reports in your project documentation to track efficiency improvements
5. **Code Reviews**: Use the reports during code reviews to identify areas for optimization

### PDF Report Technical Features:

- **Multi-page Support**: Handles reports of any length with proper pagination
- **UTF-8 Encoding**: Properly displays code in multiple programming languages
- **Responsive Layout**: Adapts content to fit within the page boundaries
- **Consistent Formatting**: Professional design with clear section separation

## 🛠️ Technologies Used

- **Google Gemini AI**: Powers the intelligent code analysis
- **JavaScript**: Core extension functionality
- **HTML/CSS & TailwindCSS**: User interface design
- **jsPDF & html2canvas**: PDF report generation capabilities
- **Chrome Extension API**: Browser integration
- **Font Awesome**: UI icons and visual elements

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## 📁 Project Structure

The Green Code Analyzer follows a clean, organized directory structure:

```
green-code-analyzer/
├── assets/            # Static assets
│   └── icons/         # Extension icons in various sizes
├── css/               # Stylesheet files
│   └── styles.css     # Main stylesheet
├── html/              # HTML pages
│   ├── options.html   # Settings page
│   ├── error.html     # Error handling page
│   ├── welcome.html   # Welcome/onboarding page
│   └── ...            # Other HTML pages
├── js/                # JavaScript files
│   ├── background/    # Background scripts
│   ├── content/       # Content scripts
│   ├── popup/         # Popup UI scripts
│   ├── options/       # Settings page scripts
│   └── ...            # Other JS files
├── libs/              # Third-party libraries
│   ├── jspdf.umd.min.js    # PDF generation library
│   └── html2canvas.min.js  # HTML to canvas conversion
├── manifest.json      # Extension manifest
├── popup.html         # Main extension popup
├── README.md          # Project documentation
└── CONTRIBUTING.md    # Contribution guidelines
```

This structure makes the codebase more maintainable, easier to navigate, and follows best practices for Chrome extension development.

## 🔮 Roadmap

- [ ] Support for more programming languages and frameworks
- [ ] Integration with popular code editors (VS Code, JetBrains)
- [ ] Historical tracking of code efficiency improvements
- [ ] Team collaboration features
- [ ] Detailed reports and analytics dashboard
- [ ] CI/CD pipeline integration
- [ ] Customizable PDF report templates
- [ ] Batch analysis of multiple files

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| API Key Issues | Ensure your Google Gemini API key is valid and correctly entered in settings |
| Extension Not Working | Try reloading the extension from Chrome's extensions page |
| Analysis Errors | Make sure your code is properly formatted and the correct language is selected |
| Slow Performance | For large code blocks, try analyzing smaller sections |

## 📝 License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## 👏 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/) for providing the powerful AI capabilities
- [TailwindCSS](https://tailwindcss.com/) for the UI framework
- [Font Awesome](https://fontawesome.com/) for the icons
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) for making browser extensions possible
- All contributors who have helped shape this project

---

<p align="center">
  <b>Made with 💚 for a greener digital future</b>
</p>

<p align="center">
  <a href="https://github.com/yourusername/green-code-analyzer/issues">Report Bug</a>
  ·
  <a href="https://github.com/yourusername/green-code-analyzer/issues">Request Feature</a>
</p>
