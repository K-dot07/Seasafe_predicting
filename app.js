// SeaSafe Application JavaScript

// Application state - using variables instead of localStorage due to sandboxed environment
let currentView = 'dashboard';
let currentRouteData = null;
let analysisResults = null;

// Application data
const portsData = [
  { name: "Port of Los Angeles", code: "USLAX", country: "USA" },
  { name: "Port of Long Beach", code: "USLGB", country: "USA" },
  { name: "Port of New York", code: "USNYC", country: "USA" },
  { name: "Port of Miami", code: "USMIA", country: "USA" },
  { name: "Port of Rotterdam", code: "NLRTM", country: "Netherlands" },
  { name: "Port of Hamburg", code: "DEHAM", country: "Germany" },
  { name: "Port of Southampton", code: "GBSOU", country: "UK" },
  { name: "Port of Barcelona", code: "ESBCN", country: "Spain" },
  { name: "Port of Singapore", code: "SGSIN", country: "Singapore" },
  { name: "Port of Hong Kong", code: "HKHKG", country: "Hong Kong" }
];

const shipTypesData = [
  { name: "Cruise Ship", capacityRange: [1000, 6000], ageImpact: "high" },
  { name: "Ferry", capacityRange: [200, 2000], ageImpact: "medium" },
  { name: "Cargo Ship", capacityRange: [20, 100], ageImpact: "low" },
  { name: "Yacht", capacityRange: [10, 200], ageImpact: "high" }
];

const safetyRecommendations = {
  good: [
    "Optimal weather conditions expected",
    "Low risk maritime route", 
    "Recommended departure time"
  ],
  medium: [
    "Monitor weather updates closely",
    "Consider alternative departure dates", 
    "Ensure all safety equipment is operational"
  ],
  hard: [
    "Not recommended - severe weather expected",
    "Consider postponing travel",
    "If travel necessary, take extreme precautions"
  ]
};

// DOM Elements
let routeForm;
let loadingOverlay;
let navLinks;
let views;
let backToFormBtn;
let downloadReportBtn;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApplication();
});

function initializeApplication() {
  // Cache DOM elements
  routeForm = document.getElementById('route-form');
  loadingOverlay = document.getElementById('loading-overlay');
  navLinks = document.querySelectorAll('.nav-link');
  views = document.querySelectorAll('.view');
  backToFormBtn = document.getElementById('back-to-form');
  downloadReportBtn = document.getElementById('download-report');
  
  // Populate dropdowns
  populatePortDropdowns();
  populateShipTypeDropdown();
  
  // Set default date to tomorrow
  setDefaultDate();
  
  // Bind event listeners
  bindEventListeners();
  
  // Show initial view
  showView('dashboard');
}

function populatePortDropdowns() {
  const departureSelect = document.getElementById('departure-port');
  const destinationSelect = document.getElementById('destination-port');
  
  portsData.forEach(port => {
    const optionDep = document.createElement('option');
    optionDep.value = port.code;
    optionDep.textContent = `${port.name} (${port.country})`;
    departureSelect.appendChild(optionDep);
    
    const optionDest = document.createElement('option');
    optionDest.value = port.code;
    optionDest.textContent = `${port.name} (${port.country})`;
    destinationSelect.appendChild(optionDest);
  });
}

function populateShipTypeDropdown() {
  const shipTypeSelect = document.getElementById('ship-type');
  
  shipTypesData.forEach(shipType => {
    const option = document.createElement('option');
    option.value = shipType.name;
    option.textContent = shipType.name;
    shipTypeSelect.appendChild(option);
  });
}

function setDefaultDate() {
  const dateInput = document.getElementById('departure-date');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split('T')[0];
}

function bindEventListeners() {
  // Form submission
  if (routeForm) {
    routeForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Back to form button
  if (backToFormBtn) {
    backToFormBtn.addEventListener('click', () => showView('dashboard'));
  }
  
  // Download report button
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', handleDownloadReport);
  }
  
  // Ship type change to update capacity range
  const shipTypeSelect = document.getElementById('ship-type');
  if (shipTypeSelect) {
    shipTypeSelect.addEventListener('change', handleShipTypeChange);
  }
}

function handleNavigation(event) {
  event.preventDefault();
  const viewName = event.target.dataset.view;
  if (viewName) {
    showView(viewName);
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
  }
}

function showView(viewName) {
  currentView = viewName;
  
  // Hide all views
  views.forEach(view => view.classList.remove('active'));
  
  // Show selected view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
  }
}

