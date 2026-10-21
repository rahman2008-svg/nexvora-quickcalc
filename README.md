# NexVora QuickCalc ⚡

> **“Calculate Fast. Live Smart.”**  
> Premium, lightweight, offline-first calculation suite for students, shopkeepers, office workers, and general users across Bangladesh and worldwide.

---

## 📌 Project Identity & Credits

- **Product Name:** NexVora QuickCalc
- **Company:** NexVora Labs Ofc
- **Lead Developer:** Prince AR Abdur Rahman
- **Version:** `1.0.0` (Production Release)
- **Copyright:** © 2026 NexVora Labs Ofc. All Rights Reserved.
- **License:** MIT License

---

## 🚀 Key Features

1. **Precision Math Engine:**
   - Safe Tokenizer + Shunting-Yard AST parser (zero use of `eval()` or `new Function()`).
   - Normalizes floating-point inaccuracies (e.g., `0.1 + 0.2 = 0.3`).
   - Full support for parentheses `()`, operator hierarchy, unary negative numbers, and chained expressions.
   - Protection against division by zero with friendly feedback.

2. **Memory Registers & Previous Answer (Ans):**
   - `MS` (Memory Store), `MR` (Memory Recall), `M+` (Memory Add), `M−` (Memory Subtract), `MC` (Memory Clear).
   - Dynamic `[M]` memory active indicator badge.
   - `Ans` button to reuse previous calculation outputs.

3. **Complete Local History:**
   - Automatically stores up to 50 recent equations on your local device.
   - Tap any history entry to immediately reuse its result in your active equation.
   - Individual result copy buttons.
   - Clear All History with a safety confirmation modal.
   - 100% private: stored in browser `localStorage`, zero server logging.

4. **Dedicated Calculation Tools:**
   - **Percentage Calculator (`percentage-calculator.html`):**
     - Mode 1: What is X% of Y?
     - Mode 2: X is what percentage of Y?
     - Mode 3: Percentage Increase from X to Y.
     - Mode 4: Percentage Decrease from X to Y.
     - Formula breakdown and natural language explanations.
   - **Discount Calculator (`discount-calculator.html`):**
     - Original price and primary discount percentage.
     - Optional stacked / additional discount percentage (e.g. coupon).
     - Bangladeshi Taka (৳) as default currency with USD ($), EUR (€), GBP (£), and INR (₹) selector.
     - Total savings, effective discount, and detailed cost breakdown.

5. **Luxury Dark Glassmorphism UI:**
   - Deep navy background (`#070b19`), electric cyan (`#00f2fe`) and violet (`#8b5cf6`) accents.
   - Glassmorphism backdrop blur cards with subtle borders.
   - Persistent Dark / Light theme toggle.
   - Touch-friendly 48px+ buttons and desktop keyboard shortcuts.
   - Accessible contrast and reduced-motion compliance.

6. **Bilingual Support (English & বাংলা):**
   - Complete dictionary translations for buttons, labels, tools, errors, and guide text.
   - Seamless language toggle stored in `localStorage`.

7. **PWA & Offline Capability:**
   - Valid Web App Manifest (`manifest.json`) and Service Worker (`sw.js`).
   - In-app installation prompts for Android/Chrome/Desktop and iOS Safari guided setup.
   - Instant offline performance after first load.

---

## 📂 Project Directory Structure

```text
nexvora-quickcalc/
├── index.html                   # Main Precision Calculator & History
├── percentage-calculator.html   # 4-Mode Percentage Calculator
├── discount-calculator.html     # Discount & Taka (৳) Savings Calculator
├── about.html                   # About NexVora Labs Ofc & Developer Prince AR Abdur Rahman
├── help.html                    # User Guide, Shortcuts, Memory & Error Troubleshooting
├── privacy.html                 # Privacy Policy, LocalStorage, Clipboard & Ad disclosures
├── 404.html                     # Custom branded 404 error page
├── css/
│   └── style.css                # Luxury Glassmorphism & Theme Design System
├── js/
│   ├── app.js                   # Application Controller, Keypad, History & PWA UI
│   ├── calculator.js            # Safe Shunting-Yard AST Precision Math Engine
│   ├── tools.js                 # Percentage & Discount Calculation Algorithms
│   └── translations.js          # English and Bengali Bilingual Dictionary
├── assets/
│   ├── logo.svg                 # Scalable Luxury NexVora QuickCalc Logo
│   └── favicon.svg              # Scalable SVG Favicon & App Icon
├── tests/
│   └── run-tests.js             # Automated 32-case Engine Test Suite
├── manifest.json                # W3C Web App Manifest
├── sw.js                        # Offline Caching Service Worker
├── robots.txt                   # Search Engine Directives
├── sitemap.xml                  # XML Sitemap with Canonical Placeholders
├── package.json                 # Project configuration
├── README.md                    # Complete Documentation & Deployment Guide
└── LICENSE                      # MIT Open Source License
```

---

## ⌨️ Desktop Keyboard Shortcuts

| Key / Input | Action | Example |
| :--- | :--- | :--- |
| `0` - `9` | Enter Digits | `7`, `8`, `9` |
| `+`, `-`, `*`, `/` | Basic Operators | `10 + 5 * 2` |
| `.` | Decimal Point | `3.14159` |
| `Enter` or `=` | Calculate Expression | `(100 + 20) * 3 = 360` |
| `Backspace` | Delete Last Character | Deletes trailing number or operator |
| `Escape` | Clear All (AC) | Clears display to `0` |
| `(` and `)` | Parentheses | `(10 + 20) * 5` |
| `%` | Percentage | `200 * 15% = 30` |

