const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'Desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'Desktop-1440x900', width: 1440, height: 900 },
  { name: 'Desktop-1366x768', width: 1366, height: 768 },
  { name: 'Tablet-768x1024', width: 768, height: 1024 },
  { name: 'Mobile-430x932', width: 430, height: 932 },
  { name: 'Mobile-390x844', width: 390, height: 844 },
  { name: 'Mobile-360x800', width: 360, height: 800 }
];

app.whenReady().then(async () => {
  const results = [];
  const screenshotDir = path.join(__dirname, 'audit-screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

  for (const vp of VIEWPORTS) {
    const win = new BrowserWindow({
      width: vp.width,
      height: vp.height,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await win.loadURL('http://localhost:3000/');
    await new Promise(r => setTimeout(r, 600)); // wait for transitions

    const pageMetrics = await win.webContents.executeJavaScript(`
      (() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHorizontalOverflow = docWidth > winWidth;
        
        const hero = document.querySelector('.hero-cinematic-viewport');
        const heroHeight = hero ? hero.offsetHeight : 0;
        const heroVisibleRatio = hero ? (heroHeight / window.innerHeight).toFixed(2) : 0;
        
        const heading = document.querySelector('.hero-display-heading');
        const headingText = heading ? heading.innerText.trim() : '';
        const headingFontSize = heading ? window.getComputedStyle(heading).fontSize : '';
        
        const serviceCards = Array.from(document.querySelectorAll('.service-card'));
        const cardMetrics = serviceCards.map(c => ({
          title: c.querySelector('.service-card-title')?.innerText,
          width: c.offsetWidth,
          height: c.offsetHeight
        }));

        const infoStrip = document.querySelector('.hero-info-strip');
        const infoStripVisible = !!infoStrip;
        const infoStripHeight = infoStrip ? infoStrip.offsetHeight : 0;

        return {
          docWidth,
          winWidth,
          hasHorizontalOverflow,
          heroHeight,
          heroVisibleRatio,
          headingText,
          headingFontSize,
          cardMetrics,
          infoStripVisible,
          infoStripHeight
        };
      })()
    `);

    // Capture screenshot
    const image = await win.webContents.capturePage();
    const screenshotPath = path.join(screenshotDir, `${vp.name}.png`);
    fs.writeFileSync(screenshotPath, image.toPNG());

    results.push({
      viewport: vp.name,
      ...pageMetrics,
      screenshot: screenshotPath
    });

    win.close();
  }

  // Functional verification on Desktop
  const testWin = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false
  });
  await testWin.loadURL('http://localhost:3000/');
  await new Promise(r => setTimeout(r, 500));

  const functionalTests = await testWin.webContents.executeJavaScript(`
    (() => {
      const results = {};
      
      // Test 1: Click Lost@JAIN
      const lostCard = document.querySelector('.service-card-lost');
      if (lostCard) {
        lostCard.click();
        const lostChoiceView = document.getElementById('viewLostChoice');
        results.lostCardOpensFlow = lostChoiceView && lostChoiceView.style.display !== 'none';
        
        // Click Back
        const backBtn = lostChoiceView?.querySelector('.back-link-btn');
        if (backBtn) backBtn.click();
        const homeView = document.getElementById('viewHome');
        results.lostBackReturnsHome = homeView && homeView.classList.contains('active');
      }

      // Test 2: Click Fix-it QR
      const fixitCard = document.querySelector('.service-card-fixit');
      if (fixitCard) {
        fixitCard.click();
        const maintView = document.getElementById('viewMaintForm');
        results.fixitOpensFlow = maintView && maintView.style.display !== 'none';
        
        // Click Back
        const backBtn = maintView?.querySelector('.back-link-btn');
        if (backBtn) backBtn.click();
        const homeView = document.getElementById('viewHome');
        results.fixitBackReturnsHome = homeView && homeView.classList.contains('active');
      }

      // Test 3: Scan QR Modal
      const scannerBtn = document.getElementById('openScannerBtn');
      if (scannerBtn) {
        scannerBtn.click();
        const modal = document.getElementById('scannerModal');
        results.scannerModalOpens = modal && modal.style.display !== 'none';
        closeScannerModal();
        results.scannerModalCloses = modal && modal.style.display === 'none';
      }

      // Test 4: Theme Toggle
      const themeBtn = document.getElementById('themeToggleBtn');
      const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      if (themeBtn) {
        themeBtn.click();
        const newTheme = document.documentElement.getAttribute('data-theme');
        results.themeToggleWorks = initialTheme !== newTheme;
        // toggle back
        themeBtn.click();
      }

      // Test 5: Accessible labels & alt text
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;
      const buttonsWithoutLabel = Array.from(document.querySelectorAll('button:not([aria-label]):not([title])'))
        .filter(b => !b.innerText.trim()).length;

      results.imagesWithoutAlt = imagesWithoutAlt;
      results.buttonsWithoutLabel = buttonsWithoutLabel;

      return results;
    })()
  `);

  testWin.close();

  const reportPath = path.join(__dirname, 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ viewports: results, functional: functionalTests }, null, 2));
  console.log('AUDIT_COMPLETED_SUCCESSFULLY');
  app.quit();
});