function handleShipTypeChange(event) {
  const selectedType = event.target.value;
  const capacityInput = document.getElementById('ship-capacity');
  
  const shipType = shipTypesData.find(type => type.name === selectedType);
  if (shipType && capacityInput) {
    capacityInput.min = shipType.capacityRange[0];
    capacityInput.max = shipType.capacityRange[1];
    capacityInput.placeholder = `${shipType.capacityRange[0]} - ${shipType.capacityRange[1]} passengers`;
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // Collect form data
  currentRouteData = {
    departurePort: document.getElementById('departure-port').value,
    destinationPort: document.getElementById('destination-port').value,
    departureDate: document.getElementById('departure-date').value,
    shipType: document.getElementById('ship-type').value,
    shipCapacity: parseInt(document.getElementById('ship-capacity').value),
    shipAge: parseInt(document.getElementById('ship-age').value)
  };
  
  // Start analysis process
  startAnalysis();
}

function validateForm() {
  const form = routeForm;
  const inputs = form.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--color-error)';
      isValid = false;
    } else {
      input.style.borderColor = 'var(--color-border)';
    }
  });
  
  // Check if departure and destination are different
  const departure = document.getElementById('departure-port').value;
  const destination = document.getElementById('destination-port').value;
  
  if (departure === destination && departure !== '') {
    alert('Departure and destination ports must be different.');
    return false;
  }
  
  // Check if date is in the future
  const departureDate = new Date(document.getElementById('departure-date').value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (departureDate <= today) {
    alert('Departure date must be in the future.');
    return false;
  }
  
  return isValid;
}

function startAnalysis() {
  // Show loading overlay
  showLoading();
  
  // Simulate analysis process with realistic delays
  const loadingSteps = [
    { text: "Fetching weather data...", duration: 1500 },
    { text: "Running ML models...", duration: 2000 },
    { text: "Calculating risk factors...", duration: 1200 },
    { text: "Generating recommendations...", duration: 800 }
  ];
  
  let currentStep = 0;
  
  function processNextStep() {
    if (currentStep < loadingSteps.length) {
      const step = loadingSteps[currentStep];
      updateLoadingText(step.text);
      
      setTimeout(() => {
        currentStep++;
        processNextStep();
      }, step.duration);
    } else {
      // Analysis complete
      completeAnalysis();
    }
  }
  
  processNextStep();
}

