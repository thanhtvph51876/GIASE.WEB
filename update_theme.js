const fs = require('fs');

try {
  let css = fs.readFileSync('H:/website-clone/app/globals.css', 'utf8');

  // Replace background colors in :root
  css = css.replace(/--premium-bg-cream: #fdfbf7;/g, '--premium-bg-cream: #020617;');
  css = css.replace(/--background: #fdfbf7;/g, '--background: #020617;');
  css = css.replace(/--foreground: #0f172a;/g, '--foreground: #f8fafc;');
  css = css.replace(/--primary: #059669;/g, '--primary: #10b981;');
  css = css.replace(/--primary-foreground: #ffffff;/g, '--primary-foreground: #022c22;');
  css = css.replace(/--border: rgba\(15, 23, 42, 0.08\);/g, '--border: rgba(255, 255, 255, 0.1);');

  // Replace body background
  css = css.replace(/linear-gradient\(180deg, #fdfbf7 0%, #fffaf0 42%, #ffffff 100%\)/g, 'linear-gradient(180deg, #020617 0%, #0f172a 100%)');

  // Components
  css = css.replace(/bg-white\/95/g, 'bg-slate-900/95');
  css = css.replace(/bg-white\/80/g, 'bg-slate-900/80');
  css = css.replace(/border-slate-200\/70/g, 'border-slate-800/70');

  // Replace the new glass-card-strong
  const glassCard = `  .glass-card-strong {
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 100%);
    box-shadow: 
      0 10px 30px -10px rgba(15, 23, 42, 0.05),
      0 4px 10px -4px rgba(5, 150, 105, 0.03),
      inset 0 1px 1px rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px) saturate(1.08);
    -webkit-backdrop-filter: blur(20px) saturate(1.08);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, background 0.4s ease;
  }
  
  .glass-card-strong:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 22px 40px -10px rgba(15, 23, 42, 0.08),
      0 10px 20px -4px rgba(5, 150, 105, 0.06),
      inset 0 1px 1px rgba(255, 255, 255, 1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%);
  }`;

  const glassCardDark = `  .glass-card-strong {
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
    box-shadow: 
      0 10px 30px -10px rgba(0, 0, 0, 0.5),
      0 4px 15px -4px rgba(16, 185, 129, 0.1),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease;
  }
  
  .glass-card-strong:hover {
    transform: translateY(-4px);
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 
      0 22px 40px -10px rgba(0, 0, 0, 0.6),
      0 10px 30px -4px rgba(16, 185, 129, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  }`;

  css = css.replace(glassCard, glassCardDark);

  const glassHeader = `  .floating-glass-header {
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.65);
    box-shadow: 
      0 4px 24px -4px rgba(15, 23, 42, 0.04),
      0 2px 8px -2px rgba(15, 23, 42, 0.02),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px) saturate(1.08);
    -webkit-backdrop-filter: blur(16px) saturate(1.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }`;

  const glassHeaderDark = `  .floating-glass-header {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.6);
    box-shadow: 
      0 4px 24px -4px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }`;

  css = css.replace(glassHeader, glassHeaderDark);

  const glassCardBase = `  .glass-card {
    border: 1px solid var(--premium-border-soft);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.65));
    box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px) saturate(1.08);
    -webkit-backdrop-filter: blur(16px) saturate(1.08);
  }`;

  const glassCardBaseDark = `  .glass-card {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6));
    box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
  }`;
  
  css = css.replace(glassCardBase, glassCardBaseDark);

  // Update page.tsx
  let page = fs.readFileSync('H:/website-clone/app/page.tsx', 'utf8');
  page = page.replace(/bg-white\/70/g, 'bg-slate-800/70');
  page = page.replace(/bg-white\/50/g, 'bg-slate-800/50');
  page = page.replace(/bg-white\/75/g, 'bg-slate-800/75');
  page = page.replace(/bg-white\/35/g, 'bg-slate-900/35');
  page = page.replace(/text-slate-900/g, 'text-white');
  page = page.replace(/text-slate-950/g, 'text-white');
  page = page.replace(/text-slate-600/g, 'text-slate-400');
  page = page.replace(/text-slate-700/g, 'text-slate-300');
  page = page.replace(/text-slate-500/g, 'text-slate-400');
  page = page.replace(/ring-white/g, 'ring-slate-900');
  page = page.replace(/bg-emerald-50\/50/g, 'bg-emerald-900/30');
  page = page.replace(/bg-emerald-50/g, 'bg-emerald-900/30');
  page = page.replace(/border-emerald-200/g, 'border-emerald-500/30');
  page = page.replace(/border-emerald-200\/70/g, 'border-emerald-500/30');
  page = page.replace(/text-emerald-700/g, 'text-emerald-400');
  page = page.replace(/text-emerald-800/g, 'text-emerald-400');
  page = page.replace(/bg-emerald-100/g, 'bg-emerald-900/50');
  page = page.replace(/bg-blue-100\/50/g, 'bg-blue-900/30');
  page = page.replace(/bg-amber-100\/50/g, 'bg-amber-900/30');
  page = page.replace(/bg-emerald-100\/50/g, 'bg-emerald-900/30');
  page = page.replace(/text-blue-600/g, 'text-blue-400');
  page = page.replace(/text-amber-600/g, 'text-amber-400');
  page = page.replace(/text-emerald-600/g, 'text-emerald-400');

  // Fix button styles for dark mode
  page = page.replace(/bg-white/g, 'bg-slate-800');
  page = page.replace(/hover:bg-slate-50/g, 'hover:bg-slate-700');
  page = page.replace(/bg-slate-900/g, 'bg-slate-700');
  page = page.replace(/hover:bg-slate-800/g, 'hover:bg-slate-600');

  fs.writeFileSync('H:/website-clone/app/globals.css', css);
  fs.writeFileSync('H:/website-clone/app/page.tsx', page);
  process.stdout.write("Updated successfully\n");
} catch(e) {
  console.error(e);
}
