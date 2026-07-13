const fs = require('fs');
let text = fs.readFileSync('src/components/TestResultRenderer.tsx', 'utf8');

// fix double styles
text = text.replace(/style=\{\{(.*?)\}\}\s*style=\{\{(.*?)\}\}/g, 'style={{$1, $2}}');

// fix weight on Table.ColumnHeaderCell
text = text.replace(/<Table\.ColumnHeaderCell([^>]*)weight=\"[^\"]*\"([^>]*)>/g, '<Table.ColumnHeaderCell$1$2>');
text = text.replace(/<Table\.Cell([^>]*)weight=\"[^\"]*\"([^>]*)>/g, '<Table.Cell$1$2>');

fs.writeFileSync('src/components/TestResultRenderer.tsx', text);
