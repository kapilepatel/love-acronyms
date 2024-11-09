// Regex for acronym detection
//only capital case
//const acronymRegex = /\b([A-Z]{2,}(?:\.[A-Z]{2,})*)\b/g;

const acronymRegex = /\b([A-Z]{2,}|\b[a-z]{2,})\b(?=([^\w]|$))/g;

function processAcronyms(acronyms) {
  function replaceAcronym(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const originalText = node.textContent;
      try {
        node.parentNode.innerHTML = node.parentNode.innerHTML.replace(originalText, originalText.replace(acronymRegex, (match, p1) => {
          if (acronyms[p1]) {
            const span = document.createElement('span');
            span.textContent = p1;
            span.setAttribute('title', acronyms[p1]);
            return span.outerHTML;
          }
          return p1;
        }));

      } catch (error) {
        console.error('Error in text replacement:', error);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script and style tags
      if (node.tagName && (node.tagName.toLowerCase() === 'script' || node.tagName.toLowerCase() === 'style')) {
        return;
      }
      try {
        for (let child of node.childNodes) {
          replaceAcronym(child);
        }
      } catch (error) {
        console.error('Error processing child nodes:', error);
      }
    }
  }

  try {
    replaceAcronym(document.body);
  } catch (error) {
    console.error('Error processing document body:', error);
  }
}

// Initial run
chrome.storage.local.get(["acronyms"], function(result) {
  if (!result.acronyms) {
    chrome.runtime.sendMessage({ action: 'getAcronyms' }, function(response) {
      if (response && response.acronyms) {
        chrome.storage.local.set({ acronyms: response.acronyms });
        console.log('Acronyms loaded:', response.acronyms);
        processAcronyms(response.acronyms);
      } else {
        console.error('Failed to load acronyms or response was invalid:', response);
      }
    });
  } else {
    console.log('Acronyms from storage:', result.acronyms);
    processAcronyms(result.acronyms);
  }
});

// Setup observer for dynamic content
// const observer = new MutationObserver(mutations => {
//   mutations.forEach(mutation => {
//     if (mutation.type === 'childList') {
//       mutation.addedNodes.forEach(node => {
//         if (node.nodeType === Node.ELEMENT_NODE) {
//           try {
//             chrome.storage.local.get(["acronyms"], function(result) {
//               processAcronyms(result.acronyms);
//             });
//           } catch (error) {
//             console.error('Error in observer node processing:', error);
//           }
//         }
//       });
//     }
//   });
// });
// observer.observe(document.body, { childList: true, subtree: true });

