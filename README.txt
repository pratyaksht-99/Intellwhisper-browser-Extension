IntellWhisper — Chrome Extension (Manifest V3)
Files:
- manifest.json
- service_worker.js
- content_script.js
- popup.html / popup.js / popup.css
- options.html / options.js

Quick install (developer mode):
1. Open chrome://extensions
2. Toggle 'Developer mode' ON
3. Click 'Load unpacked' -> select the folder containing these files (the folder with manifest.json)
4. The extension will appear in the toolbar. Click it to open the popup.

What it does (demo features):
- Injects a small floating UI (Shadow DOM) on every page.
- Lets you add simple automation rules (click/fill/hide) saved to chrome.storage.sync.
- Runs rules on the current tab (via popup) or automatically via content script.
- Extracts the first HTML table to CSV and offers a download link.
- Adds a context menu to capture selected text.

Notes and next steps:
- Add authentication and secure native messaging if you need server-side processing.
- Add rule scheduling, per-site profiles, and advanced selectors with XPath.
- Improve UX for rule creation (smart selector picker), and add safe-guards for destructive actions.
