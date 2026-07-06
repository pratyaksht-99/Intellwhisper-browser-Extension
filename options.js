function show(msg){ document.getElementById('out').textContent = msg; }

document.getElementById('export').addEventListener('click', () => {
  chrome.storage.sync.get(['rules'], data => {
    show(JSON.stringify(data.rules || [], null, 2));
  });
});

document.getElementById('import').addEventListener('click', () => {
  const json = prompt('Paste rules JSON array');
  try {
    const rules = JSON.parse(json || '[]');
    chrome.storage.sync.set({rules}, () => show('Imported ' + (rules.length||0) + ' rules.'));
  } catch(e) { alert('Invalid JSON'); }
});

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.sync.set({rules:[]}, () => show('Cleared rules.'));
});

// show on load
chrome.storage.sync.get(['rules'], d => show(JSON.stringify(d.rules||[], null, 2)));
