document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const jobBoard = document.getElementById("jobBoard").value;

    let apiEndpoint;
    let requestBody = {}; // Default empty request body

    switch (jobBoard) {
        case "google":
            apiEndpoint = "/api/scrape-google-jobs";
            break;
        case "ziprecruiter":
            apiEndpoint = "/api/scrape-ziprecruiter";
            break;
        case "monster":
            apiEndpoint = "/api/scrape-monster";
            break;
        case "careerbuilder":
            apiEndpoint = "/api/scrape-careerbuilder";
            break;
        case "weworkremotely":
            apiEndpoint = "/api/scrape-weworkremotely";
            break;
        case "angellist":
            apiEndpoint = "/api/scrape-angellist";
            break;
        case "dice":
            apiEndpoint = "/api/scrape-dice";
            break;
        default:
            alert("Invalid job board selected");
            return;
    }

    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody), // Send the request body
        });

        if (!response.ok) {
            throw new Error("Failed to scrape jobs");
        }

        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to scrape jobs. Please try again.");
    }
});

// Function to display scraped jobs
function displayJobs(jobs) {
    const jobList = document.getElementById("jobList");
    jobList.innerHTML = ""; // Clear previous results

    if (jobs.length === 0) {
        jobList.innerHTML = "<li>No jobs found.</li>";
        return;
    }

    jobs.forEach((job) => {
        const li = document.createElement("li");
        li.textContent = `${job.title} - ${job.company} (${job.status})`;
        jobList.appendChild(li);
    });
}
// Rest of the code remains the same...