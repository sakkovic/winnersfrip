const fs = require('fs');
const file = 'app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove from 'Shared constants' to 'Admin Table Row'
const startIdx = content.indexOf('// ─── Shared constants');
const endIdx = content.indexOf('// ─── Admin Table Row');
if (startIdx > -1 && endIdx > -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

// 2. Remove states
content = content.replace(/const \[formOpen, setFormOpen\].*\n/g, '');
content = content.replace(/const \[editTarget, setEditTarget\].*\n/g, '');
content = content.replace(/const \[saving, setSaving\].*\n/g, '');

// 3. Remove handleSave
const handleSaveStart = content.indexOf('const handleSave = async');
if (handleSaveStart > -1) {
  const handleSaveEndStr = '  const handleToggle = async';
  const handleSaveEnd = content.indexOf(handleSaveEndStr, handleSaveStart);
  if (handleSaveEnd > -1) {
    content = content.substring(0, handleSaveStart) + content.substring(handleSaveEnd);
  }
}

// 4. Update 'Ajouter un produit' button to Link
content = content.replace(
  /<button[\s\S]*?onClick=\{\(\) => \{ setEditTarget\(null\); setFormOpen\(true\); \}\}[\s\S]*?Ajouter un produit[\s\S]*?<\/button>/,
  `<Link
              href="/admin/product/new"
              className="flex items-center gap-1.5 bg-brand-black text-white text-[11px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>`
);

// 5. Update 'Modifier' button to Link
content = content.replace(
  /<button[\s\S]*?onClick=\{\(\) => \{ setEditTarget\(p\); setFormOpen\(true\); \}\}[\s\S]*?title="Modifier"[\s\S]*?<\/button>/,
  `<Link
                      href={\`/admin/product/\${p.id}\`}
                      className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </Link>`
);

// 6. Remove ProductForm Modal block
const modalRegex = /\{\/\* Form modal \*\/\}\s*<AnimatePresence>\s*\{formOpen && \([\s\S]*?<\/AnimatePresence>/;
content = content.replace(modalRegex, '');

fs.writeFileSync(file, content);
console.log('Cleanup completed');
