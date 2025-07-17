# JobSearchAutomation

## Overview
**JobSearchAutomation** is a custom automation tool designed to streamline the job application process across various job boards and company websites. It saves time by auto-filling applications, managing resumes, and optionally handling company-specific outreach and follow-ups.

---

## Features

✅ Auto-login to job platforms (LinkedIn, Indeed, company sites)  
✅ Auto-fill application forms with uploaded resume and cover letter  
✅ Resume tailoring by job title or keywords (optional module)  
✅ Tracks application status and stores timestamps  
✅ Custom scripts for Selenium-based browser control  
✅ Configuration files for job preferences, filters, and resume templates  

---

## Tech Stack

- **Back-end / Scripts:** Python, Node.js  
- **Automation Tools:** Selenium WebDriver, Puppeteer (optional)  
- **Data Storage:** JSON, CSV, SQLite  
- **Logging:** Python logging / CLI output  
- **Optional Integrations:** Google Sheets API, Airtable, Gmail API  

---

## Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/cejohns/JobSearchAutomation.git
cd JobSearchAutomation
 Configuration
Update the config.json or .env file (if provided) with your preferences:
{
  "resumePath": "./resumes/ReactResume.pdf",
  "coverLetterPath": "./coverLetters/FullStack.pdf",
  "jobTitle": "Full Stack Developer",
  "targetLocations": ["Remote", "North Carolina", "Raleigh"],
  "platforms": ["LinkedIn", "Indeed", "Greenhouse"]

 Run the Bot
bash
Copy
Edit

# Python
python main.py

# Node.js
node index.js
```


Screenshots
![Auto-Fill Screenshot](./screenshots/autofill-example.png)


Roadmap
 UI dashboard for application tracking

 GPT-based resume tailoring

 Captcha bypass alert system

 Support for Lever, Ashby, Workday platforms

Disclaimer
⚠️ Use this tool responsibly. Some job platforms prohibit automated applications. This software is intended for personal and educational use only.

License
MIT License

Author
Cory Johnson