function showLoading() {
  loadingOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function updateLoadingText(text) {
  const loadingText = document.getElementById('loading-text');
  if (loadingText) {
    loadingText.textContent = text;
  }
}

function completeAnalysis() {
  // Generate analysis results
  analysisResults = generateAnalysisResults(currentRouteData);
  
  // Hide loading
  hideLoading();
  
  // Populate results page
  populateResults();
  
  // Show results view
  showView('results');
  
  // Update nav to show results
  navLinks.forEach(link => link.classList.remove('active'));
}

function generateAnalysisResults(routeData) {
  // Generate realistic weather data
  const weather = generateWeatherData(routeData);
  
  // Calculate survival probability based on multiple factors
  const probability = calculateSurvivalProbability(routeData, weather);
  
  // Determine safety rating
  const safetyRating = determineSafetyRating(probability);
  
  // Generate alternative dates
  const alternativeDates = generateAlternativeDates(routeData.departureDate);
  
  return {
    weather,
    probability,
    safetyRating,
    alternativeDates,
    recommendations: safetyRecommendations[safetyRating.toLowerCase()]
  };
}

function generateWeatherData(routeData) {
  // Simulate weather based on route and date
  const baseConditions = {
    windSpeed: Math.random() * 40 + 5,
    waveHeight: Math.random() * 8 + 0.5,
    visibility: Math.random() * 15 + 5
  };
  
  // Add some route-specific variations
  if (routeData.departurePort.includes('US') && routeData.destinationPort.includes('EU')) {
    // Atlantic crossing - typically rougher
    baseConditions.windSpeed += 5;
    baseConditions.waveHeight += 1;
  }
  
  // Add seasonal variations
  const departureMonth = new Date(routeData.departureDate).getMonth();
  if (departureMonth >= 10 || departureMonth <= 2) {
    // Winter conditions - rougher
    baseConditions.windSpeed *= 1.3;
    baseConditions.waveHeight *= 1.4;
    baseConditions.visibility *= 0.8;
  }
  
  return {
    windSpeed: Math.round(baseConditions.windSpeed * 10) / 10,
    waveHeight: Math.round(baseConditions.waveHeight * 10) / 10,
    visibility: Math.round(baseConditions.visibility * 10) / 10
  };
}

function calculateSurvivalProbability(routeData, weather) {
  let baseProbability = 85; // Start with 85% base probability
  
  // Weather factors
  if (weather.windSpeed > 30) baseProbability -= 15;
  else if (weather.windSpeed > 20) baseProbability -= 8;
  else if (weather.windSpeed > 15) baseProbability -= 3;
  
  if (weather.waveHeight > 4) baseProbability -= 12;
  else if (weather.waveHeight > 2.5) baseProbability -= 6;
  
  if (weather.visibility < 5) baseProbability -= 10;
  else if (weather.visibility < 10) baseProbability -= 4;
  
  // Ship age factor
  if (routeData.shipAge > 20) baseProbability -= 8;
  else if (routeData.shipAge > 15) baseProbability -= 4;
  
  // Ship capacity factor (overcrowding risk)
  const shipType = shipTypesData.find(type => type.name === routeData.shipType);
  if (shipType && routeData.shipCapacity > shipType.capacityRange[1] * 0.9) {
    baseProbability -= 6;
  }
  
  // Ship type factor
  if (routeData.shipType === 'Yacht') baseProbability -= 5;
  else if (routeData.shipType === 'Ferry') baseProbability -= 2;
  
  // Ensure probability stays within reasonable bounds
  baseProbability = Math.max(45, Math.min(95, baseProbability));
  
  // Add some randomness for variety
  baseProbability += (Math.random() - 0.5) * 6;
  
  return Math.round(Math.max(45, Math.min(95, baseProbability)));
}

function determineSafetyRating(probability) {
  if (probability >= 85) return 'Good';
  if (probability >= 60) return 'Medium';
  return 'Hard';
}

function generateAlternativeDates(originalDate) {
  const alternatives = [];
  const baseDate = new Date(originalDate);
  
  for (let i = 1; i <= 4; i++) {
    const altDate = new Date(baseDate);
    altDate.setDate(baseDate.getDate() + i);
    
    // Generate slightly different conditions for alternative dates
    const altProbability = Math.round(Math.random() * 30 + 65); // 65-95%
    const altRating = determineSafetyRating(altProbability);
    
    alternatives.push({
      date: altDate.toISOString().split('T')[0],
      dateFormatted: altDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      probability: altProbability,
      rating: altRating
    });
  }
  
  return alternatives;
}

function populateResults() {
  if (!analysisResults || !currentRouteData) return;
  
  // Populate route summary
  populateRouteSummary();
  
  // Populate safety rating
  populateSafetyRating();
  
  // Populate weather conditions
  populateWeatherConditions();
  
  // Create risk factors chart
  createRiskFactorsChart();
  
  // Populate recommendations
  populateRecommendations();
  
  // Populate alternative dates
  populateAlternativeDates();
}

function populateRouteSummary() {
  const departurePort = portsData.find(p => p.code === currentRouteData.departurePort);
  const destinationPort = portsData.find(p => p.code === currentRouteData.destinationPort);
  
  document.getElementById('result-departure').textContent = 
    departurePort ? `${departurePort.name} (${departurePort.country})` : currentRouteData.departurePort;
  
  document.getElementById('result-destination').textContent = 
    destinationPort ? `${destinationPort.name} (${destinationPort.country})` : currentRouteData.destinationPort;
  
  const date = new Date(currentRouteData.departureDate);
  document.getElementById('result-date').textContent = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  document.getElementById('result-vessel').textContent = 
    `${currentRouteData.shipType} (${currentRouteData.shipCapacity} passengers, ${currentRouteData.shipAge} years old)`;
}

function populateSafetyRating() {
  const ratingCircle = document.getElementById('rating-circle');
  const ratingPercentage = document.getElementById('rating-percentage');
  const safetyStatus = document.getElementById('safety-status');
  const ratingDescription = document.getElementById('rating-description');
  
  // Update percentage
  ratingPercentage.textContent = `${analysisResults.probability}%`;
  
  // Update status
  const rating = analysisResults.safetyRating.toLowerCase();
  safetyStatus.textContent = analysisResults.safetyRating;
  safetyStatus.className = `status ${rating}`;
  
  // Update circle color
  ratingCircle.className = `rating-circle ${rating}`;
  
  // Update description
  const descriptions = {
    good: "Optimal conditions for safe maritime travel",
    medium: "Moderate risk - extra precautions recommended", 
    hard: "High risk conditions - consider postponing travel"
  };
  
  ratingDescription.textContent = descriptions[rating];
}

function populateWeatherConditions() {
  document.getElementById('wind-speed').textContent = `${analysisResults.weather.windSpeed} km/h`;
  document.getElementById('wave-height').textContent = `${analysisResults.weather.waveHeight} m`;
  document.getElementById('visibility').textContent = `${analysisResults.weather.visibility} km`;
}

function createRiskFactorsChart() {
  const ctx = document.getElementById('risk-chart').getContext('2d');
  
  // Calculate risk factor scores based on current conditions
  const riskFactors = {
    'Weather Conditions': Math.max(20, 100 - analysisResults.probability + Math.random() * 20),
    'Vessel Age': Math.min(80, currentRouteData.shipAge * 1.5 + Math.random() * 15),
    'Route Difficulty': Math.random() * 40 + 30,
    'Seasonal Factors': Math.random() * 35 + 25,
    'Capacity Load': Math.min(70, (currentRouteData.shipCapacity / 3000) * 50 + Math.random() * 20)
  };
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(riskFactors),
      datasets: [{
        label: 'Risk Level',
        data: Object.values(riskFactors),
        fill: true,
        backgroundColor: 'rgba(33, 128, 141, 0.2)',
        borderColor: 'rgba(33, 128, 141, 1)',
        pointBackgroundColor: 'rgba(33, 128, 141, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(33, 128, 141, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
          borderWidth: 3
        }
      },
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          pointLabels: {
            font: {
              size: 12
            }
          },
          ticks: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function populateRecommendations() {
  const recommendationsList = document.getElementById('recommendations-list');
  recommendationsList.innerHTML = '';
  
  analysisResults.recommendations.forEach(rec => {
    const item = document.createElement('div');
    item.className = 'recommendation-item';
    
    const icon = document.createElement('span');
    icon.className = 'recommendation-icon';
    icon.textContent = '✓';
    
    const text = document.createElement('span');
    text.textContent = rec;
    
    item.appendChild(icon);
    item.appendChild(text);
    recommendationsList.appendChild(item);
  });
}

function populateAlternativeDates() {
  const alternativeDatesContainer = document.getElementById('alternative-dates');
  alternativeDatesContainer.innerHTML = '';
  
  analysisResults.alternativeDates.forEach(alt => {
    const dateOption = document.createElement('div');
    dateOption.className = 'date-option';
    
    const dateEl = document.createElement('div');
    dateEl.className = 'date-option-date';
    dateEl.textContent = alt.dateFormatted;
    
    const ratingEl = document.createElement('div');
    ratingEl.className = `date-option-rating status ${alt.rating.toLowerCase()}`;
    ratingEl.textContent = `${alt.rating} (${alt.probability}%)`;
    
    dateOption.appendChild(dateEl);
    dateOption.appendChild(ratingEl);
    alternativeDatesContainer.appendChild(dateOption);
  });
}

function handleDownloadReport() {
  if (!analysisResults || !currentRouteData) {
    alert('No analysis data available for download.');
    return;
  }
  
  // Create downloadable report content
  const reportContent = generateReportContent();
  
  // Create and download file
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SeaSafe-Safety-Report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateReportContent() {
  const departurePort = portsData.find(p => p.code === currentRouteData.departurePort);
  const destinationPort = portsData.find(p => p.code === currentRouteData.destinationPort);
  
  return `
=== SEASAFE MARITIME SAFETY REPORT ===
Generated: ${new Date().toLocaleString()}

ROUTE DETAILS:
Departure: ${departurePort ? departurePort.name : currentRouteData.departurePort}
Destination: ${destinationPort ? destinationPort.name : currentRouteData.destinationPort}
Departure Date: ${new Date(currentRouteData.departureDate).toLocaleDateString()}
Vessel: ${currentRouteData.shipType}
Capacity: ${currentRouteData.shipCapacity} passengers
Vessel Age: ${currentRouteData.shipAge} years

SAFETY ASSESSMENT:
Survival Probability: ${analysisResults.probability}%
Safety Rating: ${analysisResults.safetyRating}

WEATHER CONDITIONS:
Wind Speed: ${analysisResults.weather.windSpeed} km/h
Wave Height: ${analysisResults.weather.waveHeight} m
Visibility: ${analysisResults.weather.visibility} km

RECOMMENDATIONS:
${analysisResults.recommendations.map(rec => `• ${rec}`).join('\n')}

ALTERNATIVE DATES:
${analysisResults.alternativeDates.map(alt => `${alt.dateFormatted}: ${alt.rating} (${alt.probability}%)`).join('\n')}

DISCLAIMER:
This report is generated using statistical models and should not be the sole factor in maritime safety decisions. Always consult official weather services and maritime authorities.

--- End of Report ---
  `.trim();
}

// Utility functions for responsive behavior
function handleResize() {
  // Handle any responsive adjustments if needed
  if (window.innerWidth <= 768) {
    // Mobile adjustments
    document.body.classList.add('mobile-view');
  } else {
    document.body.classList.remove('mobile-view');
  }
}

// Add resize listener
window.addEventListener('resize', handleResize);

// Initial resize check
handleResize();

// Export functions for potential external use
window.SeaSafe = {
  showView,
  generateAnalysisResults,
  calculateSurvivalProbability
};