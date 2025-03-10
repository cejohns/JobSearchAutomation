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
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to scrape jobs");
        }

        const jobs = await response.json();
        displayJobs(jobs);
    } catch (error) {
        console.error("Error:", error);
        displayError(error.message);
    }
});

function displayJobs(response) {
    const jobList = document.getElementById("jobList");
    jobList.innerHTML = ""; // Clear previous results

    if (!response.success || !response.jobs || response.jobs.length === 0) {
        jobList.innerHTML = "<li>No jobs found.</li>";
        return;
    }

    response.jobs.forEach((job) => {
        const li = document.createElement("li");
        li.textContent = `${job.title} - ${job.company} (${job.status})`;
        jobList.appendChild(li);
    });
}

function displayError(message) {
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    } else {
        console.error("Error message element not found.");
    }
}