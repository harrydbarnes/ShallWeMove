# Shall We Move? 🏡

> **Evidence-based home comparison for UK households.**
> Compare Rightmove and Zoopla listings against your current home. Check space, priorities, deal breakers, running costs, and English stamp duty (SDLT).

Hosted statically on GitHub Pages with browser-local saved homes and finances, and public external services for location and sold-price lookups.

---

## Key Highlights

- **Browser-Local Storage**: Listing data, financial numbers, and priorities are saved in your browser’s `localStorage`. Address suggestions and explicit sales lookups send location queries to public data services; map tiles load from OpenStreetMap. No third-party CORS proxies or web scrapers are used.
- **Three Safe Input Routes**:
  1. **Bookmarklet**: Runs on an individual Rightmove or Zoopla for-sale listing. It copies listing data from the open tab for you to paste into the app.
  2. **Multi-Strategy Paste Box**: Accepts raw page HTML source, Rightmove `PAGE_MODEL` JSON, Zoopla bookmarklet JSON, or plain copied listing text with field-by-field extraction status (🟢 Found, 🟡 Inferred with evidence snippets, ⚪ Missing).
  3. **Manual Entry & Editing**: Full manual form for every field so the app is always useful.
- **Text & Heuristic Analyser**: Detects loft status (`not_mentioned`, `boarded`, `boarded_with_ladder_light`, `converted_with_building_regs`), garage type (`single`, `double`, `integral`, `detached`), parking spaces, EV chargers, garden orientation, en-suite, utility room, downstairs WC, home office, solar panels, and modernisation needs—with exact quotes shown as evidence.
- **Priorities & Deal Breakers**: Set importance (`Deal breaker`, `Must have`, `Important`, `Nice to have`, `Don't care`). Listings that violate a deal breaker are immediately flagged in red.
- **Named Homes & Map**: Give each saved listing a name, rename it in the shortlist, and compare two named homes. The Map view plots known coordinates and can locate missing pins using postcodes.io or Photon after you choose to do so; each home also has a Google Maps link. Pins are approximate.
- **Data Confidence**: The verdict labels how complete the imported listing evidence is, and distinguishes samples and manual entries. It is not a prediction about the move or a property survey.
- **Nearby Completed Sales**: In Map and Location, explicitly load HM Land Registry standard residential sales around an England or Wales postcode. Choose a 250m, 500m or 1km radius and 2 or 5 years. Filter by property type and new build, explore quarterly medians and volumes, and select quarters to filter sale records and map markers. Postcodes.io supplies up to 100 active nearby postcodes; the latest 2,000 sales are retained, with visible coverage warnings. Pins are postcode centres. The latest two months are incomplete; medians reflect the mix of homes sold, not a valuation or a house-price index. Results are cached in memory for an hour, with manual refresh.
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

Property portals do not provide this static app with a reliable direct URL import. Shall We Move? does not scrape their servers.

The bookmarklet runs in your own browser tab while you are viewing an individual Rightmove or Zoopla for-sale listing:

1. **Read-Only Inspection**: On Rightmove it reads `window.PAGE_MODEL.propertyData`, with a JSON-LD fallback. On Zoopla it copies the visible listing text and heading for local extraction.
2. **Safe Serialization**: The data is encoded as JSON.
3. **Transfer**:
   - **Route A (Clipboard)**: Copies the JSON directly to your clipboard, allowing you to paste it into the "Paste Source / Text" tab.
   - **Route B (URL Hash)**: The optional direct-transfer bookmarklet opens Shall We Move with encoded data in the URL hash. The hash is read by React and is not part of the HTTP request.

### Installation Instructions

- **Chrome / Edge / Brave (Desktop)**: Drag the "Compare on Shall We Move" link to your Bookmarks Bar (press `Ctrl+Shift+B` or `Cmd+Shift+B` to show the bar).
- **Apple Safari (Desktop)**: Drag the link to your Favorites bar (`Cmd+Shift+B`).
- **iOS Safari (iPhone & iPad)**:
  1. Copy the bookmarklet code from the Add Listing modal.
  2. Bookmark any page in Safari and name it "Shall We Move".
  3. Edit the bookmark and replace the address with the copied bookmarklet code.
  4. On an individual Rightmove or Zoopla for-sale page, open Bookmarks and tap "Shall We Move".
- **Android Chrome**:
  1. Bookmark any page and name it "Shall We Move".
  2. Edit the bookmark and replace the URL with the copied bookmarklet code.
  3. When viewing a Rightmove or Zoopla listing, type "Shall We Move" in the address bar and tap the bookmark result.

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

*Disclaimer: Not affiliated with, endorsed by, or associated with Rightmove or Zoopla. This software is provided for personal decision support and does not constitute regulated financial, legal, surveying, or structural advice.*
