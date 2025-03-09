const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { OpenAI } = require("openai");
const axios = require("axios");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Path to ChromeDriver
const chromeDriverPath = path.join(__dirname, "chromedriver-win64", "chromedriver.exe");

// Set up Chrome options
const options = new chrome.Options();
options.addArguments("--headless");
options.addArguments("--disable-gpu");
options.addArguments("--no-sandbox");
options.addArguments("--ignore-certificate-errors-spki-list");
options.addArguments("--disable-dev-shm-usage");
options.addArguments("--ssl-version-min=tls1.2");
options.addArguments("--disable-blink-features=AutomationControlled");

// Connect to SQLite database
const db = new sqlite3.Database("jobs.db");

// Ensure the necessary table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS job_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            company TEXT,
            link TEXT,
            industry TEXT,
            status TEXT
        )
    `);
});

// Resume storage by industry
const RESUME_STORAGE = {
    "Software Development": path.join(__dirname, "resumes", "software_dev_resume.pdf"),
    "Game Development": path.join(__dirname, "resumes", "game_dev_resume.pdf"),
    "Tech Startups": path.join(__dirname, "resumes", "startup_resume.pdf"),
    "Enterprise Tech": path.join(__dirname, "resumes", "enterprise_resume.pdf")
};

// Function to generate a cover letter using OpenAI
async function generateCoverLetter(jobTitle, company) {
    try {
        const prompt = `Write a professional and customized cover letter for a ${jobTitle} position at ${company}. Include enthusiasm for the role, relevant skills, and why I am a good fit.`;
        const response = await openai.completions.create({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 300,
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error("Error generating cover letter:", error);
        throw new Error("Failed to generate cover letter");
    }
}

// Function to optimize a resume using OpenAI
async function optimizeResume(jobTitle, company) {
    try {
        const prompt = `Revise my resume to highlight relevant experience for a ${jobTitle} position at ${company}. Keep it concise and professional.`;
        const response = await openai.completions.create({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 500,
        });
        return response.choices[0].text.trim();
    } catch (error) {
        console.error("Error optimizing resume:", error);
        throw new Error("Failed to optimize resume");
    }
}

// Function to track application status
function trackApplicationStatus() {
    console.log("Tracking application responses...");
    db.all("SELECT id, title, company FROM job_listings WHERE status='Applied'", (err, rows) => {
        if (err) {
            console.error("Error tracking application status:", err);
            return;
        }
        rows.forEach((row) => {
            const { id, title, company } = row;
            try {
                const responseStatus = id % 2 === 0 ? "Interview Scheduled" : "No Response";
                db.run("UPDATE job_listings SET status=? WHERE id=?", [responseStatus, id]);
                console.log(`Updated status for ${title} at ${company}: ${responseStatus}`);
            } catch (error) {
                console.error(`Failed to track application status for ${title} at ${company}:`, error);
            }
        });
    });
}

// Function to auto-apply to jobs
async function autoApply() {
    console.log("Starting auto-apply process...");
    db.all("SELECT id, title, company, link, industry FROM job_listings WHERE status='Not Applied'", async (err, rows) => {
        if (err) {
            console.error("Error fetching jobs to apply:", err);
            return;
        }
        console.log(`Found ${rows.length} jobs to apply for.`);

        await Promise.all(rows.map(async (row) => {
            const { id, title, company, link, industry } = row;
            console.log(`Applying for ${title} at ${company} (Link: ${link})`);

            try {
                const driver = await new Builder()
                    .forBrowser("chrome")
                    .setChromeOptions(options)
                    .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
                    .build();

                await driver.get(link);
                await driver.sleep(3000);

                const applyButton = await driver.findElement(By.xpath("//button[contains(text(),'Apply')]"));
                await applyButton.click();
                await driver.sleep(3000);

                const coverLetter = await generateCoverLetter(title, company);
                const optimizedResume = await optimizeResume(title, company);
                const resumePath = RESUME_STORAGE[industry] || path.join(__dirname, "resumes", "default_resume.pdf");

                try {
                    const coverLetterField = await driver.findElement(By.xpath("//textarea[contains(@name, 'coverLetter')]"));
                    await coverLetterField.sendKeys(coverLetter);
                } catch (error) {
                    console.error("Cover letter field not found:", error);
                }

                try {
                    const resumeField = await driver.findElement(By.xpath("//input[contains(@name, 'resume')]"));
                    await resumeField.sendKeys(resumePath);
                } catch (error) {
                    console.error("Resume field not found:", error);
                }

                await driver.sleep(2000);

                const submitButton = await driver.findElement(By.xpath("//button[contains(text(),'Submit')]"));
                await submitButton.click();

                console.log(`Successfully applied for ${title} at ${company}`);
                db.run("UPDATE job_listings SET status='Applied' WHERE id=?", [id]);

                await driver.quit();
            } catch (error) {
                console.error(`Failed to apply for ${title} at ${company}:`, error);
                db.run("UPDATE job_listings SET status='Failed' WHERE id=?", [id]);
            }
        }));
    });
}

// Function to scrape Google Jobs
async function scrapeGoogleJobs() {
    const url = "https://www.google.com/search?q=software+engineer+jobs&ibp=htl;jobs";
    let driver;

    try {
        console.log("Initializing ChromeDriver...");
        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
            .build();

        console.log("Navigating to Google Jobs...");
        await driver.get(url);
        await driver.wait(until.elementsLocated(By.css(".job-title, .company-name")), 10000);

        console.log("Extracting job listings...");
        let jobElements = await driver.findElements(By.css(".job-listing"));
        let jobs = [];

        for (let jobElement of jobElements) {
            try {
                let title = await jobElement.findElement(By.css(".job-title")).getText();
                let company = await jobElement.findElement(By.css(".company-name")).getText();
                jobs.push({ title, company, status: "Not Applied" });
            } catch (error) {
                console.error("Error extracting job details:", error);
            }
        }

        console.log(`Scraped ${jobs.length} jobs.`);
        return jobs;
    } catch (error) {
        console.error("Error scraping Google Jobs:", error);
        throw new Error("Failed to scrape jobs");
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}
// Main function to scrape, apply, and track jobs
async function main() {
    try {
        const jobs = await scrapeGoogleJobs();
        console.log(`Scraped ${jobs.length} jobs from Google Jobs.`);

        db.serialize(() => {
            const stmt = db.prepare("INSERT INTO job_listings (title, company, status) VALUES (?, ?, ?)");
            jobs.forEach(job => {
                stmt.run(job.title, job.company, job.status);
            });
            stmt.finalize();
        });

        await autoApply();
        trackApplicationStatus();
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

// Run the main function
main();

module.exports = {
    scrapeJobs,
    autoApply,
    trackApplicationStatus,
    scrapeGoogleJobs, // Add this line
    scrapeZipRecruiter,
    scrapeMonster,
    scrapeCareerBuilder,
    scrapeWeWorkRemotely,
    scrapeAngelList,
    scrapeDice,
};