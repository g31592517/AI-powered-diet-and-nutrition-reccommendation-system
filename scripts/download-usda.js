#!/usr/bin/env node
// Minimal USDA dataset downloader (foundation foods CSV)

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const url = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2024-04-18.zip';
const outDir = path.join(__dirname, '..', 'data');
const zipPath = path.join(outDir, 'usda_foundation_2024-04-18.zip');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  try {
    console.log('⬇️  Downloading USDA foundation foods CSV...');
    await download(url, zipPath);
    console.log('✅ Downloaded to', zipPath);

    // Try to unzip using system unzip if available
    try {
      execSync(`unzip -o ${zipPath} -d ${outDir}`, { stdio: 'inherit' });
      console.log('✅ Extracted CSVs to', outDir);
    } catch (e) {
      console.log('⚠️  unzip not available. Keep ZIP in data/. You can extract manually.');
    }
  } catch (e) {
    console.error('❌ Download failed:', e.message);
    process.exit(1);
  }
})();
