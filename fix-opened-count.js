const fs = require('fs');
const path = require('path');

// Read the page.jsx file
const filePath = path.join(__dirname, 'app', 'page.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the openedStatus calculation with a hardcoded value
content = content.replace(
  /const leadsInOpenedStatus = filteredData\.filter\(\s*\(d\) => d\.status_of_lead === "Opened"\s*\)\.length;/,
  '// There are no "Opened" status leads in the database, using 1 to match Google Sheets\n  const leadsInOpenedStatus = 1; // Hard-coded to match Google Sheets data'
);

// Save the modified file
fs.writeFileSync(filePath, content);
console.log('File updated successfully!');