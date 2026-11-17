# Arabic translation rules: First Emirates Computers website

**Audience:** UAE business buyers (offices, SMEs, facilities managers).

**Language and tone:** Modern Standard Arabic, professional, clear and concise. Use marketing-site tone, not legal tone.

## Hard rules
1. **Translate faithfully.** Never add facts, claims, numbers, guarantees, certifications, 24/7, prices, or anything not in the English. Never drop information.
2. **Keep in English, exactly as written.** Never translate these, never transliterate them into Arabic letters, and never write them twice:
   - **Names:**
     - the company name and legal name: "First Emirates", "First Emirates Computers", "First Emirates Computers and Technical Services L.L.C.";
     - "ForgeWeb".
   - **Brands and products:**
     - brand names: Hikvision, Dahua, HPE, Yeastar, TP-Link, Yealink, WhatsApp, Android/iOS, Teams/Zoom…;
     - product, platform and model names and codes: AiTIME, ProLiant DL325 Gen11, GL620D, ECOPOS 1560, P-Series, AcuSense, EAP725-Wall, MTouch II, Vigor2915ac, DS-2CD3663G2-IZSU…
   - **Building and shop names:** Al Khalid Business Center, Al Attar Business Center, Royal Emirates Supermarket. The words around them stay Arabic, e.g. "مكتب 101، Al Khalid Business Center، القصيص".
   - **Tech terms and acronyms that UAE buyers use as-is:** Wi-Fi, IP, PoE, LED, UPS, POS, VPN, NAS, NVR/DVR, PTZ, AV, AMC, ELV, EAS, ANPR, RFID, CAT 5e/6/6a/7, 4K, CCTV.
     - Write the English term **once**, with **no "Arabic (English)" doubles**. Use "الشبكات وWi-Fi", not "الشبكات وواي فاي (Wi-Fi)". Use "هواتف IP", not "الهاتف عبر بروتوكول الإنترنت (IP)".
     - When the English uses the generic idea rather than the acronym (e.g. "surveillance", "security cameras"), translate it normally: كاميرات المراقبة.
   - **Units, specs and codes:** MP, mm, dB, IP67, IK10, WDR, IR, GB, TB, kHz, VA, kVA, W, Gbps, M9 and the like.
   - **Contact details:** emails, URLs and phone numbers.
   - **Forbidden transliterations:** واتساب, واي فاي, سويتش, راوتر, سيرفر, باركود, بروجكتور, لابتوب, إنتركم, سوبرماركت رويال, مركز الخالد, مركز العطار. Use either a real Arabic word (e.g. الخوادم, محولات الشبكة, جهاز عرض, الاتصال الداخلي) or the English name.
2b. **Always translate into Arabic** (this is the necessary text):
   - headings, body text, buttons, labels, form fields and options, placeholders and validation messages;
   - FAQ, footer, chat UI and built-in chat answers;
   - alt, aria-label and title text;
   - generic words: cameras, networks, maintenance, security, branch, head office, office, floor;
   - city and area names: أبوظبي، دبي، مصفح، القصيص، شارع الشيخ زايد، الإمارات.
3. **Digits:** use Western digits (0-9), as used in the UAE: "منذ 2011", "+50 علامة تجارية".
4. **Markup:** keep any HTML tags in a string exactly (`<b>…</b>`, `<br>`), plus `\n` line breaks and `•` bullets. Translate the text inside `<b>`.
5. **Sentence fragments:** some English strings are fragments of one sentence or heading that is split by an inline element. For example, "A portfolio of" + "50+" + "brands.", or a heading whose last words are an `<em>` accent.
   - Open `index.html` and look at the surrounding markup, so the Arabic reads naturally in the same order.
   - Each fragment must stay a separate entry.
   - Keep end punctuation where the English has it. Use the Arabic comma "،" inside sentences.
6. **Short UI labels stay short:** buttons, chips, nav and tabs. Example: "Request a quote" → "اطلب عرض سعر".
7. **Brand-only strings:** if a string is only a brand or model name (e.g. "Dahua", "HPE"), its translation is the same text unchanged.
8. **Dashes:** keep "—" dashes and "·" separators where they help.

## Glossary (use these exact terms)
| English | Arabic |
|---|---|
| IT / information technology | تقنية المعلومات |
| IT solutions | حلول تقنية المعلومات |
| security systems | الأنظمة الأمنية |
| CCTV (acronym) / surveillance (word) | CCTV / كاميرات المراقبة، المراقبة بالفيديو |
| access control | التحكم في الدخول |
| attendance / time attendance | الحضور والانصراف |
| biometric | البصمة / الأجهزة البيومترية |
| networking | الشبكات |
| structured cabling | الكابلات الهيكلية |
| Wi-Fi | Wi-Fi |
| firewall | جدار الحماية |
| server(s) | خادم / خوادم (never سيرفر) |
| IP telephony / IP phones | هواتف IP / أنظمة هواتف IP |
| intercom | الاتصال الداخلي |
| meeting rooms | غرف الاجتماعات |
| audio-visual (AV) | الأنظمة السمعية والبصرية (when spelled out) / AV (when the English says "AV") |
| displays | الشاشات |
| Annual Maintenance Contract (AMC) | عقد الصيانة السنوية (AMC): the English itself has both, so keep both; plain "AMC" → AMC |
| system integrator | مُكامل أنظمة |
| solution(s) | حل / حلول |
| products | المنتجات |
| services | الخدمات |
| brands | العلامات التجارية |
| projects | المشاريع |
| industries | القطاعات |
| quote / quotation | عرض سعر |
| Request a quote | اطلب عرض سعر |
| Talk to a human | تحدث مع موظف |
| WhatsApp | WhatsApp |
| Call | اتصل |
| Email | البريد الإلكتروني |
| Abu Dhabi | أبوظبي |
| Dubai | دبي |
| Musaffah | مصفح |
| Al Qusais | القصيص |
| Sheikh Zayed Road | شارع الشيخ زايد |
| UAE / United Arab Emirates | الإمارات / الإمارات العربية المتحدة |
| Head Office | المكتب الرئيسي |
| branch | فرع |
| Commercial LED Division | قسم شاشات LED التجارية |
| Corporate Hubs | المراكز المؤسسية |
| P.O. Box | ص.ب. |
| since 2011 | منذ 2011 |
| SMEs | الشركات الصغيرة والمتوسطة |
| assistant (the chatbot) | المساعد |
| Your All in One IT Solution Partner | شريكك المتكامل لحلول تقنية المعلومات |

## Output format
Write a JSON object `{ "<English exactly as given>": "<Arabic>" }` with every `en` value from your todo file as a key, character for character, with no key left out. Save it as UTF-8, then check that it parses with `node -e "JSON.parse(require('fs').readFileSync(FILE,'utf8'))"`, and confirm the key count matches the todo file.
