// content.js

function extractProducts() {
  const products = [];
  
  // Find all product cards (Shopee product URLs always contain "-i.")
  const cards = document.querySelectorAll('a[href*="-i."]');

  cards.forEach((card) => {
    try {
      const url = card.href;
      const textContent = card.innerText;
      
      let name = 'N/A';
      let price = 'N/A';
      let info = 'N/A';

      // --- 1. EXTRACT NAME (3 Fallback Methods) ---
      // Method A: Look for the specific Shopee attribute
      const nameEl = card.querySelector('div[data-sqe="name"]');
      if (nameEl && nameEl.innerText.trim() !== '') {
        name = nameEl.innerText.trim();
      } else {
        // Method B: Guess from text (find the longest line that isn't a price or sold count)
        const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        for (let line of lines) {
          if (!line.includes('RM') && !line.includes('sold') && !line.includes('%') && !line.includes('Days')) {
            name = line;
            break;
          }
        }
        // Method C: Extract directly from the URL (e.g. "IK-Yellow-Copier-Paper")
        if (name === 'N/A') {
          try {
            const urlParts = url.split('/');
            const slug = urlParts[urlParts.length - 1].split('-i.')[0];
            name = decodeURIComponent(slug).replace(/-/g, ' ');
          } catch(e) {}
        }
      }

      // --- 2. EXTRACT PRICE (Regex) ---
      // Grabs "RM" and any numbers/commas/decimals right after it
      const priceMatch = textContent.match(/RM\s*[\d,]+(\.\d+)?/i);
      if (priceMatch) {
        price = priceMatch[0];
      }

      // --- 3. EXTRACT INFO (Sold Count Regex) ---
      // Grabs numbers followed by "sold"
      const soldMatch = textContent.match(/[\d.,]+k?\+?\s*sold/i);
      if (soldMatch) {
        info = soldMatch[0];
      }

      // ALWAYS push the product. We are no longer skipping cards.
      products.push({ name, price, info, url });

    } catch (e) {
      // Ignore errors for malformed items, but log to console just in case
      console.log("Error parsing card:", e);
    }
  });

  // Remove duplicate products based on URL
  const uniqueProducts = [];
  const seenUrls = new Set();
  products.forEach(p => {
    if (!seenUrls.has(p.url)) {
      seenUrls.add(p.url);
      uniqueProducts.push(p);
    }
  });

  return uniqueProducts;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProducts') {
    sendResponse({ products: extractProducts() });
  }
  return true; 
});