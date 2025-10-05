const fetch = require('node-fetch');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const url = 'https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2024-04-18.zip';
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
        const finalCsv = path.join(dataDir, 'usda-foods.csv');
        if (fs.existsSync(finalCsv)) {
            console.log('Dataset already present, skipping download.');
            return;
        }

        console.log('Downloading USDA dataset zip...');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
        const buffer = await res.buffer();

        console.log('Extracting zip...');
        const zip = new AdmZip(buffer);
        zip.extractAllTo(dataDir, true);

        // Find the foundation foods CSV and rename to usda-foods.csv
        const extractedEntries = fs.readdirSync(dataDir);
        const subdir = extractedEntries.find(f => f.toLowerCase().startsWith('fooddata_central_foundation_food_csv_'));
        let src;
        if (subdir && fs.existsSync(path.join(dataDir, subdir, 'foundation_food.csv'))) {
            src = path.join(dataDir, subdir, 'foundation_food.csv');
        } else {
            // Fallback: search in data root
            const foundationCsv = extractedEntries.find(f => f.toLowerCase().includes('foundation') && f.toLowerCase().endsWith('.csv'));
            if (foundationCsv) src = path.join(dataDir, foundationCsv);
        }
        if (!src) {
            console.warn('foundation_food.csv not found after extraction. Entries:', extractedEntries);
        } else {
            const dest = path.join(dataDir, 'usda-foods.csv');
            fs.renameSync(src, dest);
            console.log('Saved CSV to', dest);
        }
        console.log('Done.');
    } catch (err) {
        console.error('Dataset download failed:', err.message);
        process.exit(1);
    }
})();


