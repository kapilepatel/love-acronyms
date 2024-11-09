console.log("Background script running");

// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAcronyms') {
        
        getAcronyms().then(sendResponse);
        return true; 
    }
  });


  async function getAcronyms() {
    try {
      let response = await fetch(chrome.runtime.getURL('acronyms.json'));
      if (!response.ok) throw new Error('Failed to fetch acronyms');
      let acronyms = await response.json();
      return { acronyms: acronyms };
    } catch (error) {
      console.error('Error in fetching acronyms:', error);
      return {error: 'Failed to retrieve acronyms'};
    }
  }
