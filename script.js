async function run(url) {
  // Add "https://" if it's missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // Clear previous data
  document.getElementById("results").innerHTML = "";
  // Show the loader while waiting for the PageSpeed Insights API response
  document.getElementById("loader").style.display = "block";

  // Hide the previous screenshot
  const screenshot = document.getElementById("screenshot");
  screenshot.style.display = "none";

  const apiUrl = setUpQuery(url);
  const response = await fetch(apiUrl);
  const json = await response.json();

  // Hide the loader when the PageSpeed Insights API response is received
  document.getElementById("loader").style.display = "none";

  // See https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
  // to learn more about each of the properties in the response object.
  const cruxMetrics = {
    "First Contentful Paint": json.loadingExperience.metrics
      .FIRST_CONTENTFUL_PAINT_MS
      ? json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category
      : "N/A",
    "First Input Delay": json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS
      ? json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
      : "N/A",
  };
  const lighthouse = json.lighthouseResult;
  const lighthouseMetrics = {
    "First Contentful Paint": lighthouse.audits["first-contentful-paint"]
      ? lighthouse.audits["first-contentful-paint"].displayValue
      : "N/A",
    "Time To Interactive": lighthouse.audits["interactive"]
      ? lighthouse.audits["interactive"].displayValue
      : "N/A",
    "First Meaningful Paint": lighthouse.audits["first-meaningful-paint"]
      ? lighthouse.audits["first-meaningful-paint"].displayValue
      : "N/A",
    "First CPU Idle": lighthouse.audits["first-cpu-idle"]
      ? lighthouse.audits["first-cpu-idle"].displayValue
      : "N/A",
    "Estimated Input Latency": lighthouse.audits["estimated-input-latency"]
      ? lighthouse.audits["estimated-input-latency"].displayValue
      : "N/A",
  };
  displayResults(cruxMetrics, lighthouseMetrics);

  // Calculate the performance percentage
  const performanceMetrics = [
    lighthouseMetrics["First Contentful Paint"],
    lighthouseMetrics["Time To Interactive"],
    lighthouseMetrics["First Meaningful Paint"],
  ];

  // Request a screenshot of the website using Microlink API
  const screenshotUrl = `https://api.microlink.io/?url=${url}&screenshot=true&embed=screenshot.url`;
  await displayScreenshot(screenshotUrl);
}

function setUpQuery(url) {
  const apiKey = "AIzaSyBBAdR4o4286xcI2AUefXCjQzTVEj6EceA";
  const api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const parameters = {
    url: encodeURIComponent(url),
    key: apiKey,
  };
  let query = `${api}?`;
  for (key in parameters) {
    query += `${key}=${parameters[key]}&`;
  }
  return query;
}

function displayResults(cruxMetrics, lighthouseMetrics) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const cruxHeader = document.createElement("h2");
  cruxHeader.textContent = "Chrome User Experience Report Results";
  resultsDiv.appendChild(cruxHeader);
  for (key in cruxMetrics) {
    const p = document.createElement("p");
    p.textContent = `${key}: ${cruxMetrics[key]}`;
    resultsDiv.appendChild(p);
  }

  const lighthouseHeader = document.createElement("h2");
  lighthouseHeader.textContent = "Lighthouse Results";
  resultsDiv.appendChild(lighthouseHeader);
  for (key in lighthouseMetrics) {
    const p = document.createElement("p");
    p.textContent = `${key}: ${lighthouseMetrics[key]}`;
    resultsDiv.appendChild(p);
  }
}

async function displayScreenshot(screenshotUrl) {
  const screenshot = document.getElementById("screenshot");
  const response = await fetch(screenshotUrl);
  const blob = await response.blob();
  screenshot.src = URL.createObjectURL(blob);
  screenshot.style.display = "block";
}

const analyzeButton = document.getElementById("analyzeButton");
analyzeButton.addEventListener("click", function () {
  const urlInput = document.getElementById("urlInput");
  const url = urlInput.value;
  run(url);
});
