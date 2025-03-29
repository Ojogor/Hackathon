// Set up context menu and onboarding on installation
chrome.runtime.onInstalled.addListener((details) => {
  // Always recreate context menu (to ensure updates apply)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "findCanadian",
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["selection"]
    });
  });
  // Open onboarding page on first install
  if (details.reason === "install") {
    chrome.tabs.create({ url: "onboarding.html" });
    // Initialize default stats and favorites
    chrome.storage.local.set({
      stats: { chosen: 0, co2: 0, jobs: 0 },
      favorites: {}
    });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "findCanadian" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    if (selectedText.length === 0) return;
    // Open the extension popup with the selected text as query
    if (chrome.action.openPopup) {
      chrome.storage.local.set(
        { searchQuery: selectedText, trigger: "contextMenu" },
        () => chrome.action.openPopup()
      );
    } else {
      const url = chrome.runtime.getURL("popup.html?query=" + encodeURIComponent(selectedText));
      chrome.tabs.create({ url });
    }
  }
});

// Notify user on visiting known shopping sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const shoppingSites = ["amazon.", "ebay.", "walmart.", "bestbuy.", "etsy."];
    if (shoppingSites.some(site => tab.url.includes(site))) {
      const domainKey = shoppingSites.find(site => tab.url.includes(site)) || "";
      if (domainKey) {
        chrome.storage.local.get("notifiedSites", data => {
          const notified = data.notifiedSites || {};
          if (!notified[domainKey]) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: chrome.runtime.getURL("icon128.png"),
              title: chrome.i18n.getMessage("notification_title"),
              message: chrome.i18n.getMessage("notification_message")
            });
            notified[domainKey] = true;
            chrome.storage.local.set({ notifiedSites: notified });
          }
        });
      }
    }
  }
});
