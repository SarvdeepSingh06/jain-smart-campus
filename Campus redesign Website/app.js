// ========================================================
// JAIN SMART CAMPUS — FRONTEND APPLICATION ENGINE
// ========================================================

// Storage Keys
const KEY_MAINT = 'jain_maintenance_v2';
const KEY_LOST = 'jain_lostfound_v2';
const KEY_THEME = 'jain_theme';

// Local Storage Helpers
const getStore = (k) => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null');
  } catch {
    return null;
  }
};

const setStore = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (err) {
    console.warn('Storage write failed:', err);
  }
};

// Initial Sample Data (Preserves user additions, seeds if empty)
function initSampleData() {
  if (!getStore(KEY_MAINT)) {
    const sampleMaint = [
      { id: 'FIX-8A2F1', location: 'Classroom Block A', room: 'Room A-204, 2nd Floor', issue: 'Projector / AV Cable', urgency: 'Medium', desc: 'HDMI input port loose on classroom podium in Room A-204', status: 'In Progress', created: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'FIX-3B9X4', location: 'Library', room: '1st Floor Study Hall, Desk 12', issue: 'Switch / Plug Socket', urgency: 'Standard', desc: 'Dual desk plug socket at Study Desk 12 has no electrical power', status: 'Reported', created: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'FIX-9K4L2', location: 'Lab Complex', room: 'Computer Lab 3, 3rd Floor', issue: 'Fan / Ventilation', urgency: 'Low', desc: 'Ceiling ventilation fan vibrating at high speed', status: 'Fixed', created: new Date(Date.now() - 3600000 * 48).toISOString() }
    ];
    setStore(KEY_MAINT, sampleMaint);
  }

  if (!getStore(KEY_LOST)) {
    const sampleLost = [
      { id: 'LOST-LF102', type: 'I LOST SOMETHING', category: 'Electronics', location: 'Library 2nd Floor Reading Table', contact: 'ananya.s@jainuniversity.ac.in', date: new Date(Date.now() - 3600000 * 12).toISOString(), desc: 'Blue Sony Wireless Earbuds case with cat sticker on lid', created: new Date(Date.now() - 3600000 * 12).toISOString() },
      { id: 'FND-LF105', type: 'I FOUND SOMETHING', category: 'Keys', location: 'Cafeteria Main Hall Counter', handover: 'Campus Security Office (Main Gate)', contact: '', date: new Date(Date.now() - 3600000 * 3).toISOString(), desc: 'Keychain with 3 silver keys and a brass braided lanyard', created: new Date(Date.now() - 3600000 * 3).toISOString() }
    ];
    setStore(KEY_LOST, sampleLost);
  }
}

