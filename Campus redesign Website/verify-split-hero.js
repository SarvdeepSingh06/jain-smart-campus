const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'verify.log');
function log(...args) {
  fs.appendFileSync(logFile, args.join(' ') + '\n');
}

fs.writeFileSync(logFile, 'Starting verify audit...\n');

const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/b08dc2a0-fba6-4888-8466-8c3bd4b258f9';

async function runAudit() {
  try {
    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 390, height: 844 }
    ];

    for (const vp of viewports) {
      log(`Testing viewport ${vp.name}...`);
      const win = new BrowserWindow({
        width: vp.width,
        height: vp.height,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      win.webContents.on('console-message', (e, level, message, line, sourceId) => {
        log(`[Renderer Console] ${message} (${sourceId}:${line})`);
      });

      await win.loadURL('http://localhost:3000/');
      await new Promise(r => setTimeout(r, 800));

      // Check overflow
      const overflowCheck = await win.webContents.executeJavaScript(`
        ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          bodyScroll: document.body.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
      `);
      log(`[Viewport: ${vp.name}] ${JSON.stringify(overflowCheck)}`);

      // Capture homepage split hero
      const image = await win.webContents.capturePage();
      const outPath = path.join(ARTIFACT_DIR, `split-hero-${vp.name}.png`);
      fs.writeFileSync(outPath, image.toPNG());
      log(`Saved ${outPath}`);

      if (vp.name === 'desktop') {
        const modalInfo = await win.webContents.executeJavaScript(`
          openInstallModal();
          const el = document.querySelector('.install-modal-card');
          const cs = window.getComputedStyle(el);
          ({
            bg: cs.backgroundColor,
            opacity: cs.opacity,
            display: cs.display,
            overlayBg: window.getComputedStyle(document.getElementById('installAppModal')).backgroundColor
          })
        `);
        log('Modal Info: ' + JSON.stringify(modalInfo));
        await new Promise(r => setTimeout(r, 400));
        const modalImg = await win.webContents.capturePage();
        const modalPath = path.join(ARTIFACT_DIR, 'split-hero-install-modal.png');
        fs.writeFileSync(modalPath, modalImg.toPNG());
        log(`Saved ${modalPath}`);
      }

      if (vp.name === 'mobile') {
        await win.webContents.executeJavaScript(`toggleMobileMenu(true);`);
        await new Promise(r => setTimeout(r, 300));
        const drawerImg = await win.webContents.capturePage();
        const drawerPath = path.join(ARTIFACT_DIR, 'split-hero-mobile-drawer.png');
        fs.writeFileSync(drawerPath, drawerImg.toPNG());
        log(`Saved ${drawerPath}`);
      }

      win.close();
    }
  } catch (err) {
    log('ERROR:', err.stack || err);
  } finally {
    app.quit();
  }
}

app.whenReady().then(runAudit);

