// JAIN Smart Campus — Frontend Engine & State Management

// Storage Keys
const KEY_MAINT = 'jain_maintenance_v2';
const KEY_LOST = 'jain_lostfound_v2';
const KEY_THEME = 'jain_theme';

// Helpers: Local Storage
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

// Initial Sample Data (if empty)
function initSampleData() {
  if (!getStore(KEY_MAINT)) {
    const sampleMaint = [
      { id: 'FIX-8A2F1', location: 'Classroom Block A', room: 'Room A-204, 2nd Floor', issue: 'Projector / AV Cable', urgency: 'Medium', desc: 'HDMI input port loose in Room A-204', status: 'In Progress', created: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'FIX-3B9X4', location: 'Library', room: '1st Floor Study Hall, Desk 12', issue: 'Switch / Plug Socket', urgency: 'Standard', desc: 'Plug socket near desk 12 not providing power', status: 'Reported', created: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'FIX-9K4L2', location: 'Lab Complex', room: 'Computer Lab 3, 3rd Floor', issue: 'Fan / Ventilation', urgency: 'Low', desc: 'Ceiling fan high speed vibration', status: 'Fixed', created: new Date(Date.now() - 3600000 * 48).toISOString() }
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

// Toast Notification System
function toast(msg, icon = '✓') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.innerHTML = `<span style="font-weight:700;">${icon}</span> <span>${msg}</span>`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

// Unique Reference Identifier Generator (Ensures Zero Collision)
function generateUniqueId(type) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid confusing 0/O, 1/I
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

// View Navigation & State Machine
let activeViewId = 'viewHome';

function showView(targetViewId, options = {}) {
  const views = ['viewHome', 'viewLostChoice', 'viewLostForm', 'viewMaintForm', 'viewConfirmation'];
  
  views.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === targetViewId) {
      el.style.display = 'block';
      void el.offsetHeight; // Reflow for transition
      el.classList.add('active');
    } else {
      el.classList.remove('active');
      el.style.display = 'none';
    }
  });

  activeViewId = targetViewId;

  // Viewport scroll behavior
  if (targetViewId === 'viewHome') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const targetEl = document.getElementById(targetViewId);
    if (targetEl) {
      const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 60;
      const rect = targetEl.getBoundingClientRect();
      const targetY = window.pageYOffset + rect.top - topbarHeight - 20;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  }

  // Auto focus first interactive field in the view
  if (options.focus) {
    setTimeout(() => {
      const container = document.getElementById(targetViewId);
      if (!container) return;
      const firstInput = container.querySelector('select:not([type="hidden"]):not([style*="display: none"]), input:not([type="hidden"]):not([style*="display: none"]), textarea');
      if (firstInput) {
        firstInput.focus({ preventScroll: true });
      }
    }, 140);
  }
}

// File Upload Selection Handler
function handleFileSelect(input, previewId) {
  const previewEl = document.getElementById(previewId);
  if (!previewEl) return;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    previewEl.textContent = `${file.name} (${sizeMb} MB)`;
    previewEl.style.color = 'var(--text-primary)';
    previewEl.style.fontWeight = '500';
  } else {
    previewEl.textContent = 'No file selected';
    previewEl.style.color = 'var(--text-secondary)';
    previewEl.style.fontWeight = '400';
  }
}