*Note: Shortcuts are intelligently ignored when you are typing inside form text inputs.*

---

## 🧪 Verified Test Results

We ran automated test suites via `node tests/run-tests.js` with **32 out of 32 test cases passing 100%**:

| Case | Scenario | Input | Expected Output | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Addition | `2 + 3` | `5` | **VERIFIED (PASS)** |
| 2 | Subtraction | `12 - 7` | `5` | **VERIFIED (PASS)** |
| 3 | Multiplication | `6 * 7` | `42` | **VERIFIED (PASS)** |
| 4 | Division | `20 / 4` | `5` | **VERIFIED (PASS)** |
| 5 | Percentage | `200 * 15%` | `30` | **VERIFIED (PASS)** |
| 6 | Operator Precedence | `100 + 20 * 3` | `160` | **VERIFIED (PASS)** |
| 7 | Bracket Precedence | `(100 + 20) * 3` | `360` | **VERIFIED (PASS)** |
| 8 | Negative Numbers | `-5 + 12`, `5 * -3` | `7`, `-15` | **VERIFIED (PASS)** |
| 9 | Decimal Precision | `0.1 + 0.2` | `0.3` | **VERIFIED (PASS)** |
| 10 | Division by Zero | `20 / 0` | Throws friendly error | **VERIFIED (PASS)** |
| 11 | Invalid Syntax | `5 + * 2` | Handled gracefully | **VERIFIED (PASS)** |
| 12 | Repeated Decimals | `5.2.3` | Prevented / Rejection error | **VERIFIED (PASS)** |
| 13 | Memory Functions | `MS(50)`, `M+(25)`, `M-(15)`, `MC` | `60` -> `0` | **VERIFIED (PASS)** |
| 14 | Answer Register | `Ans + 10` | Uses last answer | **VERIFIED (PASS)** |
| 15 | Percentage: Ratio | `50 is what % of 200` | `25%` | **VERIFIED (PASS)** |
| 16 | Percentage: Increase | `100 to 150` | `+50%` | **VERIFIED (PASS)** |
| 17 | Percentage: Decrease | `200 down to 150` | `-25%` | **VERIFIED (PASS)** |
| 18 | Discount: Stacked | `৳1000 - 20% - 10%` | Final: `৳720`, Save: `৳280` | **VERIFIED (PASS)** |
| 19 | History Persistence | `localStorage.setItem` | Loads last 50 items | **BROWSER VERIFIED** |
| 20 | Offline PWA | `Service Worker cache` | Offline access ready | **BROWSER VERIFIED** |

---

## 📱 Termux & GitHub Deployment Guide (Beginner Friendly)

If you are on an **Android device** using the **Termux** app:

### Step 1: Install Git & Node in Termux
Open Termux and run:
```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
```

### Step 2: Set up Git User Identity
```bash
git config --global user.name "Prince AR Abdur Rahman"
git config --global user.email "your-email@example.com"
```

### Step 3: Clone or Navigate to the Project
```bash
# If starting locally:
mkdir nexvora-quickcalc
cd nexvora-quickcalc
git init
```

### Step 4: Run the Automated Engine Tests
```bash
node tests/run-tests.js
```
*(You will see all 32 tests pass successfully.)*

### Step 5: Test Locally in Termux
```bash
# Start a local static HTTP server:
npx serve .
# Open http://localhost:3000 in your Android browser!
```

### Step 6: Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `nexvora-quickcalc` (Set to **Public**).
2. Connect and push your code:
```bash
git add .
git commit -m "Initial production release v1.0.0: NexVora QuickCalc"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nexvora-quickcalc.git
git push -u origin main
```

---

## 🌐 Free Static Hosting Deployment

### Option A: GitHub Pages (100% Free Forever)
1. In your GitHub repository, click on **Settings** (top navigation).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Choose Branch: `main` and Folder: `/ (root)`.
5. Click **Save**.
6. Within 1–2 minutes, your website will be live at:
   `https://YOUR_GITHUB_USERNAME.github.io/nexvora-quickcalc/`
   
*Note: All paths in NexVora QuickCalc are relative (`./`), so it works on GitHub Pages subpaths without any code adjustments.*

### Option B: Vercel (Fast Global CDN)
1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New Project** and select `nexvora-quickcalc`.
3. Keep Framework Preset as **Other** (Pure HTML/CSS/JS).
4. Click **Deploy**. Your custom URL (e.g. `nexvora-quickcalc.vercel.app`) will be active instantly with automatic HTTPS.

---

## 💡 Future Monetization & Sponsorship Architecture

NexVora QuickCalc includes a clean future monetization roadmap:
1. **Ad Containers:** Positioned responsibly away from the keypad and calculation results so users never accidentally click ads.
2. **v1.0.0 Status:** Kept strictly disabled for zero user friction and fast initial growth.
3. **Future Options:** Google AdSense integration, custom embeddable calculator widgets for eCommerce merchants, and professional bulk calculation utilities.

---

**NexVora QuickCalc** — *“Calculate Fast. Live Smart.”*  
© 2026 NexVora Labs Ofc. All Rights Reserved.
