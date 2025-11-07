/* =================================================================
   ANOVATOR ROI CALCULATOR - JAVASCRIPT
   Easy to modify configuration at the top
   ================================================================= */

/* =================================================================
   CONFIGURATION - MODIFY THESE VALUES FOR YOUR NEEDS
   ================================================================= */

const CONFIG = {
  // Device prices (easily modifiable)
  devicePrices: {
    2500: 'M0 - 2 500€ (Studio budget)',
    4500: 'M1 - 4 500€ (Studio premium)',
    10000: 'M3 - 10 000€ (Professionnel médical)',
    12000: 'A5 - 12 000€ (Premium scan 3D)'
  },
  
  // Default values
  defaults: {
    clients: 200,
    monthlyPrice: 45,
    potentialIncrease: 10,
    devicePrice: 4500,
    financingMonths: 36
  },
  
  // Calculation multipliers (adjust if needed)
  multipliers: {
    monthsInYear: 12,
    roiPeriodYears: 2
  },
  
  // ROI assessment thresholds (in months)
  thresholds: {
    excellent: 6,
    good: 12
  },
  
  // Animation settings
  animation: {
    countUpDuration: 1000, // milliseconds
    updateDelay: 300 // milliseconds before recalculating
  }
};

/* =================================================================
   STATE MANAGEMENT (In-memory storage)
   ================================================================= */

let calculatorState = {
  structureType: '',
  clientCount: CONFIG.defaults.clients,
  monthlyPrice: CONFIG.defaults.monthlyPrice,
  potentialIncrease: CONFIG.defaults.potentialIncrease,
  devicePrice: CONFIG.defaults.devicePrice,
  customPrice: 0
};

let updateTimeout = null;

/* =================================================================
   INITIALIZATION
   ================================================================= */

document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  updateSliderValue();
  calculateROI();
});

function initializeEventListeners() {
  // Structure type
  const structureType = document.getElementById('structureType');
  if (structureType) {
    structureType.addEventListener('change', function() {
      calculatorState.structureType = this.value;
      debouncedCalculate();
    });
  }
  
  // Client count
  const clientCount = document.getElementById('clientCount');
  if (clientCount) {
    clientCount.addEventListener('input', function() {
      calculatorState.clientCount = parseFloat(this.value) || 0;
      debouncedCalculate();
    });
  }
  
  // Monthly price
  const monthlyPrice = document.getElementById('monthlyPrice');
  if (monthlyPrice) {
    monthlyPrice.addEventListener('input', function() {
      calculatorState.monthlyPrice = parseFloat(this.value) || 0;
      debouncedCalculate();
    });
  }
  
  // Potential increase slider
  const potentialIncrease = document.getElementById('potentialIncrease');
  if (potentialIncrease) {
    potentialIncrease.addEventListener('input', function() {
      calculatorState.potentialIncrease = parseFloat(this.value) || 0;
      updateSliderValue();
      debouncedCalculate();
    });
  }
  
  // Device price dropdown
  const devicePrice = document.getElementById('devicePrice');
  if (devicePrice) {
    devicePrice.addEventListener('change', function() {
      const customPriceGroup = document.getElementById('customPriceGroup');
      
      if (this.value === 'custom') {
        customPriceGroup.style.display = 'block';
        const customPriceInput = document.getElementById('customPrice');
        calculatorState.devicePrice = parseFloat(customPriceInput.value) || 0;
      } else {
        customPriceGroup.style.display = 'none';
        calculatorState.devicePrice = parseFloat(this.value) || 0;
      }
      
      debouncedCalculate();
    });
  }
  
  // Custom price input
  const customPrice = document.getElementById('customPrice');
  if (customPrice) {
    customPrice.addEventListener('input', function() {
      calculatorState.customPrice = parseFloat(this.value) || 0;
      calculatorState.devicePrice = calculatorState.customPrice;
      debouncedCalculate();
    });
  }
}