// Lost@JAIN Flow Handlers
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

  // Pre-fill default datetime if empty
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
  const segLost = document.getElementById('segLost');
  const segFound = document.getElementById('segFound');

  const locLabel = document.getElementById('lLocationLabel');
  const locInput = document.getElementById('lLocation');
  const dateLabel = document.getElementById('lDateLabel');
  const descLabel = document.getElementById('lDescLabel');
  const descInput = document.getElementById('lDesc');
  const photoHelper = document.getElementById('lPhotoHelper');

  const lostFields = document.getElementById('lostSpecificFields');
  const foundFields = document.getElementById('foundSpecificFields');
  const contactInput = document.getElementById('lContact');

  if (isLost) {
    if (badgeEl) badgeEl.textContent = 'Lost Item Report';
    if (titleEl) titleEl.textContent = 'Report a lost belonging';
    if (subtitleEl) subtitleEl.textContent = 'Provide details to help campus staff and finders identify your item.';
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
    if (descInput) descInput.placeholder = 'Describe general visual appearance without disclosing confidential contents or passcode hints...';
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

// FIX-IT QR Flow Handler
function openMaintenance() {
  showView('viewMaintForm', { focus: true });
}

// Backward-compatible aliases for external scripts / URL triggers
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

// Submission Guard (Prevents accidental duplicate clicks)
let isSubmitting = false;

// Form Submission Handlers
function submitMaintenance(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const submitBtn = document.getElementById('maintSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
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

    // Reset inputs upon successful submission
    event.target.reset();
    const photoPreview = document.getElementById('mPhotoName');
    if (photoPreview) photoPreview.textContent = 'No photo attached';

    renderAll();
    toast(`Maintenance ticket ${item.id} logged!`, '✓');

    // Show Confirmation View
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
        <li>Your maintenance request has been recorded in the campus maintenance registry.</li>
        <li>High-urgency safety hazards and active lecture disruptions are prioritized during daily technician rounds.</li>
        <li>Facility technicians will inspect the spot at <strong>${item.location} (${item.room || 'campus'})</strong>.</li>
        <li>Keep your reference ID <code>${item.id}</code> handy if following up at the campus facilities office.</li>
      `
    });
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Maintenance Ticket';
    }
  }
}

function submitLost(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const submitBtn = document.getElementById('lostSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
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

    // Reset inputs upon successful submission
    event.target.reset();
    const photoPreview = document.getElementById('lPhotoName');
    if (photoPreview) photoPreview.textContent = 'No file selected';

    renderAll();
    toast(`${isLost ? 'Lost' : 'Found'} item report ${item.id} logged!`, '✓');

    // Show Confirmation View
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
  const nextStepsEl = document.getElementById('confNextSteps');

  if (refIdEl) refIdEl.textContent = reportData.id;
  if (typeBadgeEl) typeBadgeEl.textContent = reportData.typeLabel;
  if (titleEl) titleEl.textContent = `${reportData.typeLabel} Logged`;
  if (categoryEl) categoryEl.textContent = reportData.category;
  if (locationEl) locationEl.textContent = reportData.locationText;
  if (dateEl) dateEl.textContent = reportData.dateFormatted;
  if (descEl) descEl.textContent = reportData.desc;

  if (extraRow && extraLabel && extraVal) {
    if (reportData.extraVal) {
      extraRow.style.display = 'flex';
      extraLabel.textContent = reportData.extraLabel;
      extraVal.textContent = reportData.extraVal;
    } else {
      extraRow.style.display = 'none';
    }
  }

  if (photoRow && photoVal) {
    if (reportData.photoName) {
      photoRow.style.display = 'flex';
      photoVal.textContent = reportData.photoName;
    } else {
      photoRow.style.display = 'none';
    }
  }

  if (nextStepsEl) {
    nextStepsEl.innerHTML = reportData.nextStepsHtml;
  }

  showView('viewConfirmation');
}

// Copy Reference ID
function copyRefId() {
  const refId = document.getElementById('confRefId')?.textContent.trim();
  const btn = document.getElementById('copyRefBtn');
  if (refId && navigator.clipboard) {
    navigator.clipboard.writeText(refId).then(() => {
      toast(`Reference ${refId} copied!`, '📋');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { if (btn) btn.textContent = 'Copy Reference ID'; }, 2000);
      }
    }).catch(() => {
      toast(`Reference: ${refId}`, 'ℹ️');
    });
  } else {
    toast(`Reference: ${refId}`, 'ℹ️');
  }
}

// Open Activity Board from Confirmation
function openActivityFromConfirmation() {
  showView('viewHome');
  const drawer = document.getElementById('activitySection');
  if (drawer && drawer.style.display === 'none') {
    toggleActivity();
  } else if (drawer) {
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Activity Drawer Toggle
function toggleActivity() {
  const drawer = document.getElementById('activitySection');
  const btn = document.getElementById('toggleActivityBtn');
  if (!drawer) return;

  const isHidden = drawer.style.display === 'none';
  if (isHidden) {
    drawer.style.display = 'block';
    if (btn) btn.innerHTML = 'Hide campus activity registry &uarr;';
    drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    drawer.style.display = 'none';
    if (btn) btn.innerHTML = 'View campus activity registry &amp; verify items &rarr;';
  }
}

// Rendering Engine
function renderAll() {
  const maintList = getStore(KEY_MAINT) || [];
  const lostList = getStore(KEY_LOST) || [];

  // Update Counters
  const issueCountEl = document.getElementById('issueCount');
  const foundCountEl = document.getElementById('foundCount');
  const fixedCountEl = document.getElementById('fixedCount');

  if (issueCountEl) issueCountEl.textContent = maintList.length;
  if (foundCountEl) foundCountEl.textContent = lostList.length;
  if (fixedCountEl) fixedCountEl.textContent = maintList.filter((x) => x.status === 'Fixed').length;

  // Render Active Maintenance Tickets
  const ticketEl = document.getElementById('ticketsList');
  if (ticketEl) {
    if (maintList.length === 0) {
      ticketEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary); font-size: 13px;">No maintenance tickets submitted yet.</div>`;
    } else {
      ticketEl.innerHTML = maintList.map((item, idx) => {
        let badgeClass = 'badge-reported';
        if (item.status === 'In Progress') badgeClass = 'badge-progress';
        if (item.status === 'Fixed') badgeClass = 'badge-fixed';

        const urgencyLabel = item.urgency && item.urgency !== 'Standard' ? ` &bull; <span style="font-weight:600; color:var(--text-primary);">${item.urgency} urgency</span>` : '';
        const roomInfo = item.room ? ` (${item.room})` : '';

        return `
          <div class="ticket-item">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="ticket-code">${item.id}</span>
                <span class="badge ${badgeClass}">${item.status}</span>
              </div>
              <div class="ticket-meta">
                <b>${item.issue}</b> &bull; ${item.location}${roomInfo}${urgencyLabel}<br>
                <span>${item.desc}</span>
              </div>
            </div>
            ${item.status !== 'Fixed' ? `<button type="button" class="btn-sm" onclick="advanceTicket(${idx})">${item.status === 'Reported' ? 'In Progress' : 'Mark Fixed'}</button>` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // Render Lost & Found Items
  renderLostItems();
  renderQR();
}

function renderLostItems() {
  const lostList = getStore(KEY_LOST) || [];
  const searchInput = document.getElementById('searchItems');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

  const filtered = lostList.filter((x) => {
    return (x.category + ' ' + x.location + ' ' + x.desc + ' ' + x.type).toLowerCase().includes(query);
  });

  const listEl = document.getElementById('itemsList');
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary); font-size: 13px;">No matching lost or found reports.</div>`;
  } else {
    listEl.innerHTML = filtered.map((item) => {
      const isFound = item.type.includes('FOUND');
      const spotInfo = item.handover ? ` | 🏛️ Handover: ${item.handover}` : '';
      return `
        <div class="item-row">
          <div class="item-icon" aria-hidden="true">${isFound ? '📦' : '🔍'}</div>
          <div>
            <div class="item-title">${item.type} &bull; ${item.category} <span style="font-size:11px; font-family:monospace; opacity:0.8;">(${item.id})</span></div>
            <div class="item-sub">📍 ${item.location}${spotInfo} | 🕒 ${new Date(item.date).toLocaleDateString()}<br>${item.desc}</div>
          </div>
          <button type="button" class="btn-sm" onclick="openVerification('${item.id}')">Verify</button>
        </div>
      `;
    }).join('');
  }
}

// ==========================================================================
// CAMPUS QR MANAGEMENT, 6 LOCATIONS & MOBILE SCANNER
// ==========================================================================

const CAMPUS_LOCATIONS = [
  {
    id: 'block-a-204',
    name: 'Classroom Block A',
    room: 'Room A-204 (2nd Floor Smart Classroom)',
    floor: '2nd Floor',
    zone: 'Academic Wing A',
    fixit: {
      location: 'Classroom Block A',
      room: 'Room A-204, 2nd Floor',
      issue: 'Projector / AV Cable',
      urgency: 'Medium',
      desc: 'Wall-mounted HDMI port connection is loose in Room A-204'
    },
    lost: {
      location: 'Classroom Block A - Room A-204',
      category: 'Electronics',
      handover: 'Classroom Block A Reception'
    }
  },
  {
    id: 'library-study-14',
    name: 'Library',
    room: '2nd Floor Quiet Study Hall, Desk 14',
    floor: '2nd Floor',
    zone: 'Central Library',
    fixit: {
      location: 'Library',
      room: '2nd Floor Study Hall, Desk 14 power hub',
      issue: 'Switch / Plug Socket',
      urgency: 'Standard',
      desc: 'Dual desk plug socket at Study Desk 14 has no electrical power'
    },
    lost: {
      location: 'Library 2nd Floor Study Hall (Desk 14)',
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
      issue: 'AC / Cooling',
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
    name: 'Cafeteria',
    room: 'Central Food Court, Dining Table B-8',
    floor: 'Ground Floor',
    zone: 'Student Dining Hub',
    fixit: {
      location: 'Cafeteria',
      room: 'Handwash Area near West Counter',
      issue: 'Plumbing / Water',
      urgency: 'Urgent',
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
      issue: 'Lighting / Electrical',
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
      issue: 'Plumbing / Water',
      urgency: 'Urgent',
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

// Construct full QR URL with campus location parameters
function buildQRUrl(loc, service) {
  const base = window.location.origin + window.location.pathname;
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

  return `${base}?${p.toString()}`;
}

// Render the 6 Campus Location QR cards with live QRs
function renderCampusLocationsQR() {
  const container = document.getElementById('locationsQrGrid');
  if (!container) return;

  container.innerHTML = '';

  CAMPUS_LOCATIONS.forEach((loc, index) => {
    const card = document.createElement('div');
    card.className = 'location-qr-card';

    const isFixit = activePosterService === 'fixit';
    const serviceLabel = isFixit ? 'FIX-IT QR' : 'Lost@JAIN';
    const spotText = isFixit ? loc.fixit.room : loc.lost.location;
    const targetUrl = buildQRUrl(loc, activePosterService);
    const boxId = `qrCanvas_${loc.id}_${activePosterService}`;

    let paramTags = '';
    if (isFixit) {
      paramTags = `
        <span class="param-pill">Area: <strong>${loc.fixit.location}</strong></span>
        <span class="param-pill">Issue: <strong>${loc.fixit.issue}</strong></span>
        <span class="param-pill">Urgency: <strong>${loc.fixit.urgency}</strong></span>
      `;
    } else {
      paramTags = `
        <span class="param-pill">Category: <strong>${loc.lost.category}</strong></span>
        <span class="param-pill">Handover: <strong>${loc.lost.handover}</strong></span>
      `;
    }

    card.innerHTML = `
      <div class="loc-card-header">
        <div>
          <div class="loc-card-title">${loc.name}</div>
          <div class="loc-card-spot">${spotText}</div>
        </div>
        <span class="loc-card-badge">${serviceLabel}</span>
      </div>

      <div class="loc-qr-preview-box" id="${boxId}" title="Scan with mobile camera">
        <!-- Rendered by QRCode below -->
      </div>

      <div class="loc-card-params">
        ${paramTags}
      </div>

      <div class="loc-card-actions">
        <button type="button" class="btn btn-primary btn-sm" onclick="simulateLocationScan('${loc.id}', '${activePosterService}')">
          ⚡ Simulate Scan
        </button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="copyLocationUrl('${loc.id}', '${activePosterService}')" title="Copy QR link">
          Copy Link
        </button>
      </div>
    `;

    container.appendChild(card);

    // Generate crisp QR code inside the card's preview box
    const qrBox = document.getElementById(boxId);
    if (qrBox && window.QRCode) {
      try {
        new QRCode(qrBox, {
          text: targetUrl,
          width: 96,
          height: 96,
          colorDark: '#252B27',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.warn('QR render error:', err);
        qrBox.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);">[QR Code: ${loc.id}]</span>`;
      }
    } else if (qrBox) {
      qrBox.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);">[QR Code: ${loc.id}]</span>`;
    }
  });
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

function copyLocationUrl(locId, service) {
  const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
  if (!loc) return;
  const url = buildQRUrl(loc, service);
  navigator.clipboard.writeText(url).then(() => {
    toast(`Copied QR link for ${loc.name}!`, '✓');
  }).catch(() => {
    toast(`Link: ${url}`, '🔗');
  });
}

function simulateLocationScan(locId, service) {
  const loc = CAMPUS_LOCATIONS.find((l) => l.id === locId);
  if (!loc) return;

  const url = buildQRUrl(loc, service);
  closeScannerModal();
  handleScannedData(url);
}

// Modal open/close
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

// Tab Switching
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

// Camera Lifecycle & Scanning Loop
async function startCameraStream() {
  const video = document.getElementById('scannerVideo');
  const notice = document.getElementById('scannerNotice');
  const flipBtn = document.getElementById('flipCameraBtn');

  if (!video) return;

  stopCameraStream();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (notice) notice.innerHTML = `<span>Camera not supported on this browser. Try testing with the 6 campus QRs below.</span>`;
    return;
  }

  try {
    if (notice) notice.innerHTML = `<span>Starting campus camera viewfinder...</span>`;

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

    // Check if multiple cameras are available to reveal the flip button
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      if (flipBtn && videoDevices.length > 1) {
        flipBtn.style.display = 'grid';
      }
    } catch {
      // Ignore enumeration errors
    }

    startScanFrameLoop();
  } catch (err) {
    console.warn('Camera stream error:', err);
    if (notice) {
      notice.innerHTML = `<span>Camera access unavailable. Upload a photo or use the 6 campus QRs.</span>`;
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

// Continuous Frame Decoder Loop using BarcodeDetector or jsQR
function startScanFrameLoop() {
  const video = document.getElementById('scannerVideo');
  const canvas = document.getElementById('scannerCanvas') || document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const notice = document.getElementById('scannerNotice');

  // Check for native BarcodeDetector
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
          const rawValue = barcodes[0].rawValue;
          onQRDecodedSuccess(rawValue);
          return;
        }
      } else if (window.jsQR && ctx) {
        // Fallback using local jsQR library
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
    } catch (err) {
      // Ignore periodic frame detection misses
    }

    if (isScanningActive) {
      scannerAnimFrame = requestAnimationFrame(scan);
    }
  };

  scannerAnimFrame = requestAnimationFrame(scan);
}

function onQRDecodedSuccess(decodedText) {
  stopCameraStream();

  // Subtle haptic vibration if supported
  if (navigator.vibrate) {
    try { navigator.vibrate(50); } catch {}
  }

  const notice = document.getElementById('scannerNotice');
  if (notice) {
    notice.innerHTML = `<span style="color:#A3C9A8; font-weight:700;">✓ QR Detected! Loading report...</span>`;
  }

  setTimeout(() => {
    closeScannerModal();
    handleScannedData(decodedText);
  }, 350);
}

// Scan from user uploaded image
function handleQRImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      // Create canvas for decoding
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
        toast('No readable campus QR detected in this photo.', '⚠️');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Scanned Payload Parser & Router
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

// Apply pre-filled QR parameters to forms
function applyQRParameters(params) {
  const service = params.get('service') || (params.get('location') ? 'fixit' : null);
  const location = params.get('loc') || params.get('location');
  const room = params.get('room');
  const issue = params.get('issue');
  const urgency = params.get('urgency');
  const category = params.get('cat') || params.get('category');
  const handover = params.get('handover');
  const code = params.get('code');

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
      selectUrgency(urgency);
    }

    // Display QR context banner
    const banner = document.getElementById('maintQrBanner');
    if (banner) {
      const displayLoc = location || 'Campus Location';
      const displayRoom = room ? ` &bull; ${room}` : '';
      banner.innerHTML = `
        <div class="qr-banner-left">
          <span class="qr-banner-badge">QR Scanned</span>
          <span>Pre-filled from QR: <strong>${displayLoc}</strong>${displayRoom}</span>
        </div>
        <button type="button" class="qr-clear-btn" onclick="clearQRContext('maint')">Clear preset</button>
      `;
      banner.style.display = 'flex';
    }

    toast(`Location identified: ${location || 'Campus Asset'}`, '📍');

    const form = document.getElementById('maintenanceForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } else if (service === 'lost' || service === 'found') {
    const reportType = service === 'found' ? 'I FOUND SOMETHING' : 'I LOST SOMETHING';
    openLostReport(reportType);

    if (category) {
      const catSelect = document.getElementById('lCategory');
      if (catSelect) catSelect.value = category;
    }

    if (location) {
      const locInput = document.getElementById('lLocation');
      if (locInput) locInput.value = location;
    }

    if (service === 'found' && handover) {
      const handSelect = document.getElementById('fHandover');
      if (handSelect) handSelect.value = handover;
    }

    // Display QR context banner
    const banner = document.getElementById('lostQrBanner');
    if (banner) {
      const displayLoc = location || 'Campus Zone';
      banner.innerHTML = `
        <div class="qr-banner-left">
          <span class="qr-banner-badge">QR Scanned</span>
          <span>Location pre-filled: <strong>${displayLoc}</strong></span>
        </div>
        <button type="button" class="qr-clear-btn" onclick="clearQRContext('lost')">Clear preset</button>
      `;
      banner.style.display = 'flex';
    }

    toast(`Zone identified: ${location || 'Campus Zone'}`, '📍');

    const form = document.getElementById('lostForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Clear QR Context Banner & Fields
function clearQRContext(type) {
  if (type === 'maint') {
    const banner = document.getElementById('maintQrBanner');
    if (banner) banner.style.display = 'none';
    const loc = document.getElementById('mLocation');
    const room = document.getElementById('mRoom');
    if (loc) loc.value = '';
    if (room) room.value = '';
  } else {
    const banner = document.getElementById('lostQrBanner');
    if (banner) banner.style.display = 'none';
    const loc = document.getElementById('lLocation');
    if (loc) loc.value = '';
  }
  toast('Location preset cleared.', '✓');
}

// Legacy renderQR alias for compatibility
function renderQR() {
  renderCampusLocationsQR();
}

// Theme Management
function setupTheme() {
  const saved = localStorage.getItem(KEY_THEME);
  const toggleBtn = document.getElementById('themeToggleBtn');

  const updateIcon = (isDark) => {
    if (!toggleBtn) return;
    toggleBtn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    toggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  };

  if (saved === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    updateIcon(true);
  } else {
    updateIcon(false);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem(KEY_THEME, 'light');
        updateIcon(false);
        toast('Light theme enabled', '☀️');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem(KEY_THEME, 'dark');
        updateIcon(true);
        toast('Dark theme enabled', '🌙');
      }
    });
  }
}

// PWA Installation Handlers
let deferredInstallPrompt = null;

function setupPWAInstall() {
  const installBtn = document.getElementById('installAppBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  const triggerInstall = async () => {
    if (!deferredInstallPrompt) {
      toast('To install, tap your browser menu and choose "Add to Home Screen".', '📱');
      return;
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    console.log('[PWA] User choice:', choice.outcome);
    deferredInstallPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
  };

  if (installBtn) installBtn.addEventListener('click', triggerInstall);
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[Service Worker] Active:', reg.scope))
        .catch((err) => console.warn('[Service Worker] Notice:', err));
    });
  }
}

// URL Parameter Handling & Deep-links
function checkUrlParams() {
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
  }
});

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  setupTheme();
  setupPWAInstall();
  registerServiceWorker();
  renderAll();
  checkUrlParams();
});