// Toast Notifications
function toast(msg, icon = '✓') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span style="font-weight:700;">${icon}</span> <span>${msg}</span>`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

// Unique Reference Identifier Generator
function generateUniqueId(type) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let prefix = 'JAIN';
  if (type === 'lost') prefix = 'LOST';
  else if (type === 'found') prefix = 'FND';
  else if (type === 'maint') prefix = 'FIX';

  const existingMaint = (getStore(KEY_MAINT) || []).map(x => x.id);
  const existingLost = (getStore(KEY_LOST) || []).map(x => x.id);
  const existingIds = new Set([...existingMaint, ...existingLost]);

  let id;
  let attempts = 0;
  do {
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    id = `${prefix}-${rand}`;
    attempts++;
  } while (existingIds.has(id) && attempts < 100);

  return id;
}

// ========================================================
// VIEW NAVIGATION & ROUTING
// ========================================================
let activeViewId = 'viewHome';

function showView(targetViewId, options = {}) {
  const views = [
    'viewHome',
    'viewInsights',
    'viewInformation',
    'viewLostChoice',
    'viewLostForm',
    'viewMaintForm',
    'viewConfirmation'
  ];

  views.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === targetViewId) {
      el.style.display = 'block';
      void el.offsetHeight;
      el.classList.add('active');
    } else {
      el.classList.remove('active');
      el.style.display = 'none';
    }
  });

  activeViewId = targetViewId;

  // Update Nav links active state
  const navMap = {
    viewHome: ['navHomeBtn', 'mobNavHome'],
    viewInsights: ['navInsightsBtn', 'mobNavInsights'],
    viewInformation: ['navInfoBtn', 'mobNavInfo']
  };

  ['navHomeBtn', 'mobNavHome', 'navInsightsBtn', 'mobNavInsights', 'navInfoBtn', 'mobNavInfo'].forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.remove('active');
  });

  if (navMap[targetViewId]) {
    navMap[targetViewId].forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add('active');
    });
  }

  // Update URL hash
  if (targetViewId === 'viewHome') {
    history.replaceState(null, '', '#home');
  } else if (targetViewId === 'viewInsights') {
    history.replaceState(null, '', '#insights');
    renderInsights();
  } else if (targetViewId === 'viewInformation') {
    history.replaceState(null, '', '#information');
  }

  // Viewport scroll behavior
  window.scrollTo({ top: 0, behavior: 'auto' });

  // Trigger scroll reveals for the newly visible view
  if (typeof initScrollReveals === 'function') {
    initScrollReveals(targetViewId);
  }

  // Focus interactive field if requested
  if (options.focus) {
    setTimeout(() => {
      const container = document.getElementById(targetViewId);
      if (!container) return;
      const firstInput = container.querySelector('select:not([type="hidden"]):not([style*="display: none"]), input:not([type="hidden"]):not([style*="display: none"]), textarea');
      if (firstInput) {
        firstInput.focus({ preventScroll: true });
      }
    }, 120);
  }
}

// Mobile Menu Toggle
function toggleMobileMenu(forceState) {
  const drawer = document.getElementById('mobileNavDrawer');
  if (!drawer) return;
  const isCurrentlyOpen = drawer.style.display !== 'none';
  const shouldOpen = forceState !== undefined ? forceState : !isCurrentlyOpen;
  drawer.style.display = shouldOpen ? 'flex' : 'none';
}

// File Upload Selection Handler
function handleFileSelect(input, previewId) {
  const previewEl = document.getElementById(previewId);
  if (!previewEl) return;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    previewEl.textContent = `${file.name} (${sizeMb} MB)`;
    previewEl.style.color = 'var(--text-main)';
    previewEl.style.fontWeight = '500';
  } else {
    previewEl.textContent = 'No file selected';
    previewEl.style.color = 'var(--text-secondary)';
    previewEl.style.fontWeight = '400';
  }
}

// ========================================================
// REPORTING FLOW HANDLERS
// ========================================================

function openLostSelection() {
  showView('viewLostChoice');
}

function openLostForm(mode) {
  const isLost = mode === 'lost';
  const typeValue = isLost ? 'I LOST SOMETHING' : 'I FOUND SOMETHING';

  const typeSelect = document.getElementById('lType');
  if (typeSelect) {
    typeSelect.value = typeValue;
  }

  const dateInput = document.getElementById('lDate');
  if (dateInput && !dateInput.value) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);
  }

  updateLostFormLabels(typeValue);
  showView('viewLostForm', { focus: true });
}

function setLostType(typeValue) {
  const typeSelect = document.getElementById('lType');
  if (typeSelect) {
    typeSelect.value = typeValue;
  }
  updateLostFormLabels(typeValue);
}

function updateLostFormLabels(typeValue) {
  const isLost = typeValue === 'I LOST SOMETHING';

  const badgeEl = document.getElementById('lostFormBadge');
  const titleEl = document.getElementById('lostFormTitle');
  const subtitleEl = document.getElementById('lostFormSubtitle');
  const submitBtn = document.getElementById('lostSubmitBtn');

  const locLabel = document.getElementById('lLocationLabel');
  const locInput = document.getElementById('lLocation');
  const dateLabel = document.getElementById('lDateLabel');
  const descLabel = document.getElementById('lDescLabel');
  const descInput = document.getElementById('lDesc');
  const photoHelper = document.getElementById('lPhotoHelper');

  const lostFields = document.getElementById('lostSpecificFields');
  const foundFields = document.getElementById('foundSpecificFields');
  const contactInput = document.getElementById('lContact');

  const segLost = document.getElementById('segLost');
  const segFound = document.getElementById('segFound');

  if (isLost) {
    if (badgeEl) badgeEl.textContent = 'Lost Item Report';
    if (titleEl) titleEl.textContent = 'Report a lost belonging';
    if (subtitleEl) subtitleEl.textContent = 'Provide details to help campus security cross-reference your item.';
    if (submitBtn) submitBtn.textContent = 'Submit Lost Item Report';

    if (locLabel) locLabel.textContent = 'Where was it last seen?';
    if (locInput) locInput.placeholder = 'e.g. Library 2nd Floor, Cafeteria Table 4, Block A...';
    if (dateLabel) dateLabel.textContent = 'Date & approximate time last seen';
    if (descLabel) descLabel.textContent = 'Description & Identifying Features';
    if (descInput) descInput.placeholder = 'Describe identifying features such as brand, color, stickers, scratches, case, or distinct markings...';
    if (photoHelper) photoHelper.textContent = 'Upload a photo of your item or similar reference model if available.';

    if (lostFields) lostFields.style.display = 'block';
    if (foundFields) foundFields.style.display = 'none';
    if (contactInput) contactInput.required = true;
  } else {
    if (badgeEl) badgeEl.textContent = 'Found Item Report';
    if (titleEl) titleEl.textContent = 'Report a found belonging';
    if (subtitleEl) subtitleEl.textContent = 'Provide details to help reunite this found item with its rightful owner.';
    if (submitBtn) submitBtn.textContent = 'Submit Found Item Report';

    if (locLabel) locLabel.textContent = 'Where did you find it?';
    if (locInput) locInput.placeholder = 'e.g. Classroom 102 under desk, Library stairs, Gym reception...';
    if (dateLabel) dateLabel.textContent = 'Date & approximate time found';
    if (descLabel) descLabel.textContent = 'Visible Item Description';
    if (descInput) descInput.placeholder = 'Describe general visual appearance without disclosing confidential serials or hidden marks...';
    if (photoHelper) photoHelper.textContent = 'Upload a clear photo of the found item.';

    if (lostFields) lostFields.style.display = 'none';
    if (foundFields) foundFields.style.display = 'block';
    if (contactInput) contactInput.required = false;
  }

  if (segLost && segFound) {
    if (isLost) {
      segLost.classList.add('active');
      segFound.classList.remove('active');
    } else {
      segFound.classList.add('active');
      segLost.classList.remove('active');
    }
  }
}

function openMaintenance() {
  showView('viewMaintForm', { focus: true });
}

function openForm(type) {
  if (type === 'maintenance') {
    openMaintenance();
  } else if (type === 'lost') {
    openLostSelection();
  }
}

function closeForms() {
  showView('viewHome');
}

// Submission Guard
let isSubmitting = false;

// Form Submission Handlers
function submitMaintenance(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const submitBtn = document.getElementById('maintSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.textContent = 'Saving report...';
  }
  isSubmitting = true;

  try {
    const list = getStore(KEY_MAINT) || [];
    const locationEl = document.getElementById('mLocation');
    const roomEl = document.getElementById('mRoom');
    const issueEl = document.getElementById('mIssue');
    const urgencyEl = document.getElementById('mUrgency');
    const descEl = document.getElementById('mDesc');
    const photoEl = document.getElementById('mPhoto');

    const location = locationEl ? locationEl.value : '';
    const room = roomEl ? roomEl.value.trim() : '';
    const issue = issueEl ? issueEl.value : '';
    const urgency = urgencyEl ? urgencyEl.value : 'Standard';
    const desc = descEl ? descEl.value.trim() : '';
    const photoName = photoEl && photoEl.files && photoEl.files[0] ? photoEl.files[0].name : null;

    if (!location || !issue) {
      if (!location && locationEl) {
        locationEl.classList.add('input-invalid');
        locationEl.addEventListener('input', () => locationEl.classList.remove('input-invalid'), { once: true });
        locationEl.focus();
      } else if (!issue && issueEl) {
        issueEl.classList.add('input-invalid');
        issueEl.addEventListener('input', () => issueEl.classList.remove('input-invalid'), { once: true });
        issueEl.focus();
      }
      toast('Please fill in all required fields.', '⚠️');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = 'Submit Maintenance Request';
      }
      isSubmitting = false;
      return;
    }

    const newId = generateUniqueId('maint');
    const item = {
      id: newId,
      location,
      room,
      issue,
      urgency,
      desc,
      photoName,
      status: 'Reported',
      created: new Date().toISOString()
    };

    list.unshift(item);
    setStore(KEY_MAINT, list);

    event.target.reset();
    const photoPreview = document.getElementById('mPhotoName');
    if (photoPreview) photoPreview.textContent = 'No photo attached';

    renderAll();
    toast(`Maintenance ticket ${item.id} logged!`, '✓');

    showConfirmation({
      id: item.id,
      typeLabel: 'Maintenance Request',
      category: item.issue,
      locationText: item.room ? `${item.location} • ${item.room}` : item.location,
      dateFormatted: new Date(item.created).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      desc: item.desc,
      extraLabel: 'Urgency Level',
      extraVal: item.urgency,
      photoName: item.photoName,
      nextStepsHtml: `
        <li>Your maintenance request has been recorded in the JAIN Smart Campus registry.</li>
        <li>High-urgency safety hazards and active lecture disruptions are prioritized during daily technician rounds.</li>
        <li>Facility technicians will inspect the spot at <strong>${item.location} (${item.room || 'campus'})</strong>.</li>
        <li>Keep your reference ID <code>${item.id}</code> handy if following up at the campus facilities office.</li>
      `
    });
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitBtn.textContent = 'Submit Maintenance Request';
    }
  }
}

function submitLost(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const submitBtn = document.getElementById('lostSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.textContent = 'Saving report...';
  }
  isSubmitting = true;

  try {
    const list = getStore(KEY_LOST) || [];
    const typeEl = document.getElementById('lType');
    const categoryEl = document.getElementById('lCategory');
    const locationEl = document.getElementById('lLocation');
    const dateEl = document.getElementById('lDate');
    const descEl = document.getElementById('lDesc');
    const contactEl = document.getElementById('lContact');
    const handoverEl = document.getElementById('fHandover');
    const finderContactEl = document.getElementById('fContact');
    const photoEl = document.getElementById('lPhoto');

    const type = typeEl ? typeEl.value : 'I LOST SOMETHING';
    const isLost = type === 'I LOST SOMETHING';
    const category = categoryEl ? categoryEl.value : '';
    const location = locationEl ? locationEl.value.trim() : '';
    const date = dateEl && dateEl.value ? dateEl.value : new Date().toISOString();
    const desc = descEl ? descEl.value.trim() : '';
    const contact = isLost && contactEl ? contactEl.value.trim() : '';
    const handover = !isLost && handoverEl ? handoverEl.value : '';
    const finderContact = !isLost && finderContactEl ? finderContactEl.value.trim() : '';
    const photoName = photoEl && photoEl.files && photoEl.files[0] ? photoEl.files[0].name : null;

    if (!desc || !location) {
      if (!location && locationEl) {
        locationEl.classList.add('input-invalid');
        locationEl.addEventListener('input', () => locationEl.classList.remove('input-invalid'), { once: true });
        locationEl.focus();
      } else if (!desc && descEl) {
        descEl.classList.add('input-invalid');
        descEl.addEventListener('input', () => descEl.classList.remove('input-invalid'), { once: true });
        descEl.focus();
      }
      toast('Please provide a description and location.', '⚠️');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = isLost ? 'Submit Lost Item Report' : 'Submit Found Item Record';
      }
      isSubmitting = false;
      return;
    }

    const newId = generateUniqueId(isLost ? 'lost' : 'found');
    const item = {
      id: newId,
      type,
      category,
      location,
      date,
      desc,
      contact: isLost ? contact : finderContact,
      handover: !isLost ? handover : null,
      photoName,
      created: new Date().toISOString()
    };

    list.unshift(item);
    setStore(KEY_LOST, list);

    event.target.reset();
    const photoPreview = document.getElementById('lPhotoName');
    if (photoPreview) photoPreview.textContent = 'No file selected';

    renderAll();
    toast(`${isLost ? 'Lost' : 'Found'} item report ${item.id} logged!`, '✓');

    showConfirmation({
      id: item.id,
      typeLabel: isLost ? 'Lost Belonging Report' : 'Found Item Report',
      category: item.category,
      locationText: item.location,
      dateFormatted: new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      desc: item.desc,
      extraLabel: isLost ? 'Contact Info' : 'Handover Spot',
      extraVal: isLost ? (item.contact || 'Registered with security') : (item.handover || 'Security Office'),
      photoName: item.photoName,
      nextStepsHtml: isLost ? `
        <li>Your report has been logged to the JAIN Smart Campus registry.</li>
        <li>Campus security and reception staff cross-reference incoming turned-in items daily.</li>
        <li>If an item matching your description is received, staff will contact you via <strong>${item.contact || 'your registered contact'}</strong>.</li>
        <li>Visit the Central Security Office (Main Gate) with reference ID <code>${item.id}</code> to inquire in person.</li>
      ` : `
        <li>Thank you for helping reunite belongings with their owner!</li>
        <li>Your report is now catalogued in the campus registry.</li>
        <li>Please deposit the item at <strong>${item.handover || 'the Security Office'}</strong> if you haven't already.</li>
        <li>For student privacy, sensitive details are withheld. Anyone claiming this item must verify unique identifying features to security before handover.</li>
      `
    });
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      const typeEl = document.getElementById('lType');
      const isLost = (typeEl ? typeEl.value : '') === 'I LOST SOMETHING';
      submitBtn.textContent = isLost ? 'Submit Lost Item Report' : 'Submit Found Item Report';
    }
  }
}

// Confirmation View Populator
function showConfirmation(reportData) {
  const refIdEl = document.getElementById('confRefId');
  const typeBadgeEl = document.getElementById('confTypeBadge');
  const titleEl = document.getElementById('confTitle');
  const categoryEl = document.getElementById('confCategory');
  const locationEl = document.getElementById('confLocation');
  const dateEl = document.getElementById('confDate');
  const descEl = document.getElementById('confDesc');
  const extraRow = document.getElementById('confExtraRow');
  const extraLabel = document.getElementById('confExtraLabel');
  const extraVal = document.getElementById('confExtraVal');
  const photoRow = document.getElementById('confPhotoRow');
  const photoVal = document.getElementById('confPhotoVal');
  const nextStepsList = document.getElementById('confNextSteps');

  if (refIdEl) refIdEl.textContent = reportData.id;
  if (typeBadgeEl) typeBadgeEl.textContent = reportData.typeLabel;
  if (titleEl) titleEl.textContent = `${reportData.typeLabel} Logged`;
  if (categoryEl) categoryEl.textContent = reportData.category || 'General';
  if (locationEl) locationEl.textContent = reportData.locationText || 'Campus Location';
  if (dateEl) dateEl.textContent = reportData.dateFormatted || new Date().toLocaleString();
  if (descEl) descEl.textContent = reportData.desc || 'No description entered.';

  if (extraRow && extraLabel && extraVal) {
    if (reportData.extraLabel && reportData.extraVal) {
      extraLabel.textContent = reportData.extraLabel;
      extraVal.textContent = reportData.extraVal;
      extraRow.style.display = 'flex';
    } else {
      extraRow.style.display = 'none';
    }
  }

  if (photoRow && photoVal) {
    if (reportData.photoName) {
      photoVal.textContent = reportData.photoName;
      photoRow.style.display = 'flex';
    } else {
      photoRow.style.display = 'none';
    }
  }

  if (nextStepsList && reportData.nextStepsHtml) {
    nextStepsList.innerHTML = reportData.nextStepsHtml;
  }

  showView('viewConfirmation');
}

function copyRefId() {
  const refEl = document.getElementById('confRefId');
  const refId = refEl ? refEl.textContent.trim() : '';
  if (!refId) return;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(refId).then(() => {
      toast(`Copied Reference ID: ${refId}`, '✓');
      const btn = document.getElementById('copyRefBtn');
      if (btn) {
        const oldText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = oldText; }, 2000);
      }
    }).catch(() => {
      toast(`Reference: ${refId}`, 'ℹ️');
    });
  } else {
    toast(`Reference: ${refId}`, 'ℹ️');
  }
}

// Ticket Lifecycle State Machine
function advanceTicket(index) {
  const list = getStore(KEY_MAINT) || [];
  if (!list[index]) return;

  if (list[index].status === 'Reported') {
    list[index].status = 'In Progress';
  } else if (list[index].status === 'In Progress') {
    list[index].status = 'Fixed';
  }

  setStore(KEY_MAINT, list);
  renderAll();
  toast(`Ticket ${list[index].id} updated to ${list[index].status}.`, '✓');
}

// Item Ownership Verification Modal Handlers
let activeVerificationId = null;

function openVerification(id) {
  activeVerificationId = id;
  const modal = document.getElementById('verificationModal');
  if (modal) {
    const codeEl = document.getElementById('verifyItemCode');
    const inputEl = document.getElementById('verifyInput');
    if (codeEl) codeEl.textContent = id;
    if (inputEl) inputEl.value = '';
    modal.classList.add('active');
    setTimeout(() => { if (inputEl) inputEl.focus(); }, 100);
  }
}

function closeVerification() {
  const modal = document.getElementById('verificationModal');
  if (modal) modal.classList.remove('active');
  activeVerificationId = null;
}

function confirmVerification() {
  const inputEl = document.getElementById('verifyInput');
  const input = inputEl ? inputEl.value.trim() : '';
  if (!input) {
    toast('Please enter a detail to verify ownership', '⚠️');
    return;
  }
  closeVerification();
  toast(`Verification request logged for item ${activeVerificationId}. Handover team notified!`, '✓');
}

// Smooth Navigation to Section (Auto-switches to viewHome if needed)
function scrollToSection(sectionId) {
  if (activeViewId !== 'viewHome') {
    showView('viewHome');
  }
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
}

// ========================================================
// INSIGHTS REPORTING ENGINE
// ========================================================
let insightsCategoryFilter = 'all'; // 'all' | 'facilities' | 'lost'
let insightsStatusFilter = 'all';   // 'all' | 'active' | 'resolved'

function setInsightsCategoryFilter(cat) {
  insightsCategoryFilter = cat;
  const tabs = {
    all: 'insightsFilterAll',
    facilities: 'insightsFilterMaint',
    lost: 'insightsFilterLost'
  };
  Object.keys(tabs).forEach(k => {
    const btn = document.getElementById(tabs[k]);
    if (btn) {
      if (k === cat) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  const reportsList = document.getElementById('insightsReportsList');
  if (reportsList) {
    reportsList.classList.add('filtering');
    setTimeout(() => {
      renderInsights();
      reportsList.classList.remove('filtering');
    }, 120);
  } else {
    renderInsights();
  }
}

function setInsightsStatusFilter(status) {
  insightsStatusFilter = status;
  const pills = {
    all: 'insightsStatusAll',
    active: 'insightsStatusActive',
    resolved: 'insightsStatusResolved'
  };
  Object.keys(pills).forEach(k => {
    const btn = document.getElementById(pills[k]);
    if (btn) {
      if (k === status) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  const reportsList = document.getElementById('insightsReportsList');
  if (reportsList) {
    reportsList.classList.add('filtering');
    setTimeout(() => {
      renderInsights();
      reportsList.classList.remove('filtering');
    }, 120);
  } else {
    renderInsights();
  }
}

function renderInsights() {
  const maintList = getStore(KEY_MAINT) || [];
  const lostList = getStore(KEY_LOST) || [];

  const fixedMaintCount = maintList.filter(x => x.status === 'Fixed').length;
  const activeMaintCount = maintList.length - fixedMaintCount;
  const totalCount = maintList.length + lostList.length;
  const activeTotal = activeMaintCount + lostList.length;
  const resolvedTotal = fixedMaintCount;

  // Update Metric KPIs with smooth numerical ticker
  const totalEl = document.getElementById('metricTotalAll');
  const activeEl = document.getElementById('metricActiveAll');
  const resolvedEl = document.getElementById('metricResolvedAll');
  const rateEl = document.getElementById('metricResolutionRate');

  const rateValue = maintList.length > 0 ? Math.min(Math.round(((fixedMaintCount + 0.5) / (maintList.length + 0.5)) * 95), 99) : 95;

  if (typeof animateCount === 'function') {
    if (totalEl) animateCount(totalEl, totalCount, 450);
    if (activeEl) animateCount(activeEl, activeTotal, 450);
    if (resolvedEl) animateCount(resolvedEl, resolvedTotal, 450);
    if (rateEl) animateCount(rateEl, rateValue, 500, '%');
  } else {
    if (totalEl) totalEl.textContent = totalCount;
    if (activeEl) activeEl.textContent = activeTotal;
    if (resolvedEl) resolvedEl.textContent = resolvedTotal;
    if (rateEl) rateEl.textContent = `${rateValue}%`;
  }

  // Build unified items array
  const unified = [];

  maintList.forEach((m, idx) => {
    unified.push({
      id: m.id,
      kind: 'facilities',
      serviceLabel: 'Facilities & Maintenance',
      badgeColor: 'blue',
      category: m.issue,
      location: m.room ? `${m.location} • ${m.room}` : m.location,
      date: m.created,
      desc: m.desc,
      urgency: m.urgency || 'Standard',
      status: m.status || 'Reported',
      isResolved: m.status === 'Fixed',
      rawIndex: idx
    });
  });

  lostList.forEach((l, idx) => {
    const isFound = (l.type || '').includes('FOUND');
    unified.push({
      id: l.id,
      kind: 'lost',
      serviceLabel: isFound ? 'Found Item Report' : 'Lost Belonging',
      badgeColor: isFound ? 'green' : 'amber',
      category: l.category,
      location: l.handover ? `${l.location} (Custody: ${l.handover})` : l.location,
      date: l.date || l.created,
      desc: l.desc,
      urgency: null,
      status: isFound ? 'At Security Desk' : 'Active Listing',
      isResolved: false,
      rawIndex: idx
    });
  });

  // Sort by date newest first
  unified.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Search filtering
  const searchInput = document.getElementById('insightsSearchInput');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const filtered = unified.filter(item => {
    if (insightsCategoryFilter !== 'all' && item.kind !== insightsCategoryFilter) {
      return false;
    }
    if (insightsStatusFilter === 'active' && item.isResolved) {
      return false;
    }
    if (insightsStatusFilter === 'resolved' && !item.isResolved) {
      return false;
    }
    if (query) {
      const matchText = `${item.id} ${item.category} ${item.location} ${item.desc} ${item.status}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }
    return true;
  });

  const countBadge = document.getElementById('insightsRecordCount');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'} found`;
  }

  const container = document.getElementById('insightsReportsContainer');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-reports-card">
        <div class="empty-icon">🔍</div>
        <h4 class="empty-title">No matching reports found</h4>
        <p class="empty-desc">Try clearing your search query or selecting "All Records" above.</p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="clearInsightsFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    let statusClass = 'amber';
    if (item.status === 'In Progress') statusClass = 'blue';
    if (item.status === 'Fixed' || item.status === 'At Security Desk') statusClass = 'green';

    const urgencyHtml = item.urgency && item.urgency !== 'Standard'
      ? `<span class="report-urgency-tag">${item.urgency} Urgency</span>`
      : '';

    const actionButton = item.kind === 'facilities'
      ? (item.status !== 'Fixed'
          ? `<button type="button" class="btn btn-secondary btn-sm" onclick="advanceTicket(${item.rawIndex})">
               <span>${item.status === 'Reported' ? 'Advance → In Progress' : 'Mark Fixed ✓'}</span>
             </button>`
          : `<span class="completed-check">✓ Resolved</span>`)
      : `<button type="button" class="btn btn-secondary btn-sm" onclick="openVerification('${item.id}')">
           <span>Verify Ownership</span>
         </button>`;

    const dateFormatted = new Date(item.date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-meta-left">
            <span class="report-id-badge">${item.id}</span>
            <span class="report-service-badge ${item.badgeColor}">${item.serviceLabel}</span>
            ${urgencyHtml}
          </div>
          <span class="status-indicator-pill ${statusClass}">${item.status}</span>
        </div>

        <div class="report-card-body">
          <h4 class="report-card-title">${item.category}</h4>
          <p class="report-card-desc">${item.desc}</p>
        </div>

        <div class="report-card-footer">
          <div class="report-details-row">
            <span class="report-detail">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${item.location}</span>
            </span>
            <span class="report-detail">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${dateFormatted}</span>
            </span>
          </div>
          <div class="report-action-wrap">
            ${actionButton}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function clearInsightsFilters() {
  const searchInput = document.getElementById('insightsSearchInput');
  if (searchInput) searchInput.value = '';
  setInsightsCategoryFilter('all');
  setInsightsStatusFilter('all');
}

function renderAll() {
  renderInsights();
}

// ========================================================
// QR MANAGEMENT & SIMULATION
// ========================================================
const CAMPUS_LOCATIONS = [
  {
    id: 'classroom-a-204',
    name: 'Classroom Block A',
    room: 'Room A-204, 2nd Floor',
    floor: '2nd Floor',
    zone: 'Lecture Halls & Classrooms',
    fixit: {
      location: 'Classroom Block A',
      room: 'Room A-204, 2nd Floor (Podium)',
      issue: 'Projector / AV Cable',
      urgency: 'Medium',
      desc: 'HDMI projector connection loose at main lectern'
    },
    lost: {
      location: 'Classroom Block A - Room A-204',
      category: 'Electronics',
      handover: 'Classroom Block A Reception'
    }
  },
  {
    id: 'library-study-hall',
    name: 'Central Library',
    room: '1st Floor Study Hall, Desk 12',
    floor: '1st Floor',
    zone: 'Quiet Study & Research',
    fixit: {
      location: 'Library',
      room: '1st Floor Study Hall, Desk 12 power hub',
      issue: 'Switch / Plug Socket',
      urgency: 'Standard',
      desc: 'Dual desk plug socket at Study Desk 12 has no electrical power'
    },
    lost: {
      location: 'Library 1st Floor Study Hall (Desk 12)',
      category: 'Books / Notes',
      handover: 'Library Front Circulation Desk'
    }
  },
  {
    id: 'lab-complex-c3',
    name: 'Lab Complex',
    room: 'Computer Lab 3, Workstation 22 (Block C)',
    floor: '3rd Floor',
    zone: 'Science & Computing Wing',
    fixit: {
      location: 'Lab Complex',
      room: 'Computer Lab 3, 3rd Floor (Workstation 22)',
      issue: 'Air Conditioning',
      urgency: 'Medium',
      desc: 'Ceiling AC vent dripping condensation water near row 4'
    },
    lost: {
      location: 'Lab Complex Block C - Computer Lab 3',
      category: 'ID Card / Documents',
      handover: 'Classroom Block A Reception'
    }
  },
  {
    id: 'cafeteria-central',
    name: 'Campus Cafeteria',
    room: 'Central Food Court, Dining Table B-8',
    floor: 'Ground Floor',
    zone: 'Student Dining Hub',
    fixit: {
      location: 'Cafeteria',
      room: 'Handwash Area near West Counter',
      issue: 'Water / Plumbing Leak',
      urgency: 'High',
      desc: 'Water tap leaking continuously with slow sink drainage'
    },
    lost: {
      location: 'Cafeteria - Dining Table B-8',
      category: 'Water bottle',
      handover: 'Cafeteria Manager Counter'
    }
  },
  {
    id: 'sports-indoor-court',
    name: 'Sports & Gym Area',
    room: 'Indoor Badminton Court 2 & Locker Room',
    floor: 'Ground Floor',
    zone: 'Athletics & Gymnasium',
    fixit: {
      location: 'Sports & Gym Area',
      room: 'Badminton Court 2, Overhead Floodlight 4',
      issue: 'Light / Electrical Tube',
      urgency: 'Medium',
      desc: 'Overhead light fixture flickering during evening badminton practice'
    },
    lost: {
      location: 'Sports Complex - Court 2 Spectator Benches',
      category: 'Bag / Backpack',
      handover: 'Campus Security Office (Main Gate)'
    }
  },
  {
    id: 'hostel-block-b',
    name: 'Hostel Blocks',
    room: 'Block B Hostel, 1st Floor Common Study Hall',
    floor: '1st Floor',
    zone: 'Residential Complex',
    fixit: {
      location: 'Hostel Blocks',
      room: 'Hostel Block B, 1st Floor Water Dispenser',
      issue: 'Water / Plumbing Leak',
      urgency: 'High',
      desc: 'Corridor drinking water dispenser dispensing slow trickle'
    },
    lost: {
      location: 'Hostel Block B - 1st Floor Common Hall',
      category: 'Keys',
      handover: 'Campus Security Office (Main Gate)'
    }
  }
];

let activePosterService = 'fixit';
let scannerStream = null;
let scannerAnimFrame = null;
let currentCameraFacing = 'environment';
let isScanningActive = false;

function getQRBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + window.location.pathname;
  }
  return window.location.origin + window.location.pathname;
}