/* =================================================================
   CALCULATION FUNCTIONS
   ================================================================= */

function debouncedCalculate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    calculateROI();
  }, CONFIG.animation.updateDelay);
}

function calculateROI() {
  const { clientCount, potentialIncrease, devicePrice } = calculatorState;
  
  // Validate inputs
  if (clientCount <= 0 || potentialIncrease <= 0 || devicePrice <= 0) {
    displayResults({
      monthlyRevenue: 0,
      yearlyRevenue: 0,
      paybackMonths: 0,
      roi2Years: 0,
      roi2YearsAmount: 0,
      monthlyFinancing: 0
    });
    return;
  }
  
  // Perform calculations
  const monthlyRevenue = clientCount * potentialIncrease;
  const yearlyRevenue = monthlyRevenue * CONFIG.multipliers.monthsInYear;
  const paybackMonths = devicePrice / monthlyRevenue;
  const totalRevenue2Years = yearlyRevenue * CONFIG.multipliers.roiPeriodYears;
  const netProfit2Years = totalRevenue2Years - devicePrice;
  const roi2Years = (netProfit2Years / devicePrice) * 100;
  const monthlyFinancing = devicePrice / CONFIG.defaults.financingMonths;
  
  // Display results with animation
  displayResults({
    monthlyRevenue: monthlyRevenue,
    yearlyRevenue: yearlyRevenue,
    paybackMonths: paybackMonths,
    roi2Years: roi2Years,
    roi2YearsAmount: netProfit2Years,
    monthlyFinancing: monthlyFinancing
  });
}

function displayResults(results) {
  // Monthly Revenue
  animateValue('monthlyRevenue', 0, results.monthlyRevenue, CONFIG.animation.countUpDuration, true);
  
  // Yearly Revenue
  animateValue('yearlyRevenue', 0, results.yearlyRevenue, CONFIG.animation.countUpDuration, true);
  
  // Payback Period
  displayPaybackPeriod(results.paybackMonths);
  
  // ROI 2 Years
  animateValue('roi2Years', 0, results.roi2Years, CONFIG.animation.countUpDuration, false, '%');
  const roi2YearsAmount = document.getElementById('roi2YearsAmount');
  if (roi2YearsAmount) {
    roi2YearsAmount.textContent = `Gain net: ${formatCurrency(results.roi2YearsAmount)}`;
  }
  
  // Monthly Financing
  animateValue('monthlyFinancing', 0, results.monthlyFinancing, CONFIG.animation.countUpDuration, true);
  const financingComparison = document.getElementById('financingComparison');
  if (financingComparison) {
    const comparison = results.monthlyRevenue - results.monthlyFinancing;
    if (comparison > 0) {
      financingComparison.textContent = `Sur 36 mois - Reste ${formatCurrency(comparison)}/mois`;
    } else {
      financingComparison.textContent = 'Sur 36 mois';
    }
  }
}

function displayPaybackPeriod(months) {
  const paybackElement = document.getElementById('paybackPeriod');
  const paybackProgress = document.getElementById('paybackProgress');
  const paybackAssessment = document.getElementById('paybackAssessment');
  const paybackIcon = document.getElementById('paybackIcon');
  const paybackValue = document.querySelector('#paybackPeriod').closest('.result-card').querySelector('.card-value');
  
  if (!paybackElement || !paybackProgress || !paybackAssessment) return;
  
  // Animate the months value
  animateValue('paybackPeriod', 0, months, CONFIG.animation.countUpDuration, false, ' mois');
  
  // Calculate progress bar width (max 24 months = 100%)
  const progressPercent = Math.min((months / 24) * 100, 100);
  paybackProgress.style.width = progressPercent + '%';
  
  // Color coding and assessment
  if (months <= CONFIG.thresholds.excellent) {
    paybackProgress.classList.remove('warning', 'danger');
    paybackValue.classList.remove('warning', 'danger');
    paybackValue.classList.add('green');
    paybackAssessment.textContent = '✅ Excellent investissement';
    paybackAssessment.style.color = 'var(--color-success)';
  } else if (months <= CONFIG.thresholds.good) {
    paybackProgress.classList.add('warning');
    paybackProgress.classList.remove('danger');
    paybackValue.classList.remove('green', 'danger');
    paybackValue.classList.add('warning');
    paybackAssessment.textContent = '✓ Bon investissement';
    paybackAssessment.style.color = 'var(--color-warning)';
  } else {
    paybackProgress.classList.add('danger');
    paybackProgress.classList.remove('warning');
    paybackValue.classList.remove('green', 'warning');
    paybackValue.classList.add('danger');
    paybackAssessment.textContent = '⚠️ À étudier selon votre situation';
    paybackAssessment.style.color = 'var(--color-danger)';
  }
}

