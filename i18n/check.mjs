#!/usr/bin/env node
/*
  Translation rule checks for i18n/ar.json (run after node i18n/build.mjs --all).
    node i18n/check.mjs            print problems; exit 1 if any
    node i18n/check.mjs --split    also write i18n/review/review-{A,B,C}.json for reviewers
  Checks (rules in i18n/glossary.md):
   - double:   an Arabic value that writes a term twice, "Arabic (English)"
   - translit: an Arabic transliteration of a name/term that must stay in English
   - missing:  a brand / model / code / unit / acronym from the English that is not in the Arabic unchanged
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'all.json'), 'utf8'));

const TRANSLIT = ['واتساب', 'واي فاي', 'وايفاي', 'سويتش', 'راوتر', 'سيرفر', 'باركود', 'بروجكتور', 'لابتوب', 'إنتركم', 'انتركم', 'الإنتركم', 'سوبرماركت رويال', 'رويال إمارات', 'مركز الخالد', 'مركز العطار', 'فيرست', 'إيميل', 'كاشير'];
// Latin words that are ordinary English (sentence words), not names/codes: ignored by the "missing" check
const COMMON = new Set('A An The Our We Your You Yes No For From In On Of And Or To With Our Hello Hi It Its This That Also Up All Each More Most New One Two Three Five Seven Get Ask See Read Call Email Send Talk Request Open Close Expand Collapse Name Phone Company Interested Preferred Website Home About Solutions Products Why Locations Contact Projects Brands Industries Services Products FAQ Primary Main Skip Scroll Earlier Today Speak Stop Listening Microphone Voice No Detailed Leadership Brands Interactive Online Offline Real Multi Pedestrian Perimeter Commercial Corporate Industrial Education Residential Integrated Warehouses Consult Design Supply Install Support Quality Within Complete Built Easy Local Comprehensive Security Access Networking Infrastructure Annual Maintenance Contracts Contract Audio Video Meeting Rooms Displays Hardware Head Office Division Branch Hubs Dubai Abu Dhabi Musaffah Mussafah Qusais Sheikh Zayed Road UAE United Arab Emirates Arabian Gulf Box Boxes Office Floor P.O. Technical Services Computers Since Small Medium Large Auditorium People Users Hard Optical Spider Fingerprint Facial Card Door Exit Smart Home GPS Vehicle Hybrid Solar Energy Storage Data Backup Laptops Desktops Workstations Printers Toners Consumables Servers Retail Gates Barriers Intercoms Alarms Firewalls Structured Cabling Bullet Dome Box Wireless Fiber Network Business Wi-Fi'.split(' '));
['IT', 'HR', 'PC', 'PCs', 'EST', 'SMEs', 'SME'].forEach(w => COMMON.add(w));
// Reviewed: ordinary words or plurals that the Arabic translates (or writes in singular) on purpose
['I', 'AI', 'TV', 'HQ', 'P.O', 'L.L.C', '3rd', 'PBX', 'NVRs', 'DVRs', 'AMCs', 'SSDs', 'PSUs', 'RAM', 'ADF', 'ARABIAN', 'GULF', 'MUSAFFAH', 'AL', 'QUSAIS', 'SZR',
 '16-core', '3-year', '64-channel', 'laser/LED', 'Audio/video'].forEach(w => COMMON.add(w)); // ordinary terms: translated (تقنية المعلومات، الموارد البشرية…)
const KEEP_HINT = /^(?=.*[A-Z0-9])[A-Za-z0-9][A-Za-z0-9.+\-/×]*$/; // looks like a name / code / acronym
const tokens = en => (en.replace(/<[^>]+>/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9.+\-/]*[A-Za-z0-9+]|[A-Za-z0-9]/g) || [])
  .filter(t => !(/^[A-Za-z]+(-[A-Za-z]+)+$/.test(t) && !/^(Wi-Fi|P-Series|TP-Link|D-Link|All-in-One)$/i.test(t)))
  .filter(t => t !== 'All-in-One')
  .filter(t => KEEP_HINT.test(t) && !COMMON.has(t) && !/^\d+([.,]\d+)?$/.test(t) && /[A-Za-z]/.test(t) && !/^[A-Z][a-z]+$/.test(t) || /^(AiTIME|ProLiant|AcuSense|WhatsApp|Hikvision|Dahua|Yeastar|Yealink|Grandstream|Huawei|Cisco|Synology|QNAP|Panasonic|Uniview|Pelco|Axis|Samsung|Brother|Canon|Ricoh|Lenovo|Dell|Asus|Belden|Opterna|Ubiquiti|MikroTik|Ruijie|DrayTek|Omada|SIOMATEK|ECOPOS|MAXHUB|OneScreen|NEXIS|Teams|Zoom|Android|Linkus|ZKTeco|Lokiz|Develop|Schneider|Seagate|Toshiba|Kingston|Sandisk|Netgear|Aruba|Fortinet|Sophos|Microsoft|Windows|Intel|AMD|Xeon|EPYC|ForgeWeb)$/.test(t));

const probs = [];
for (const it of all) {
  const ar = it.ar || '';
  if (!/[؀-ۿ]/.test(ar)) continue; // identity entries (brand-only) need no check
  const flags = [];
  const dbl = ar.match(/[؀-ۿ][^()\n]{0,40}\(([A-Za-z][A-Za-z0-9 .\-/+]*)\)/g);
  // "Arabic (English)" is a double unless the English itself has that "(X)", e.g. "Annual Maintenance Contract (AMC)"
  const dbls = (dbl || []).filter(x => !it.en.includes('(' + x.match(/\(([^)]*)\)$/)[1])); // English has it too, e.g. (AMC) / (AMCs)
  if (dbls.length) flags.push('double: ' + dbls.map(x => x.slice(-30)).join(' | '));
  const tl = TRANSLIT.filter(t => ar.includes(t));
  if (tl.length) flags.push('translit: ' + tl.join(', '));
  const miss = [...new Set(tokens(it.en))].filter(t => !ar.includes(t));
  if (miss.length) flags.push('missing: ' + miss.join(', '));
  if (flags.length) probs.push({ ...it, flags });
}
const by = {}; probs.forEach(p => p.flags.forEach(f => { const k = f.split(':')[0]; by[k] = (by[k] || 0) + 1; }));
console.log(probs.length + ' strings with rule problems', by);
if (process.argv[2] === '--split') {
  const A = ['SEO', 'STYLES', 'HEADER', 'HERO', 'ABOUT', 'SOLUTIONS (7 groups, KB §5)', 'INDUSTRIES (KB §7)', 'WHY CHOOSE US', 'HOW WE WORK', 'BRANDS (KB §9 — typographic wordmarks only)'];
  const g = { A: [], B: [], C: [] };
  const flagged = new Map(probs.map(p => [p.en, p.flags]));
  for (const it of all) (A.includes(it.section) ? g.A : it.section === 'SCRIPTS' ? g.C : g.B).push({ ...it, flags: flagged.get(it.en) || [] });
  fs.mkdirSync(path.join(ROOT, 'i18n', 'review'), { recursive: true });
  for (const k in g) fs.writeFileSync(path.join(ROOT, 'i18n', 'review', 'review-' + k + '.json'), JSON.stringify(g[k], null, 1));
  console.log('review files:', Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v.length + ' strings, ' + v.filter(x => x.flags.length).length + ' flagged'])));
} else probs.slice(0, 40).forEach(p => console.log('-', JSON.stringify(p.en).slice(0, 60), '→', p.flags.join(' ; ').slice(0, 140)));
process.exitCode = probs.length ? 1 : 0;
