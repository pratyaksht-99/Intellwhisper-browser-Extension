function renderRules(rules){
  const el = document.getElementById('rulesList');
  el.innerHTML = '';
  rules.forEach((r, i) => {
    const d = document.createElement('div'); d.className='ruleItem';
    d.textContent = (i+1)+'. '+r.name+' ['+r.action+'] -> '+r.selector + (r.value?(' = '+r.value):'');
    el.appendChild(d);
  });
}

document.getElementById('add').addEventListener('click', async () => {
  const selector = document.getElementById('sel').value.trim();
  const action = document.getElementById('act').value;
  const value = document.getElementById('val').value;
  if (!selector) return alert('Enter selector');
  const newRule = { name: action+':'+selector, action, selector, value };
  const data = await new Promise(res => chrome.storage.sync.get(['rules'], res));
  const rules = data.rules || [];
  rules.push(newRule);
  chrome.storage.sync.set({rules}, () => {
    renderRules(rules);
    document.getElementById('sel').value=''; document.getElementById('val').value='';
  });
});

document.getElementById('run').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  chrome.tabs.sendMessage(tab.id, {type:'runRules'}, resp => {});
});
document.getElementById('extract').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  chrome.tabs.sendMessage(tab.id, {type:'extractTables'}, resp => {});
});

// load rules on open
chrome.storage.sync.get(['rules'], data => {
  renderRules(data.rules || []);
});
