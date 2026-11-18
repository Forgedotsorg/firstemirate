#!/usr/bin/env node
/*
  Builds the Arabic page (ar/index.html) from the English source (index.html).

    node i18n/build.mjs            build ar/index.html (fails if anything is untranslated)
    node i18n/build.mjs --todo     write i18n/todo.json: every English string without an Arabic entry
    node i18n/build.mjs --unused   list dictionary entries no longer used by the page
    node i18n/build.mjs --all      write i18n/all.json: every string, its section and its Arabic (for review)

  How it works (no dependencies):
  - i18n/ar.json is a flat dictionary { "English text": "Arabic text" }. Keys are the plain text
    (HTML entities decoded, whitespace collapsed for HTML), so the same key serves HTML and JS.
  - HTML: every text segment between tags, plus the attributes in TR_ATTRS (alt, title, aria-label,
    placeholder, data-text, data-ask, data-topic and the SEO <meta> contents) is looked up.
    Segments with no letters (numbers, symbols), emails, URLs and phone numbers are left as they are.
  - Elements with a data-no-i18n attribute are copied as they are (the language names in the menu).
  - JavaScript: only strings wrapped in L("…") are translated (L is an identity function in the page).
  - <template> blocks (hidden content) are translated like the rest; <style> and the importmap are copied unchanged.
  - The Arabic JSON-LD is rebuilt: WebPage + FAQPage in Arabic, with the FAQ text taken from the
    translated visible FAQ, so the two always match.
  - Any English string without an Arabic entry stops the build, so a half-translated page can never ship.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'index.html');
const DICT_FILE = path.join(ROOT, 'i18n', 'ar.json');
const FONTS_FILE = path.join(ROOT, 'i18n', 'ar-fonts.html');
const OUT_DIR = path.join(ROOT, 'ar');
const DOMAIN = 'https://firstemirates.forgedots.website/';
const mode = process.argv[2] || '';

const TR_ATTRS = new Set(['alt', 'title', 'aria-label', 'placeholder', 'data-text', 'data-ask', 'data-topic']);
const META_TR = new Set(['description', 'keywords', 'og:title', 'og:description', 'og:image:alt', 'og:site_name', 'twitter:title', 'twitter:description', 'twitter:image:alt', 'author']);
const PATH_ATTRS = new Set(['src', 'href', 'srcset', 'data-src']);   // data-src: the street map's data folder

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", hellip: '…', mdash: '—', ndash: '–', middot: '·', rarr: '→', copy: '©', times: '×' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  return e in ENT ? ENT[e] : m;
});
const encText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encAttr = s => encText(s).replace(/"/g, '&quot;');
const norm = s => s.replace(/\s+/g, ' ').trim();
// Nothing to translate: no letters at all, or an email / URL / phone number / file name
const skippable = k => !/\p{L}/u.test(k) || /^[\w.+-]+@[\w.-]+$/.test(k) || /^(https?:|www\.)\S+$/.test(k) || /^\+?[\d\s()-]{7,}$/.test(k) || /^[\w./-]+\.(png|jpe?g|webp|svg|ico)$/i.test(k);

// Phone numbers keep their left-to-right digit order inside Arabic text: wrap them in invisible
// Unicode isolates (LRI … PDI). Without this the RTL algorithm shows "+971 2 553 8526" as "8526 553 2 +971".
const LRI = '\u2066', PDI = '\u2069';
const PHONE_RE = /\+?\d{1,4}(?:[ -]\d{1,4}){2,}/g;
// The legal name ends in a period ("L.L.C."); isolated, the period stays attached inside Arabic sentences
const LEGAL = 'First Emirates Computers and Technical Services L.L.C.';
const isolatePhones = s => s.replace(PHONE_RE, (m, off, all) => (all[off - 1] === LRI ? m : LRI + m + PDI))
  .split(LEGAL).join(LRI + LEGAL + PDI).split(LRI + LRI + LEGAL + PDI + PDI).join(LRI + LEGAL + PDI);

const dict = fs.existsSync(DICT_FILE) ? JSON.parse(fs.readFileSync(DICT_FILE, 'utf8')) : {};
const used = new Set();
const missing = new Map(); // key -> { kind, ctx }
let ctx = 'head';
const seen = new Map(); // every translatable key with where it was first met (for --all)
function tr(key, kind) {
  if (!key || skippable(key)) return null;
  if (!seen.has(key)) seen.set(key, { kind, ctx });
  if (Object.prototype.hasOwnProperty.call(dict, key)) { used.add(key); return isolatePhones(dict[key]); }
  if (!missing.has(key)) missing.set(key, { kind, ctx });
  return null;
}

// ---------- JavaScript: L("…") strings ----------
const L_RE = /\bL\(\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')\s*\)/g;
function trJs(code) {
  return code.replace(L_RE, (m, lit) => {
    const val = Function('"use strict"; return (' + lit + ');')();
    const ar = tr(val, 'js');
    if (ar == null) return m;
    return 'L(' + JSON.stringify(ar).replace(/<\//g, '<\\/') + ')';
  });
}

// ---------- HTML attributes ----------
function trTag(tag) {
  const name = (tag.match(/^<([\w-]+)/) || [])[1];
  if (!name) return tag;
  const lower = name.toLowerCase();
  let metaKey = null;
  if (lower === 'meta') { const m = tag.match(/\b(?:name|property)="([^"]+)"/); metaKey = m && m[1]; }
  return tag.replace(/(\s)([\w:-]+)="([^"]*)"/g, (m, sp, attr, raw) => {
    let val = raw;
    if (TR_ATTRS.has(attr) || (lower === 'meta' && attr === 'content' && META_TR.has(metaKey))) {
      const ar = tr(norm(decode(raw)), 'attr:' + attr);
      if (ar != null) val = encAttr(ar);
    }
    if (PATH_ATTRS.has(attr)) val = val.replace(/(^|,\s*)\.\//g, '$1../');
    return sp + attr + '="' + val + '"';
  });
}

// ---------- the page ----------
function build(src) {
  let out = '', i = 0;
  const n = src.length;
  while (i < n) {
    const lt = src.indexOf('<', i);
    const textEnd = lt === -1 ? n : lt;
    if (textEnd > i) { // text segment
      const raw = src.slice(i, textEnd);
      const key = norm(decode(raw));
      const ar = tr(key, 'text');
      if (ar == null) out += PHONE_RE.test(raw) && !/\p{L}/u.test(raw) ? raw.replace(PHONE_RE, m => LRI + m + PDI) : raw;
      else { const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0]; out += lead + encText(ar) + trail; }
      i = textEnd; continue;
    }
    if (src.startsWith('<!--', i)) { // comment (section banners give the context for --todo)
      const end = src.indexOf('-->', i) + 3;
      const c = src.slice(i, end);
      const banner = c.match(/═{3,}\s*\n\s*([^\n]+)/);
      if (banner) ctx = norm(banner[1]).slice(0, 60);
      out += c; i = end; continue;
    }
    const tagEnd = src.indexOf('>', i) + 1;
    const tag = src.slice(i, tagEnd);
    const tname = ((tag.match(/^<\/?([\w-]+)/) || [])[1] || '').toLowerCase();
    if (!tag.startsWith('</') && /\sdata-no-i18n[\s>=]/.test(tag)) { // copied as-is (e.g. the language names in the menu)
      const close = src.indexOf('</' + tname + '>', tagEnd) + tname.length + 3;
      out += src.slice(i, close); i = close; continue;
    }
    if (!tag.startsWith('</') && (tname === 'script' || tname === 'style' || tname === 'template')) {
      const close = src.indexOf('</' + tname + '>', tagEnd);
      const body = src.slice(tagEnd, close);
      let newBody = body;
      if (tname === 'script') {
        if (/application\/ld\+json/.test(tag)) newBody = '\n' + LD_PLACEHOLDER + '\n    ';
        else if (!/importmap/.test(tag)) newBody = trJs(body);
      } else if (tname === 'style') newBody = body.replace(/url\("\.\//g, 'url("../');
      else newBody = build(body); // <template> (hidden blocks such as the preloader): translated too, so restoring them gives Arabic
      out += trTag(tag) + newBody + '</' + tname + '>';
      i = close + tname.length + 3; continue;
    }
    out += trTag(tag); i = tagEnd;
  }
  return out;
}
const LD_PLACEHOLDER = '/*__AR_JSONLD__*/';

