const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/roles/manager/pages');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace header text-right with text-center for Actions
  content = content.replace(/<th className="([^"]*)text-right([^"]*)">Actions<\/th>/g, '<th className="$1text-center$2">Actions</th>');
  
  // Replace td text-right with text-center for Actions
  // This is a bit tricky, let's just replace the div flex items-center justify-end inside td that has Actions comment
  // Or just replace all text-right on the td and justify-end on the div inside the action column.
  
  // A simpler regex for the div inside Actions td:
  content = content.replace(/{\/\*\s*Actions\s*\*\/}\s*<td className="([^"]*)text-right([^"]*)">\s*<div className="([^"]*)justify-end([^"]*)">/g, '{/* Actions */}\n                        <td className="$1text-center$2">\n                          <div className="$3justify-center$4">');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(dir, file));
  }
});
