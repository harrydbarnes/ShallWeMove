# Shall We Move? 🏡

> **Evidence-based home comparison for UK households.**
> Compare Rightmove listings directly against your current home. Check space, priorities, deal breakers, running costs, and English stamp duty (SDLT).

Hosted statically on GitHub Pages with zero backend, zero database, and 100% client-side privacy.

---

## Key Highlights

- **Pure Client-Side Privacy**: All listing data, financial numbers, and priorities stay in your browser’s `localStorage`. No data is ever stored remotely, and no third-party CORS proxies or web scrapers are used.
- **Three Safe Input Routes**:
  1. **Bookmarklet**: A lightweight snippet that reads `window.PAGE_MODEL` from Rightmove in your active tab and transfers it securely via URL hash `#data=...` or clipboard.
  2. **Multi-Strategy Paste Box**: Accepts raw page HTML source, `PAGE_MODEL` JSON, or plain copied listing text with field-by-field extraction status (🟢 Found, 🟡 Inferred with evidence snippets, ⚪ Missing).
  3. **Manual Entry & Editing**: Full manual form for every field so the app is always useful.
- **Text & Heuristic Analyser**: Detects loft status (`not_mentioned`, `boarded`, `boarded_with_ladder_light`, `converted_with_building_regs`), garage type (`single`, `double`, `integral`, `detached`), parking spaces, EV chargers, garden orientation, en-suite, utility room, downstairs WC, home office, solar panels, and modernisation needs—with exact quotes shown as evidence.
- **Priorities & Deal Breakers**: Set importance (`Deal breaker`, `Must have`, `Important`, `Nice to have`, `Don't care`). Listings that violate a deal breaker are immediately flagged in red.
- **UK Property Specifics**:
  - English Stamp Duty Land Tax (SDLT) calculator (Moving Home, First-Time Buyer relief, Additional Property surcharge).
  - Dual metric/imperial area formatting (sq ft and sq m).
  - Moving costs worksheet & break-even equity release calculator.
  - Auto-generated "Questions to ask the estate agent" based on missing or ambiguous listing fields.
  - Red & Green flags list (leasehold terms, price drops, flood risk, condition).
  - Multi-listing shortlist ranking and 2-listing head-to-head comparison mode.

---

## Getting Started & Local Development

### Prerequisites

- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ShallWeMove.git
cd ShallWeMove

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will start at `http://localhost:3000`.

### Running Unit Tests

```bash
# Run Vitest test suite
npm test

# Run tests in watch mode
npm run test:watch
```

---

## How the Bookmarklet Works

Rightmove prevents external websites from fetching property pages using standard Cross-Origin Resource Sharing (CORS) security policies. Furthermore, Shall We Move? does not scrape Rightmove servers.

Instead, the bookmarklet runs **within the security context of your own browser tab** while you are viewing a property on Rightmove:

1. **Read-Only Inspection**: When clicked, the bookmarklet checks `window.PAGE_MODEL.propertyData` (the structured data already delivered to your browser by Rightmove). If `PAGE_MODEL` is absent, it falls back to Schema.org JSON-LD scripts and DOM elements.
2. **Safe Serialization**: The data is encoded as JSON.
3. **Transfer**:
   - **Route A (Clipboard)**: Copies the JSON directly to your clipboard, allowing you to paste it into the "Paste Source / Text" tab.
   - **Route B (URL Hash)**: Opens your Shall We Move page passing the encoded data in the URL hash: `https://<username>.github.io/ShallWeMove/#data=<encoded_json>`. The browser hash is read purely client-side by React and is never transmitted over HTTP to any web server.

### Installation Instructions

- **Chrome / Edge / Brave (Desktop)**: Drag the "Compare on Shall We Move" link to your Bookmarks Bar (press `Ctrl+Shift+B` or `Cmd+Shift+B` to show the bar).
- **Apple Safari (Desktop)**: Drag the link to your Favorites bar (`Cmd+Shift+B`).
- **iOS Safari (iPhone & iPad)**:
  1. Copy the bookmarklet code from the Add Listing modal.
  2. Bookmark any page in Safari and name it "Shall We Move".
  3. Edit the bookmark and replace the address with the copied bookmarklet code.
  4. On any Rightmove property page, open Bookmarks and tap "Shall We Move".
- **Android Chrome**:
  1. Bookmark any page and name it "Shall We Move".
  2. Edit the bookmark and replace the URL with the copied bookmarklet code.
  3. When viewing a Rightmove listing, type "Shall We Move" in the address bar and tap the bookmark result.

---

## How to Deploy to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically tests, builds, and publishes the static site on every push to the `main` branch.

### Deployment Steps:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/ShallWeMove.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Push a commit or manually trigger the workflow under **Actions** -> **Deploy to GitHub Pages**.
4. Your application will be live at `https://<your-username>.github.io/ShallWeMove/`.
   *(Note: Vite's `base: './'` configuration ensures assets load correctly regardless of whether the site is hosted on a user page or repository subpath).*

---

## How to Add New Detected Features

The text analyser is modular and rule-based. To add detection for a new property feature (for example, *Air Conditioning*, *Heat Recovery System*, or *Wine Cellar*):

1. **Update Data Types (`src/types/property.ts`)**:
   Add the new property field to the `Property` interface:
   ```typescript
   export interface Property {
     // ...
     hasAirConditioning?: boolean;
   }
   ```
2. **Add Regex Pattern in `src/lib/analyser/textAnalyser.ts`**:
   Define regex patterns and extract evidence:
   ```typescript
   // In analysePropertyText:
   let hasAirConditioning = false;
   let airConEvidence: string | undefined;
   const acRegex = /\b(?:air conditioning|air conditioned|climate control|a\/c unit)\b/i;
   const acMatch = combinedText.match(acRegex);

   if (acMatch && acMatch.index !== undefined) {
     hasAirConditioning = true;
     airConEvidence = extractEvidenceSnippet(combinedText, acMatch.index, acMatch[0].length);
     detections.push({
       key: 'air_conditioning',
       label: 'Air Conditioning',
       detected: true,
       evidence: airConEvidence,
       confidence: 'high',
     });
   }
   ```
3. **Map into `parsePageModel` (`src/lib/parser/pageModelParser.ts`)**:
   Pass the detected value to the returned `Property` object and summary list.
4. **Add Unit Test in `src/tests/textAnalyser.test.ts`**:
   Verify that listing phrases containing the feature match and return evidence.
   ```typescript
   it('detects air conditioning', () => {
     const res = analysePropertyText('Bedrooms benefit from modern air conditioning units.');
     expect(res.allDetections.some(d => d.key === 'air_conditioning')).toBe(true);
   });
   ```

---

## Licence & Disclaimer

Shall We Move? is an open-source tool released under the MIT Licence.

*Disclaimer: Not affiliated with, endorsed by, or associated with Rightmove plc. This software is provided for personal decision support and does not constitute regulated financial, legal, surveying, or structural advice.*
