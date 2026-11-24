# JAIN Smart Campus — Minimal Campus Reporting Platform

A minimal, modern, and intuitive campus utility platform designed for JAIN University to simplify reporting lost & found belongings (**Lost@JAIN**) and classroom/campus facility issues (**FIX-IT QR**).

---

## ✨ Key Features

- **Focused Homepage**: Warm ivory & forest green palette, clean typography, zero clutter.
- **Lost@JAIN Dual Flow**:
  - Contextual reporting for *"I lost something"* vs. *"I found something"*.
  - Handover and storage location tracking for campus security & reception desks.
  - Transparent privacy guarantees for student contact info.
- **FIX-IT QR Maintenance Flow**:
  - Precise campus building, room, and equipment selection.
  - Urgency indicators (Low, Standard, Medium, Urgent).
  - Optional photo attachment with instant preview.
- **Mobile QR Scanner**:
  - Top right corner scanner button optimized for mobile thumb reach.
  - Live camera viewfinder using device camera (`facingMode: environment`) with flip toggle.
  - Reticle overlay, scan laser animation, and continuous frame decoding via `BarcodeDetector` / `jsQR`.
  - Photo upload fallback to decode QR codes directly from gallery images.
- **6 Campus Location Presets & QR Posters**:
  - Pre-configured locations across Classroom Block A, Library, Lab Complex, Cafeteria, Sports Area, and Hostels.
  - Real-time offline QR generation and 1-tap "⚡ Simulate Scan" testing.
- **Submission Confirmation State**:
  - Collision-safe unique reference generation (`LOST-XXXX-YYYY`, `FND-XXXX-YYYY`, `FIX-XXXX-YYYY`).
  - Clear next-steps summary and duplicate submission prevention.
- **PWA & Offline First**:
  - Service Worker offline caching for zero-dependency local performance.
  - Light and Dark mode toggle with accessible contrast ratios.

---

## 🚀 Quick Start

### 1. Web Application (Local Server)
- **Windows (1-click)**: Double-click `run-web-server.bat`
- **Via Terminal**:
  ```bash
  node server.js
  ```
  Open [http://localhost:3000/](http://localhost:3000/) in your browser.

### 2. Native Desktop App (Electron)
- **Windows (1-click)**: Double-click `run-desktop-app.bat`
- **Via Terminal**:
  ```bash
  npm install
  npm start
  ```

---

## 📁 Project Structure

```
├── index.html            # Main web UI and layout
├── styles.css            # Responsive design system & dark mode
├── app.js                # Core frontend engine, state, QR scanner & parameters
├── qrcode.min.js         # Offline QR code generator
├── jsqr.min.js           # Offline camera QR code decoder
├── sw.js                 # Service Worker (PWA offline caching)
├── manifest.json         # PWA Web App Manifest
├── icon.svg              # App icon & branding
├── DESIGN.md             # Design direction, palette tokens & anti-slop rules
├── AGENTS.md             # Agent coding standards & anti-slop pointer
├── server.js             # Zero-dependency local Node.js HTTP server
├── main.js               # Electron desktop window wrapper
├── package.json          # Project metadata & npm scripts
├── run-web-server.bat    # 1-click batch launcher for Web Server
└── run-desktop-app.bat   # 1-click batch launcher for Electron
```

---

## 🎨 Visual Identity
- **Primary Background**: `#F7F8F5` (Warm Ivory)
- **Primary Text**: `#252B27` (Deep Charcoal)
- **Primary Accent**: `#315C49` (Forest Green)
- **Secondary Surface**: `#E8EEE8` (Soft Sage)
- **Typography**: Inter (system sans-serif fallback)