function buildQRUrl(loc, service) {
  const base = getQRBaseUrl();
  const p = new URLSearchParams();
  p.set('service', service);
  p.set('code', loc.id);

  if (service === 'fixit') {
    p.set('loc', loc.fixit.location);
    p.set('room', loc.fixit.room);
    p.set('issue', loc.fixit.issue);
    p.set('urgency', loc.fixit.urgency);
  } else {
    p.set('loc', loc.lost.location);
    p.set('cat', loc.lost.category);
    p.set('handover', loc.lost.handover);
  }

  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}${p.toString()}`;
}

function renderCampusLocationsQR() {
  const container = document.getElementById('locationsQrGrid');
  if (!container) return;

  container.innerHTML = '';

  CAMPUS_LOCATIONS.forEach((loc) => {
    const card = document.createElement('div');
    card.className = 'loc-qr-card';

    const isFixit = activePosterService === 'fixit';
    const serviceLabel = isFixit ? 'FIX-IT QR' : 'Lost@JAIN';
    const spotText = isFixit ? loc.fixit.room : loc.lost.location;
    const targetUrl = buildQRUrl(loc, activePosterService);
    const boxId = `qrCanvas_${loc.id}_${activePosterService}`;

    card.innerHTML = `
      <div class="loc-qr-header">
        <span class="loc-zone-badge">${loc.zone}</span>
        <span class="loc-card-badge">${serviceLabel}</span>
      </div>
      <div class="loc-name">${loc.name}</div>
      <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">${spotText}</div>
      <div class="loc-qr-preview-box" id="${boxId}" onclick="openLocationFromQR('${loc.id}', '${activePosterService}')" style="cursor:pointer;" title="Tap to test scan"></div>
      <div class="loc-qr-actions">
        <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="openLocationFromQR('${loc.id}', '${activePosterService}')">
          ⚡ Test Scan
        </button>
      </div>
    `;

    container.appendChild(card);

    const qrBox = document.getElementById(boxId);
    if (qrBox && window.QRCode) {
      try {
        new QRCode(qrBox, {
          text: targetUrl,
          width: 90,
          height: 90,
          colorDark: '#172B45',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        qrBox.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);">[QR Code: ${loc.id}]</span>`;
      }
    }
  });
}

