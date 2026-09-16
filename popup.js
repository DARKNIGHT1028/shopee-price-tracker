// popup.js

document.getElementById('exportBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const btnEl = document.getElementById('exportBtn');
  const sortOption = document.getElementById('sortOption').value;
  
  statusEl.textContent = 'Extracting...';
  btnEl.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('shopee.com.my')) {
      statusEl.textContent = 'Error: Please open a Shopee Malaysia page first.';
      btnEl.disabled = false;
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getProducts' });

    if (!response || !response.products || response.products.length === 0) {
      statusEl.textContent = 'No products found. Please refresh the page and try again.';
      btnEl.disabled = false;
      return;
    }

    let products = response.products;

    // --- ORGANIZE DATA: Sorting Logic ---
    if (sortOption === 'priceLow' || sortOption === 'priceHigh') {
      products.sort((a, b) => {
        // Extract numbers from price string (e.g. "RM1,200.50" -> 1200.50)
        const getPriceVal = (p) => {
          if (!p || p === 'N/A') return 0;
          let clean = p.replace(/RM/i, '').replace(/,/g, '').trim();
          return parseFloat(clean) || 0;
        };
        const priceA = getPriceVal(a.price);
        const priceB = getPriceVal(b.price);
        return sortOption === 'priceLow' ? priceA - priceB : priceB - priceA;
      });
    } else if (sortOption === 'sold') {
      products.sort((a, b) => {
        // Extract numbers from sold string (e.g. "3k+ sold" -> 3000)
        const getSoldVal = (p) => {
          if (!p || p === 'N/A') return 0;
          let num = p.toLowerCase().replace('sold', '').replace('+', '').trim();
          if (num.includes('k')) {
            return parseFloat(num.replace('k', '')) * 1000;
          }
          return parseInt(num) || 0;
        };
        return getSoldVal(b.info) - getSoldVal(a.info);
      });
    }

    // --- BUILD EXCEL FILE (HTML Table Method) ---
    // This forces Excel to format headers, widths, and numbers beautifully without external libraries
    let html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8">';
    html += '<style> th { background-color: #ee4d2d; color: white; font-weight: bold; border: 1px solid #ccc; } ';
    html += 'td { border: 1px solid #ccc; } </style></head><body>';
    html += '<table>';
    
    // Headers
    html += '<thead><tr><th>No.</th><th>Product Name</th><th>Price (RM)</th><th>Info</th><th>URL</th></tr></thead><tbody>';
    
    // Rows
    products.forEach((p, i) => {
      // Clean the price for Excel (Remove "RM" so it acts as a number)
      let cleanPrice = p.price.replace(/RM/i, '').replace(/,/g, '').trim();
      
      html += '<tr>';
      html += `<td>${i + 1}</td>`;
      html += `<td>${p.name}</td>`;
      html += `<td>${cleanPrice}</td>`; // Will be recognized as a number by Excel
      html += `<td>${p.info}</td>`;
      html += `<td>${p.url}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';

    // 3. Create Blob and download as .xls
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    a.download = `shopee_my_organized_${ts}.xls`; // Downloading as .xls
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    statusEl.textContent = `Success! Exported ${products.length} organized products.`;
    btnEl.disabled = false;
    
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error: ' + err.message;
    btnEl.disabled = false;
  }
});