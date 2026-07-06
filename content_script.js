/* IntellWhisper Content Script
   - Injects a Shadow DOM floating UI
   - Listens for messages from service worker/popup
   - Simple automation rule runner (stored in chrome.storage)
*/

(function() {
  // create shadow root container
  const host = document.createElement('div');
  host.id = 'intellwhisper-root';
  host.style.all = 'initial';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({mode: 'open'});

  // basic styles and a small floating panel
  const style = document.createElement('style');
  style.textContent = `
    .iw-panel {
      font-family: Arial, sans-serif;
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 2147483647;
      background: white;
      border: 1px solid #999;
      padding: 8px;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
      width: 240px;
    }
    .iw-title { font-weight: bold; margin-bottom: 6px; }
    .iw-btn { padding:6px 8px; margin-top:6px; display:inline-block; cursor:pointer; border:1px solid #ccc; border-radius:4px; }
    .iw-log { font-size:12px; color:#333; max-height:100px; overflow:auto; margin-top:6px; background:#f9f9f9; padding:6px; border-radius:4px; }
  `;
  shadow.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'iw-panel';
  panel.innerHTML = `
    <div class="iw-title">IntellWhisper</div>
    <div>Mode: <span id="iw-mode">idle</span></div>
    <div><button id="iw-run" class="iw-btn">Run Rules</button> <button id="iw-extract" class="iw-btn">Extract Tables</button></div>
    <div class="iw-log" id="iw-log"></div>
  `;
  shadow.appendChild(panel);

  const log = shadow.getElementById('iw-log');
  function appendLog(s){ const p = document.createElement('div'); p.textContent = s; log.appendChild(p); }

  // rules engine: get rules from storage and apply simple operations
  async function runRules() {
    appendLog('Loading rules...');
    const data = await new Promise(res => chrome.storage.sync.get(['rules'], res));
    const rules = data.rules || [];
    appendLog(`Found ${rules.length} rule(s).`);
    for (const r of rules) {
      try {
        appendLog(`Applying rule: ${r.name}`);
        if (r.action === 'click') {
          const el = document.querySelector(r.selector);
          if (el) { el.click(); appendLog(`Clicked ${r.selector}`); } else appendLog(`Selector not found: ${r.selector}`);
        } else if (r.action === 'fill') {
          const el = document.querySelector(r.selector);
          if (el) { el.value = r.value; el.dispatchEvent(new Event('input', {bubbles:true})); appendLog(`Filled ${r.selector}`); } else appendLog(`Selector not found: ${r.selector}`);
        } else if (r.action === 'hide') {
          const els = document.querySelectorAll(r.selector);
          els.forEach(e=> e.style.display='none');
          appendLog(`Hidden ${r.selector} (${els.length})`);
        } else {
          appendLog('Unknown action: ' + r.action);
        }
      } catch (e) {
        appendLog('Rule error: ' + e.message);
      }
    }
  }

  // a small extractor: capture first table on page as CSV
  function extractTables() {
    const tables = document.querySelectorAll('table');
    if (!tables.length) { appendLog('No tables found'); return; }
    const t = tables[0];
    const rows = Array.from(t.rows).map(r => Array.from(r.cells).map(c => c.innerText.replace(/\n/g,' ').trim()).join(','));
    const csv = rows.join('\n');
    appendLog('Extracted table with ' + rows.length + ' rows');
    // send back to background/popup by creating a small download
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'intellwhisper_table.csv'; a.textContent = 'download';
    appendLog('Table ready — click to download');
    const dl = document.createElement('div'); dl.appendChild(a);
    log.appendChild(dl);
  }

  // message listener from service worker / popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'runRules') {
      runRules().then(()=> sendResponse({status:'ok'}));
      return true;
    } else if (msg.type === 'extractSelection') {
      appendLog('Extracted selection: ' + (msg.text||''));
    } else if (msg.type === 'extractTables') {
      extractTables();
    }
  });

  // UI buttons
  shadow.getElementById('iw-run').addEventListener('click', () => {
    runRules();
  });
  shadow.getElementById('iw-extract').addEventListener('click', () => {
    extractTables();
  });

  appendLog('IntellWhisper content script loaded.');
})();