function openLocationFromQR(locId, service) {
  const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
  if (!loc) return;

  const url = buildQRUrl(loc, service);
  closeScannerModal();
  handleScannedData(url);
}

function setQRPosterService(service) {
  activePosterService = service;
  const fixitBtn = document.getElementById('qrServiceFixitBtn');
  const lostBtn = document.getElementById('qrServiceLostBtn');

  if (fixitBtn && lostBtn) {
    if (service === 'fixit') {
      fixitBtn.classList.add('active');
      lostBtn.classList.remove('active');
    } else {
      lostBtn.classList.add('active');
      fixitBtn.classList.remove('active');
    }
  }

  renderCampusLocationsQR();
}

// Scanner Modal Controls
function openScannerModal(tab = 'camera') {
  const modal = document.getElementById('scannerModal');
  if (!modal) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  switchScannerTab(tab);
}

function closeScannerModal() {
  const modal = document.getElementById('scannerModal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
  stopCameraStream();
}

function switchScannerTab(tabName) {
  const cameraTab = document.getElementById('scannerCameraTab');
  const locationsTab = document.getElementById('scannerLocationsTab');
  const tabCameraBtn = document.getElementById('tabCameraBtn');
  const tabLocationsBtn = document.getElementById('tabLocationsBtn');

  if (tabName === 'camera') {
    if (cameraTab) cameraTab.style.display = 'block';
    if (locationsTab) locationsTab.style.display = 'none';
    if (tabCameraBtn) {
      tabCameraBtn.classList.add('active');
      tabCameraBtn.setAttribute('aria-selected', 'true');
    }
    if (tabLocationsBtn) {
      tabLocationsBtn.classList.remove('active');
      tabLocationsBtn.setAttribute('aria-selected', 'false');
    }
    startCameraStream();
  } else {
    stopCameraStream();
    if (cameraTab) cameraTab.style.display = 'none';
    if (locationsTab) locationsTab.style.display = 'block';
    if (tabCameraBtn) {
      tabCameraBtn.classList.remove('active');
      tabCameraBtn.setAttribute('aria-selected', 'false');
    }
    if (tabLocationsBtn) {
      tabLocationsBtn.classList.add('active');
      tabLocationsBtn.setAttribute('aria-selected', 'true');
    }
    renderCampusLocationsQR();
  }
}

async function startCameraStream() {
  const video = document.getElementById('scannerVideo');
  const notice = document.getElementById('scannerNotice');
  const flipBtn = document.getElementById('flipCameraBtn');

  if (!video) return;

  stopCameraStream();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (notice) notice.innerHTML = `<span>Camera access unavailable. Test with 6 campus locations.</span>`;
    return;
  }

  try {
    if (notice) notice.innerHTML = `<span>Connecting campus camera viewfinder...</span>`;

    const constraints = {
      video: {
        facingMode: currentCameraFacing,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = scannerStream;
    await video.play();

    isScanningActive = true;
    if (notice) notice.innerHTML = `<span>Align QR code within frame</span>`;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      if (flipBtn && videoDevices.length > 1) {
        flipBtn.style.display = 'grid';
      }
    } catch {}

    startScanFrameLoop();
  } catch (err) {
    console.warn('Camera stream error:', err);
    if (notice) {
      notice.innerHTML = `<span>Camera access blocked. Switch to 6 campus locations tab.</span>`;
    }
  }
}

function stopCameraStream() {
  isScanningActive = false;
  if (scannerAnimFrame) {
    cancelAnimationFrame(scannerAnimFrame);
    scannerAnimFrame = null;
  }

  if (scannerStream) {
    scannerStream.getTracks().forEach((track) => track.stop());
    scannerStream = null;
  }

  const video = document.getElementById('scannerVideo');
  if (video) video.srcObject = null;
}

function flipCamera() {
  currentCameraFacing = currentCameraFacing === 'environment' ? 'user' : 'environment';
  startCameraStream();
}

function startScanFrameLoop() {
  const video = document.getElementById('scannerVideo');
  const canvas = document.getElementById('scannerCanvas') || document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const hasBarcodeDetector = 'BarcodeDetector' in window;
  let detector = null;
  if (hasBarcodeDetector) {
    try {
      detector = new BarcodeDetector({ formats: ['qr_code'] });
    } catch {
      detector = null;
    }
  }

  const scan = async () => {
    if (!isScanningActive || !video || video.readyState < 2) {
      if (isScanningActive) {
        scannerAnimFrame = requestAnimationFrame(scan);
      }
      return;
    }

    try {
      if (detector) {
        const barcodes = await detector.detect(video);
        if (barcodes && barcodes.length > 0) {
          onQRDecodedSuccess(barcodes[0].rawValue);
          return;
        }
      } else if (window.jsQR && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          onQRDecodedSuccess(code.data);
          return;
        }
      }
    } catch {}

    if (isScanningActive) {
      scannerAnimFrame = requestAnimationFrame(scan);
    }
  };

  scannerAnimFrame = requestAnimationFrame(scan);
}

