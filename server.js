const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const {
    scrapeJobs,
    autoApply,
    trackApplicationStatus,
    scrapeGoogleJobs,
    scrapeZipRecruiter,
    scrapeMonster,
    scrapeCareerBuilder,
    scrapeWeWorkRemotely,
    scrapeAngelList,
    scrapeDice,
} = require("./scraper");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// API Endpoints

// Scrape jobs from a given URL (optional, depending on the job board)
app.post("/api/scrape-jobs", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const jobs = await scrapeJobs(url);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape jobs" });
    }
});

/// Scrape Google Jobs (hardcoded URL)
app.post("/api/scrape-google-jobs", async (req, res) => {
    try {
        const jobs = await scrapeGoogleJobs(); // No URL needed (hardcoded in scraper)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape Google Jobs" });
    }
});

// Scrape ZipRecruiter (no URL required)
app.post("/api/scrape-ziprecruiter", async (req, res) => {
    try {
        const jobs = await scrapeZipRecruiter();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape ZipRecruiter" });
    }
});

// Scrape Monster (hardcoded URL)
app.post("/api/scrape-monster", async (req, res) => {
    try {
        const jobs = await scrapeMonster(); // No URL needed (hardcoded in scraper)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape Monster" });
    }
});

// Scrape CareerBuilder (hardcoded URL)
app.post("/api/scrape-careerbuilder", async (req, res) => {
    try {
        const jobs = await scrapeCareerBuilder(); // No URL needed (hardcoded in scraper)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape CareerBuilder" });
    }
});

// Scrape We Work Remotely (hardcoded URL)
app.post("/api/scrape-weworkremotely", async (req, res) => {
    try {
        const jobs = await scrapeWeWorkRemotely(); // No URL needed (hardcoded in scraper)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape We Work Remotely" });
    }
});

// Scrape AngelList (no URL required)
app.post("/api/scrape-angellist", async (req, res) => {
    try {
        const jobs = await scrapeAngelList();
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error scraping AngelList:", error);
        res.status(500).json({ error: "Failed to scrape AngelList" });
    }
});

// Scrape Dice (hardcoded URL)
app.post("/api/scrape-dice", async (req, res) => {
    try {
        const jobs = await scrapeDice(); // No URL needed (hardcoded in scraper)
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to scrape Dice" });
    }
});

// Start auto-apply process
app.post("/api/auto-apply", async (req, res) => {
    try {
        await autoApply();
        res.json({ message: "Auto-apply process started" });
    } catch (error) {
        res.status(500).json({ error: "Failed to start auto-apply process" });
    }
});

// Track application status
app.post("/api/track-status", async (req, res) => {
    try {
        await trackApplicationStatus();
        res.json({ message: "Application status tracking started" });
    } catch (error) {
        res.status(500).json({ error: "Failed to track application status" });
    }
});

// Serve the frontend (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});