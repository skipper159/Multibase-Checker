const fs = require('fs');
let text = fs.readFileSync('src/components/TestResultRenderer.tsx', 'utf8');
text = text.split('justify="space-between"').join('justify="between"');
text = text.split('<Code block>').join('<Code>');
text = text.split('<Code block ').join('<Code ');
text = text.split('weight="bold"').join('style={{ fontWeight: "bold" }}');
fs.writeFileSync('src/components/TestResultRenderer.tsx', text);
console.log('Done!');