function onQRDecodedSuccess(decodedText) {
  stopCameraStream();

  if (navigator.vibrate) {
    try { navigator.vibrate(50); } catch {}
  }

  const notice = document.getElementById('scannerNotice');
  if (notice) {
    notice.innerHTML = `<span style="color:#16A34A; font-weight:700;">✓ QR Detected! Opening report...</span>`;
  }

  setTimeout(() => {
    closeScannerModal();
    handleScannedData(decodedText);
  }, 300);
}

function handleQRImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let foundData = null;

      if ('BarcodeDetector' in window) {
        try {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const codes = await detector.detect(img);
          if (codes && codes.length > 0) foundData = codes[0].rawValue;
        } catch {}
      }

      if (!foundData && window.jsQR) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imgData.data, imgData.width, imgData.height);
        if (code) foundData = code.data;
      }

      if (foundData) {
        onQRDecodedSuccess(foundData);
      } else {
        toast('No readable campus QR found in this photo.', '⚠️');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleScannedData(payload) {
  if (!payload) return;

  let url;
  try {
    url = new URL(payload, window.location.origin);
  } catch {
    url = new URL(window.location.origin + '?' + payload);
  }

  const params = url.searchParams;
  applyQRParameters(params);
}

function applyQRParameters(params) {
  const service = params.get('service') || (params.get('location') ? 'fixit' : null);
  const location = params.get('loc') || params.get('location');
  const room = params.get('room');
  const issue = params.get('issue');
  const urgency = params.get('urgency');
  const category = params.get('cat') || params.get('category');
  const handover = params.get('handover');

  if (service === 'fixit' || (!service && location)) {
    openMaintenance();

    if (location) {
      const select = document.getElementById('mLocation');
      if (select) {
        select.value = location;
        if (!select.value && select.options.length > 0) {
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text.toLowerCase().includes(location.toLowerCase())) {
              select.selectedIndex = i;
              break;
            }
          }
        }
      }
    }

    if (room) {
      const roomInput = document.getElementById('mRoom');
      if (roomInput) roomInput.value = room;
    }

    if (issue) {
      const issueSelect = document.getElementById('mIssue');
      if (issueSelect) issueSelect.value = issue;
    }

    if (urgency) {
      const urgencySelect = document.getElementById('mUrgency');
      if (urgencySelect) urgencySelect.value = urgency;
    }

    const banner = document.getElementById('maintQrBanner');
    if (banner) {
      banner.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:10px 14px; background:var(--primary-blue-light); border:1px solid rgba(37,99,235,0.2); border-radius:var(--radius-sm); font-size:12.5px; color:#1E40AF;">
          <span>📍 Pre-filled from QR: <strong>${location || 'Campus Asset'}</strong> ${room ? `(${room})` : ''}</span>
          <button type="button" class="btn-link btn-sm" onclick="clearQRContext('maint')">Clear</button>
        </div>
      `;
      banner.style.display = 'block';
    }

    toast(`Location identified: ${location || 'Campus'}`, '📍');

  } else if (service === 'lost' || service === 'found') {
    const isFound = service === 'found';
    openLostForm(isFound ? 'found' : 'lost');

    if (category) {
      const catSelect = document.getElementById('lCategory');
      if (catSelect) catSelect.value = category;
    }

    if (location) {
      const locInput = document.getElementById('lLocation');
      if (locInput) locInput.value = location;
    }

    if (isFound && handover) {
      const handSelect = document.getElementById('fHandover');
      if (handSelect) handSelect.value = handover;
    }

    const banner = document.getElementById('lostQrBanner');
    if (banner) {
      banner.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:10px 14px; background:var(--primary-blue-light); border:1px solid rgba(37,99,235,0.2); border-radius:var(--radius-sm); font-size:12.5px; color:#1E40AF; margin-bottom:14px;">
          <span>📍 Location set: <strong>${location || 'Campus Zone'}</strong></span>
          <button type="button" class="btn-link btn-sm" onclick="clearQRContext('lost')">Clear</button>
        </div>
      `;
      banner.style.display = 'block';
    }

    toast(`Station: ${location || 'Campus'}`, '📍');
  }
}

