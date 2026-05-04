const fs = require('fs');
const path = require('path');

// THE REVERSE ORDER IS IMPORTANT
const replacements = [
  { from: /rounded-\[1\.875rem\]/g, to: 'rounded-[2.5rem]' },
  { from: /rounded-\[1\.375rem\]/g, to: 'rounded-[2rem]' },
  { from: /rounded-\[2\.375rem\]/g, to: 'rounded-[3rem]' },
  { from: /rounded-xl/g, to: 'rounded-3xl' },
  { from: /rounded-\[10px\]/g, to: 'rounded-md' }, // First bring buttons back to md
  { from: /rounded-md/g, to: 'rounded-2xl' }, // Then bring md (which were 2xl) back to 2xl
  { from: /p-12/g, to: 'p-16' },
  { from: /p-8/g, to: 'p-10' },
  { from: /p-6/g, to: 'p-8' },
  { from: /p-4/g, to: 'p-6' }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Reverted: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '..', 'src'));
