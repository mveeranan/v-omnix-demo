import fs from 'fs';
import path from 'path';

const SRC = path.resolve('src');

const REPLACEMENTS = [
  ["@shared/admin-page-shell.component", "@features/admin/shared/admin-page-shell.component"],
  ["@shared/admin-form-section-card.component", "@features/admin/shared/admin-form-section-card.component"],
  ["@shared/admin-detail-field.component", "@features/admin/shared/admin-detail-field.component"],
  ["@shared/admin-detail-media.component", "@features/admin/shared/admin-detail-media.component"],
  ["@shared/admin-section-placeholder.component", "@features/admin/shared/admin-section-placeholder.component"],
  ["@shared/website-section-shell.component", "@features/portfolio/editor/shared/website-section-shell.component"],
  ["@shared/ui/section-toggle.component", "@features/portfolio/shared/ui/section-toggle.component"],
  ["@shared/ui/media-upload-zone.component", "@shared/ui/media-upload-zone.component"],
  ["@shared/ui/collapsible-section-card.component", "@features/portfolio/shared/ui/collapsible-section-card.component"],
  ["@shared/utils/portfolio-theme.util", "@features/portfolio/shared/utils/portfolio-theme.util"],
  ["@shared/utils/video-thumbnail.util", "@features/portfolio/shared/utils/video-thumbnail.util"],
  ["@shared/services/scroll-reveal.service", "@features/portfolio/shared/services/scroll-reveal.service"],
  ["@shared/directives/scroll-reveal.directive", "@features/portfolio/shared/directives/scroll-reveal.directive"],
  ["@shared/ui/store-card.component", "@features/store/shared/ui/store-card.component"],
  ["@shared/ui/store-section-header.component", "@features/store/shared/ui/store-section-header.component"],
  ["@shared/ui/trust-badge.component", "@features/store/shared/ui/trust-badge.component"],
  ["@shared/ui/star-rating.component", "@features/store/shared/ui/star-rating.component"],
];

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

let changed = 0;
for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, 'utf8');
  let next = content;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
  }
}

console.log(`Fixed ${changed} files`);
