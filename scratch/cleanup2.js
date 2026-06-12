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
content = content.replace(/  const \[formOpen, setFormOpen\].*\n/g, '');
content = content.replace(/  const \[editTarget, setEditTarget\].*\n/g, '');
content = content.replace(/  const \[saving, setSaving\].*\n/g, '');

// 3. Remove handleSave
const handleSaveStart = content.indexOf('  const handleSave = async');
if (handleSaveStart > -1) {
  const handleSaveEndStr = '  const handleToggle = async';
  const handleSaveEnd = content.indexOf(handleSaveEndStr, handleSaveStart);
  if (handleSaveEnd > -1) {
    content = content.substring(0, handleSaveStart) + content.substring(handleSaveEnd);
  }
}

// 4. Replace Add Button
const addButtonOld = `<button
              onClick={() => { setEditTarget(null); setFormOpen(true); }}
              className="flex items-center gap-1.5 bg-brand-black text-white text-[11px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </button>`;
const addButtonNew = `<Link
              href="/admin/product/new"
              className="flex items-center gap-1.5 bg-brand-black text-white text-[11px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>`;
content = content.replace(addButtonOld, addButtonNew);

// 5. Replace Edit Button
const editButtonOld = `<button
                      onClick={() => { setEditTarget(p); setFormOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </button>`;
const editButtonNew = `<Link
                      href={\`/admin/product/\${p.id}\`}
                      className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </Link>`;
content = content.replace(editButtonOld, editButtonNew);

// 6. Remove Modal
const modalStart = content.indexOf('{/* Form modal */}');
const modalEndMarker = '</AnimatePresence>';
const firstAnimateEnd = content.indexOf(modalEndMarker, modalStart);
if (modalStart > -1 && firstAnimateEnd > -1) {
  content = content.substring(0, modalStart) + content.substring(firstAnimateEnd + modalEndMarker.length);
}

fs.writeFileSync(file, content);
console.log('Done');