// ---------- run ----------
const src = fs.readFileSync(SRC, 'utf8');
let html = build(src);

if (mode === '--todo') {
  const todo = [...missing].map(([en, v]) => ({ section: v.ctx, kind: v.kind, en }));
  fs.writeFileSync(path.join(ROOT, 'i18n', 'todo.json'), JSON.stringify(todo, null, 1));
  const by = {}; todo.forEach(t => { by[t.section] = (by[t.section] || 0) + 1; });
  console.log(todo.length + ' untranslated strings → i18n/todo.json'); console.log(by);
  process.exit(0);
}
if (mode === '--all') { // every string with its section and current Arabic, for review
  const all = [...seen].map(([en, v]) => ({ section: v.ctx, kind: v.kind, en, ar: dict[en] }));
  fs.writeFileSync(path.join(ROOT, 'i18n', 'all.json'), JSON.stringify(all, null, 1));
  console.log(all.length + ' strings → i18n/all.json'); process.exit(0);
}
if (mode === '--unused') {
  const un = Object.keys(dict).filter(k => !used.has(k));
  console.log(un.length + ' unused entries'); un.forEach(k => console.log(' - ' + k.slice(0, 100)));
  process.exit(0);
}
if (missing.size) {
  console.error('✗ ' + missing.size + ' strings have no Arabic translation. Run: node i18n/build.mjs --todo');
  [...missing].slice(0, 15).forEach(([k, v]) => console.error('   [' + v.ctx + ' / ' + v.kind + '] ' + k.slice(0, 110)));
  process.exit(1);
}

