/**
 * Installation instructions for the Shall We Move bookmarklet across desktop and mobile browsers.
 */

export interface BrowserInstruction {
  browser: string;
  device: 'desktop' | 'mobile';
  icon: string;
  steps: string[];
  tip?: string;
}

export const BOOKMARKLET_GUIDES: BrowserInstruction[] = [
  {
    browser: 'Chrome / Brave / Edge',
    device: 'desktop',
    icon: 'Chrome',
    steps: [
      'Ensure your Bookmarks Bar is visible (press Ctrl+Shift+B on Windows or Cmd+Shift+B on Mac).',
      'Drag the green "Compare on Shall We Move" button directly onto your bookmarks bar.',
      'Alternatively, click "Copy Bookmarklet Code", right-click your bookmarks bar, choose "Add page...", name it "Shall We Move", and paste the code into the URL field.',
      'Navigate to any Rightmove listing page (e.g. rightmove.co.uk/properties/...) and click your new bookmarklet.',
    ],
    tip: 'The bookmarklet never stores your personal data or communicates with external servers; it runs entirely within your active browser tab.',
  },
  {
    browser: 'Apple Safari',
    device: 'desktop',
    icon: 'Compass',
    steps: [
      'Show your Favorites Bar by pressing Cmd+Shift+B in Safari.',
      'Drag the bookmarklet link directly onto your Safari Favorites bar.',
      'Alternatively, create a new bookmark for any page, click "Edit Bookmarks", rename it, and replace the address with the copied bookmarklet code.',
      'On any Rightmove listing page, click the bookmark in your Favorites bar.',
    ],
  },
  {
    browser: 'iOS Safari (iPhone & iPad)',
    device: 'mobile',
    icon: 'Smartphone',
    steps: [
      'Copy the bookmarklet code using the "Copy Bookmarklet Code" button below.',
      'Bookmark this current page in Safari: tap the Share button (square with arrow) -> "Add Bookmark", title it "Shall We Move", and tap Save.',
      'Open your Safari Bookmarks (the open book icon), tap "Edit" at the bottom right, and tap on your new "Shall We Move" bookmark.',
      'Delete the existing address, paste the bookmarklet code you copied, and tap "Done".',
      'When browsing Rightmove on your iPhone/iPad, tap the Bookmarks icon and select "Shall We Move" to copy the listing data instantly.',
    ],
    tip: 'You can also type "Shall We Move" into Safari\'s address bar on a Rightmove page to trigger the bookmarklet.',
  },
  {
    browser: 'Android Chrome',
    device: 'mobile',
    icon: 'Smartphone',
    steps: [
      'Copy the bookmarklet code below.',
      'Bookmark any page in Chrome by tapping the three-dots menu -> star icon.',
      'Tap "Edit" on the confirmation bar (or find the bookmark in menu -> Bookmarks), rename it "Shall We Move", and paste the code into the URL field.',
      'While viewing a Rightmove listing, tap Chrome’s address bar, type "Shall We Move", and tap the bookmark suggestion that appears with the star icon.',
    ],
  },
];
