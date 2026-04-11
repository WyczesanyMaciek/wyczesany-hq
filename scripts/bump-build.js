// Inkrementuje numer buildu w build-meta.json.
// Uruchamiany przez pre-commit hook.
const fs = require('fs');
const path = require('path');

const metaPath = path.join(__dirname, '..', 'build-meta.json');
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
meta.number++;
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
console.log(`Build #${String(meta.number).padStart(3, '0')}`);