function clearQRContext(type) {
  const banner = document.getElementById(type === 'maint' ? 'maintQrBanner' : 'lostQrBanner');
  if (banner) {
    banner.innerHTML = '';
    banner.style.display = 'none';
  }
}

// ========================================================
// PWA & SERVICE WORKER INSTALLATION
// ========================================================
let deferredInstallPrompt = null;

function setupPWAInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('[PWA] beforeinstallprompt captured and ready');
    const helper = document.getElementById('pwaInstallHelperText');
    if (helper) helper.textContent = '1-click browser install ready!';
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed');
    toast('JAIN Smart Campus installed successfully!', '🎉');
    deferredInstallPrompt = null;
    closeInstallModal();
  });
}

function handleInstallClick() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        toast('Installing JAIN Smart Campus...', '⚡');
        deferredInstallPrompt = null;
      } else {
        openInstallModal();
      }
    }).catch(() => {
      openInstallModal();
    });
  } else {
    openInstallModal();
  }
}

function triggerPWAInstallDirect() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        toast('Installing JAIN Smart Campus...', '⚡');
        deferredInstallPrompt = null;
        closeInstallModal();
      }
    }).catch(() => {
      toast('Please use browser menu or shortcut to install.', 'ℹ️');
    });
  } else {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      toast('iOS Safari: Tap Share and choose "Add to Home Screen".', '📱');
    } else {
      toast('Click install icon in browser address bar or Menu (⋮) > Install.', '🖥️');
    }
  }
}

