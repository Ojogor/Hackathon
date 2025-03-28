// Set up the context menu on extension installation.
chrome.runtime.onInstalled.addListener(() => {
    // Create a context menu item for selected text (highlighted product name).
    chrome.contextMenus.create({
      id: "findCanadian",
      title: 'Find Canadian alternatives for "%s"',  // %s will be replaced by the selected text&#8203;:contentReference[oaicite:0]{index=0}
      contexts: ["selection"]
    });
  });
  
  // Handle clicks on the context menu item.
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "findCanadian" && info.selectionText) {
      const selectedText = info.selectionText.trim();
      if (selectedText.length === 0) return;
      // Use the highlighted text as the search query.
      // If possible, open the extension popup to display results.
      if (chrome.action.openPopup) {
        // Store the query so the popup can access it, then open the popup.
        chrome.storage.local.set({ searchQuery: selectedText, trigger: "contextMenu" }, () => {
          chrome.action.openPopup();  // Requires Chrome 127+&#8203;:contentReference[oaicite:1]{index=1}
        });
      } else {
        // Fallback: open the popup page in a new tab with the query as a URL parameter.
        const url = chrome.runtime.getURL("popup.html?query=" + encodeURIComponent(selectedText));
        chrome.tabs.create({ url });
      }
    }
  });
  