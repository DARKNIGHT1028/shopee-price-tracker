# Shopee MY Price Exporter

A Chrome extension that extracts product data from Shopee Malaysia pages and exports it as an Excel-compatible `.xls` file.

## Features

- Extracts product name, price, sold information, and product URL.
- Organizes products in Shopee's default order, by price low to high, by price high to low, or by most sold.
- Downloads a formatted Excel-compatible file with a timestamped filename.
- Removes duplicate products based on their URL.

## Installation

1. Download or clone this repository.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the project folder containing `manifest.json`.

## Usage

1. Open a Shopee Malaysia page at `shopee.com.my`.
2. Open the **Shopee MY Exporter** extension from the Chrome toolbar.
3. Choose the desired organization option.
4. Select **Extract & Export to Excel**.
5. Open the downloaded `.xls` file in Microsoft Excel or another compatible spreadsheet application.

## Development

This project uses plain JavaScript, HTML, and CSS. No build step or package installation is required.

### Project structure

```text
content.js       Extracts product data from Shopee pages
manifest.json    Chrome extension configuration
popup.html       Extension popup markup
popup.js         Sorting and Excel-compatible export logic
styles.css       Popup sizing styles
icons/           Extension image assets
```

## Notes and limitations

- The extension only runs on pages matching `https://shopee.com.my/*`.
- Shopee may change its page markup, which can affect product extraction.
- The exported file uses HTML table markup with an `.xls` extension for Excel compatibility; it is not a native `.xlsx` workbook.
- Product data is read from the products currently loaded on the page. Scroll or load additional results before exporting when needed.

## Permissions

- `activeTab`: access the currently active Shopee tab when exporting.
- `scripting`: support extension interaction with the active tab.