function openInstallModal() {
  const modal = document.getElementById('installAppModal');
  if (modal) {
    modal.style.display = 'grid';
    modal.classList.add('active');
  }
}

function closeInstallModal() {
  const modal = document.getElementById('installAppModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function trackDesktopDownload() {
  toast('Downloading desktop launcher script...', '📥');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[Service Worker] Active:', reg.scope))
        .catch((err) => console.warn('[Service Worker] Notice:', err));
    });
  }
}

function checkUrlParams() {
  // Check hash first
  const hash = window.location.hash.toLowerCase();
  if (hash === '#insights') {
    showView('viewInsights');
    return;
  } else if (hash === '#information' || hash === '#about') {
    showView('viewInformation');
    return;
  }

  // Check search params
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  const service = params.get('service');
  const locationParam = params.get('location') || params.get('loc');
  const actionParam = params.get('action');

  if (service || locationParam) {
    applyQRParameters(params);
  } else if (actionParam === 'maintenance') {
    openMaintenance();
  } else if (actionParam === 'lost') {
    openLostSelection();
  }
}

// Global Keyboard Accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeScannerModal();
    closeVerification();
    closeInstallModal();
  }
});

// ========================================================
// MOTION & MICRO-INTERACTIONS ENGINE
// ========================================================

