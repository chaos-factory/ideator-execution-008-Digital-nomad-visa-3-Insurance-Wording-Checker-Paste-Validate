// Insurance Wording Checker - Client-side logic
class InsuranceChecker {
  constructor() {
    this.programs = [];
    this.checksRemaining = this.getChecksRemaining();
    this.currentProgram = null;
    this.init();
  }

  async init() {
    await this.loadPrograms();
    this.setupEventListeners();
    this.updateChecksDisplay();
  }

  async loadPrograms() {
    try {
      const response = await fetch('requirements.json');
      const data = await response.json();
      this.programs = data.programs;
      this.populateProgramSelector();
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  }

  populateProgramSelector() {
    const selector = document.getElementById('program-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Select a program...</option>';
    this.programs.forEach(program => {
      const option = document.createElement('option');
      option.value = program.id;
      option.textContent = `${program.name} (${program.country})`;
      selector.appendChild(option);
    });
  }

  setupEventListeners() {
    const checkButton = document.getElementById('check-wording-btn');
    const programSelector = document.getElementById('program-selector');
    const exportButton = document.getElementById('export-pdf-btn');

    if (checkButton) {
      checkButton.addEventListener('click', () => this.checkWording());
    }

    if (programSelector) {
      programSelector.addEventListener('change', (e) => {
        this.currentProgram = this.programs.find(p => p.id === e.target.value);
        this.clearResults();
      });
    }

    if (exportButton) {
      exportButton.addEventListener('click', () => this.exportPDF());
    }
  }

  getChecksRemaining() {
    const stored = localStorage.getItem('checksRemaining');
    if (stored === null) {
      localStorage.setItem('checksRemaining', '2');
      return 2;
    }
    return parseInt(stored, 10);
  }

  updateChecksDisplay() {
    const display = document.getElementById('checks-remaining');
    if (display) {
      display.textContent = this.checksRemaining;
    }

    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
      exportBtn.disabled = this.checksRemaining <= 0;
    }
  }

  decrementChecks() {
    if (this.checksRemaining > 0) {
      this.checksRemaining--;
      localStorage.setItem('checksRemaining', this.checksRemaining.toString());
      this.updateChecksDisplay();
    }
  }

  checkWording() {
    const textarea = document.getElementById('policy-text');
    const resultsContainer = document.getElementById('results-container');
    
    if (!textarea || !resultsContainer) return;

    const policyText = textarea.value.trim();

    // Validation
    if (!this.currentProgram) {
      this.showError('Please select a program first.');
      return;
    }

    if (!policyText) {
      this.showError('Please paste your insurance policy text.');
      return;
    }

    // Check if user has checks remaining
    if (this.checksRemaining <= 0) {
      this.showPaywall();
      return;
    }

    // Perform the check
    const results = this.validatePolicy(policyText, this.currentProgram);
    this.displayResults(results);
    this.decrementChecks();

    // Show paywall if no checks remaining
    if (this.checksRemaining <= 0) {
      setTimeout(() => this.showPaywall(), 1000);
    }
  }

  validatePolicy(policyText, program) {
    const results = {
      program: program.name,
      officialUrl: program.officialUrl,
      requiredPhrases: [],
      medicalLimit: null,
      prohibitedPhrases: [],
      overallPass: true
    };

    // Check required phrases
    program.requirements.requiredPhrases.forEach(req => {
      const regex = new RegExp(req.regex, 'gi');
      const found = regex.test(policyText);
      results.requiredPhrases.push({
        phrase: req.phrase,
        found: found,
        tooltip: req.tooltip
      });
      if (!found) results.overallPass = false;
    });

    // Check minimum medical limit
    const medReq = program.requirements.minMedicalLimit;
    const medRegex = new RegExp(medReq.regex, 'gi');
    const match = policyText.match(medRegex);
    
    results.medicalLimit = {
      required: `${medReq.currency} ${medReq.amount.toLocaleString()}`,
      found: match ? true : false,
      tooltip: medReq.tooltip
    };
    
    if (!match) results.overallPass = false;

    // Check prohibited phrases (these should NOT be present)
    program.requirements.prohibitedPhrases.forEach(req => {
      const regex = new RegExp(req.regex, 'gi');
      const found = regex.test(policyText);
      results.prohibitedPhrases.push({
        phrase: req.phrase,
        found: found,
        tooltip: req.tooltip
      });
      if (found) results.overallPass = false;
    });

    return results;
  }

  displayResults(results) {
    const container = document.getElementById('results-container');
    const liveRegion = document.getElementById('results-live-region');
    
    if (!container) return;

    container.innerHTML = '';
    container.className = 'results-container active';

    // Overall status
    const statusDiv = document.createElement('div');
    statusDiv.className = `overall-status ${results.overallPass ? 'pass' : 'fail'}`;
    statusDiv.innerHTML = `
      <h3>${results.overallPass ? '✓ Policy Meets Requirements' : '✗ Policy Does Not Meet Requirements'}</h3>
      <p>Program: ${results.program} <a href="${results.officialUrl}" target="_blank" rel="noopener">Official Requirements</a></p>
    `;
    container.appendChild(statusDiv);

    // Required phrases section
    const reqSection = document.createElement('div');
    reqSection.className = 'check-section';
    reqSection.innerHTML = '<h4>Required Phrases</h4>';
    
    results.requiredPhrases.forEach(item => {
      const itemDiv = this.createCheckItem(
        item.phrase,
        item.found,
        item.tooltip,
        item.found ? 'Found' : 'Missing'
      );
      reqSection.appendChild(itemDiv);
    });
    container.appendChild(reqSection);

    // Medical limit section
    const medSection = document.createElement('div');
    medSection.className = 'check-section';
    medSection.innerHTML = '<h4>Minimum Medical Coverage</h4>';
    
    const medItem = this.createCheckItem(
      `Minimum ${results.medicalLimit.required}`,
      results.medicalLimit.found,
      results.medicalLimit.tooltip,
      results.medicalLimit.found ? 'Verified' : 'Not Found'
    );
    medSection.appendChild(medItem);
    container.appendChild(medSection);

    // Prohibited phrases section
    if (results.prohibitedPhrases.length > 0) {
      const prohibSection = document.createElement('div');
      prohibSection.className = 'check-section';
      prohibSection.innerHTML = '<h4>Prohibited Phrases (must NOT appear)</h4>';
      
      results.prohibitedPhrases.forEach(item => {
        const itemDiv = this.createCheckItem(
          item.phrase,
          !item.found, // Inverted: it's good if NOT found
          item.tooltip,
          item.found ? 'Found (Issue)' : 'Not Found (Good)'
        );
        prohibSection.appendChild(itemDiv);
      });
      container.appendChild(prohibSection);
    }

    // Update ARIA live region
    if (liveRegion) {
      liveRegion.textContent = results.overallPass 
        ? 'Check complete. Policy meets all requirements.'
        : 'Check complete. Policy does not meet all requirements. Please review the items marked in red.';
    }

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  createCheckItem(label, passed, tooltip, statusText) {
    const div = document.createElement('div');
    div.className = `check-item ${passed ? 'pass' : 'fail'}`;
    
    const icon = passed ? '✓' : '✗';
    const statusClass = passed ? 'status-pass' : 'status-fail';
    
    div.innerHTML = `
      <span class="check-icon ${statusClass}">${icon}</span>
      <span class="check-label">${label}</span>
      <span class="check-status ${statusClass}">${statusText}</span>
      <button class="tooltip-btn" aria-label="More information" tabindex="0">
        <span class="tooltip-icon">?</span>
        <span class="tooltip-content">${tooltip}</span>
      </button>
    `;

    return div;
  }

  clearResults() {
    const container = document.getElementById('results-container');
    if (container) {
      container.innerHTML = '';
      container.className = 'results-container';
    }
  }

  showError(message) {
    const container = document.getElementById('results-container');
    if (container) {
      container.innerHTML = `<div class="error-message">${message}</div>`;
      container.className = 'results-container active';
    }
  }

  showPaywall() {
    const modal = document.getElementById('paywall-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  hidePaywall() {
    const modal = document.getElementById('paywall-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  exportPDF() {
    if (this.checksRemaining <= 0) {
      this.showPaywall();
      return;
    }
    
    // Stub: PDF export would be implemented in paid version
    alert('PDF export is available in the Premium version. Please upgrade to unlock this feature.');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.insuranceChecker = new InsuranceChecker();

  // Setup paywall modal close button
  const closePaywallBtn = document.getElementById('close-paywall');
  if (closePaywallBtn) {
    closePaywallBtn.addEventListener('click', () => {
      window.insuranceChecker.hidePaywall();
    });
  }

  // Setup upgrade button (stub)
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      alert('Upgrade functionality coming soon! This would redirect to payment processing.');
    });
  }

  // Tooltip accessibility - toggle on Enter/Space
  document.addEventListener('click', (e) => {
    if (e.target.closest('.tooltip-btn')) {
      e.target.closest('.tooltip-btn').classList.toggle('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.tooltip-btn')) {
      e.preventDefault();
      e.target.closest('.tooltip-btn').classList.toggle('active');
    }
  });
});
