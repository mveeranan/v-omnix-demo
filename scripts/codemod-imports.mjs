import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function transform(content) {
  let next = content;

  const replacePath = (pattern, replacement) => {
    next = next.replace(pattern, replacement);
  };

  // Relative imports into core/features/shared/environments
  replacePath(/from\s+['"](?:\.\.\/)+core\/([^'"]+)['"]/g, "from '@core/$1'");
  replacePath(/from\s+['"](?:\.\.\/)+features\/([^'"]+)['"]/g, "from '@features/$1'");
  replacePath(/from\s+['"](?:\.\.\/)+shared\/([^'"]+)['"]/g, "from '@shared/$1'");
  replacePath(/from\s+['"](?:\.\.\/)+environments\/([^'"]+)['"]/g, "from '@env/$1'");

  // App shell relative imports
  replacePath(/from\s+['"]\.\/core\/([^'"]+)['"]/g, "from '@core/$1'");
  replacePath(/from\s+['"]\.\/features\/([^'"]+)['"]/g, "from '@features/$1'");
  replacePath(/from\s+['"]\.\/shared\/([^'"]+)['"]/g, "from '@shared/$1'");

  // Dynamic imports
  replacePath(/import\(\s*['"](?:\.\.\/)+features\/([^'"]+)['"]\s*\)/g, "import('@features/$1')");
  replacePath(/import\(\s*['"]\.\/features\/([^'"]+)['"]\s*\)/g, "import('@features/$1')");

  // Legacy components paths
  replacePath(/from\s+['"](?:\.\.\/)+components\/home\/([^'"]+)['"]/g, "from '@features/marketing/home/$1'");
  replacePath(/from\s+['"](?:\.\.\/)+components\/signal-r\/([^'"]+)['"]/g, "from '@features/dev/signal-r/$1'");
  replacePath(/import\(\s*['"](?:\.\.\/)+components\/signal-r\/([^'"]+)['"]\s*\)/g, "import('@features/dev/signal-r/$1')");

  return next;
}

const files = walk(SRC);
let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = transform(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
  }
}

console.log(`Updated ${changed} files`);