/**
 * Animate numerical values smoothly with ease-out cubic curve.
 * Honors prefers-reduced-motion and strictly lands on the exact final value.
 */
function animateCount(element, target, duration = 500, suffix = '') {
  if (!element) return;
  const targetNum = parseInt(target, 10);
  if (isNaN(targetNum)) {
    element.textContent = `${target}${suffix}`;
    return;
  }

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = `${targetNum}${suffix}`;
    return;
  }

  const startNum = 0;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startNum + (targetNum - startNum) * ease);
    element.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${targetNum}${suffix}`;
    }
  }

  requestAnimationFrame(step);
}

/**
 * IntersectionObserver-powered scroll reveals.
 * Progressively reveals sections with subtle stagger once in viewport.
 */
let scrollRevealObserver = null;

function initScrollReveals(scope) {
  const rootEl = scope ? (typeof scope === 'string' ? document.getElementById(scope) : scope) : document;
  if (!rootEl) return;

  const revealTargets = rootEl.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
  if (!revealTargets.length) return;

  // Immediate visibility for reduced motion or missing IntersectionObserver
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  if (!scrollRevealObserver) {
    scrollRevealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });
  }

  revealTargets.forEach(el => {
    // If element is already in the viewport upon mount, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
    } else {
      scrollRevealObserver.observe(el);
    }
  });
}

/**
 * Gentle interactive desktop parallax tilt on the hero campus photograph.
 * Restrained to <= 3px translation and auto-resets on mouseleave.
 */
function initCampusPhotoParallax() {
  const heroSection = document.querySelector('.hero-split-section');
  const photoFrame = document.querySelector('.hero-split-right .campus-photo-frame');
  if (!heroSection || !photoFrame) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 960px)').matches) return;

  let ticking = false;

  heroSection.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
      const yNorm = (e.clientY - rect.top) / rect.height - 0.5;
      const shiftX = (xNorm * 5).toFixed(2);
      const shiftY = (yNorm * 3).toFixed(2);
      photoFrame.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
      ticking = false;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    photoFrame.style.transform = '';
  });
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  setupPWAInstall();
  registerServiceWorker();
  renderAll();
  checkUrlParams();
  initScrollReveals('viewHome');
  initCampusPhotoParallax();
});
