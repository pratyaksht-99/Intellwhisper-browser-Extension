self.addEventListener('install', event => {
  console.log('IntellWhisper service worker installed.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('IntellWhisper service worker activated.');
});

// Example: create a context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'iw_extract_selection',
    title: 'IntellWhisper: Extract selection',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'iw_extract_selection') {
    chrome.tabs.sendMessage(tab.id, {type: 'extractSelection', text: info.selectionText});
  }
});