// <html>, head links
const swap = (a, b) => { if (!html.includes(a)) { console.error('✗ expected to find: ' + a); process.exit(1); } html = html.split(a).join(b); };
swap('<html lang="en" dir="ltr" translate="no">', '<html lang="ar" dir="rtl" translate="no">');
swap('<link rel="canonical" href="' + DOMAIN + '">', '<link rel="canonical" href="' + DOMAIN + 'ar/">');
swap('<meta property="og:url" content="' + DOMAIN + '">', '<meta property="og:url" content="' + DOMAIN + 'ar/">');
swap('<meta property="og:locale" content="en_AE">', '<meta property="og:locale" content="ar_AE">');
swap('<meta property="og:locale:alternate" content="ar_AE">', '<meta property="og:locale:alternate" content="en_AE">');
// Language menu: Arabic is the current language here; English links back to the root
swap('<span class="lang-label" data-no-i18n>English</span>', '<span class="lang-label" data-no-i18n>العربية</span>');
swap('<a class="lang-opt" href="../" hreflang="en" lang="en" aria-current="page">', '<a class="lang-opt" href="../" hreflang="en" lang="en">');
swap('<a class="lang-opt" href="ar/" hreflang="ar" lang="ar">', '<a class="lang-opt" href="./" hreflang="ar" lang="ar" aria-current="page">');
// Arabic font (inlined @font-face, see i18n/ar-fonts.html)
html = html.replace('</head>', fs.readFileSync(FONTS_FILE, 'utf8').trim() + '\n</head>');

// JSON-LD: same company graph; WebPage + FAQPage in Arabic, FAQ text from the translated visible FAQ
const ldSrc = src.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
const ld = JSON.parse(ldSrc);
const strip = s => norm(decode(s.replace(/<[^>]+>/g, '')).replace(/[\u2066-\u2069]/g, ''));
const qs = [...html.matchAll(/id="faq-q(\d+)">([\s\S]*?)<span class="faq-icon"/g)].map(m => strip(m[2]));
const as = [...html.matchAll(/<div class="faq-answer-inner">([\s\S]*?)<\/div><\/div>/g)].map(m => strip(m[1]));
if (!qs.length || qs.length !== as.length) { console.error('✗ FAQ extraction failed', qs.length, as.length); process.exit(1); }
const title = strip(html.match(/<title>([\s\S]*?)<\/title>/)[1]);
for (const node of ld['@graph']) {
  if (node['@type'] === 'WebPage') { node['@id'] = DOMAIN + 'ar/#webpage'; node.url = DOMAIN + 'ar/'; node.name = title; node.inLanguage = 'ar'; }
  if (node['@type'] === 'FAQPage') {
    node['@id'] = DOMAIN + 'ar/#faq'; node.isPartOf = { '@id': DOMAIN + 'ar/#webpage' }; node.inLanguage = 'ar';
    node.mainEntity = qs.map((q, k) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: as[k] } }));
  }
}
html = html.replace(LD_PLACEHOLDER, JSON.stringify(ld, null, 2).replace(/<\//g, '<\\/'));

// Leftover check: visible text that still looks English (Latin words outside the allowed list)
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);
const unusedN = Object.keys(dict).filter(k => !used.has(k)).length;
console.log('✓ ar/index.html built — ' + used.size + ' strings translated' + (unusedN ? ', ' + unusedN + ' unused dictionary entries (node i18n/build.mjs --unused)' : ''));