/* =================================================================
   ANIMATION & FORMATTING FUNCTIONS
   ================================================================= */

function animateValue(elementId, start, end, duration, isCurrency = false, suffix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const startTime = performance.now();
  const endValue = Math.round(end * 100) / 100; // Round to 2 decimals
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (endValue - start) * easeOut;
    
    if (isCurrency) {
      element.textContent = formatCurrency(current);
    } else {
      const rounded = Math.round(current * 10) / 10; // One decimal for percentages/months
      element.textContent = rounded + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Ensure final value is exact
      if (isCurrency) {
        element.textContent = formatCurrency(endValue);
      } else {
        const rounded = Math.round(endValue * 10) / 10;
        element.textContent = rounded + suffix;
      }
    }
  }
  
  requestAnimationFrame(update);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function updateSliderValue() {
  const slider = document.getElementById('potentialIncrease');
  const sliderValue = document.getElementById('sliderValue');
  
  if (slider && sliderValue) {
    sliderValue.textContent = slider.value;
  }
}

/* =================================================================
   FORM HANDLING
   ================================================================= */

function scrollToForm() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get form values
  const firstName = document.getElementById('firstName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const acceptInfo = document.getElementById('acceptInfo').checked;
  
  // Validate
  if (!firstName || !email || !acceptInfo) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return false;
  }
  
  // Store submission data in memory
  const submissionData = {
    firstName: firstName,
    email: email,
    phone: phone,
    acceptInfo: acceptInfo,
    calculatorData: calculatorState,
    timestamp: new Date().toISOString()
  };
  
  // In a real application, you would send this data to a server
  console.log('Form submission data:', submissionData);
  
  // Show success message
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('successMessage');
  
  if (form && successMessage) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  return false;
}

/* =================================================================
   UTILITY FUNCTIONS
   ================================================================= */

// Function to reset calculator (useful for testing)
function resetCalculator() {
  calculatorState = {
    structureType: '',
    clientCount: CONFIG.defaults.clients,
    monthlyPrice: CONFIG.defaults.monthlyPrice,
    potentialIncrease: CONFIG.defaults.potentialIncrease,
    devicePrice: CONFIG.defaults.devicePrice,
    customPrice: 0
  };
  
  // Reset form inputs
  document.getElementById('structureType').value = '';
  document.getElementById('clientCount').value = CONFIG.defaults.clients;
  document.getElementById('monthlyPrice').value = CONFIG.defaults.monthlyPrice;
  document.getElementById('potentialIncrease').value = CONFIG.defaults.potentialIncrease;
  document.getElementById('devicePrice').value = CONFIG.defaults.devicePrice;
  
  // Recalculate
  calculateROI();
}

// Export functions for potential external use (e.g., analytics, testing)
window.AnovatorCalculator = {
  getState: () => calculatorState,
  reset: resetCalculator,
  calculate: calculateROI,
  config: CONFIG
};

/* =================================================================
   DEBUGGING & DEVELOPMENT HELPERS
   ================================================================= */

// Console log for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Anovator ROI Calculator loaded');
  console.log('Configuration:', CONFIG);
  console.log('Access calculator via: window.AnovatorCalculator');
}