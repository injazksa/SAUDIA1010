let professionsData = [];
let filteredData = [];
let renderedCount = 0;
const BATCH_SIZE = 30;
let currentProfession = null;
let professionModalScrollY = 0; // ✅ حفظ موضع التمرير عند فتح النافذة
let professionModalBodyState = null;

// Load professions data on page load
document.addEventListener('DOMContentLoaded', function() {
    // Other pages (e.g. «مسار أوراقي») load this file only to reuse computeRequirements: skip the list UI there.
    if (!document.getElementById('professionsGrid')) return;
    loadProfessions();
    
    // Search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProfessions, 300));
    }
    
    // Category filter event listener
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProfessions);
    }

    // Gender filter event listener
    const genderFilter = document.getElementById('genderFilter');
    if (genderFilter) {
        genderFilter.addEventListener('change', () => {
            filterProfessions();
            refreshOpenProfessionDetails();
        });
    }

    const nationalityFilter = document.getElementById('nationalityFilter');
    const residencyFilter = document.getElementById('residencyFilter');
    const otherNationality = document.getElementById('otherNationality');
    if (nationalityFilter) nationalityFilter.addEventListener('change', () => {
        syncNationalityControls();
        refreshOpenProfessionDetails();
    });
    if (residencyFilter) residencyFilter.addEventListener('change', refreshOpenProfessionDetails);
    // owner 2026-10-29: marital status and no-objection source (women's documents)
    ['maritalFilter', 'consentSourceFilter'].forEach((id) => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { filterProfessions(); refreshOpenProfessionDetails(); }); });
    if (otherNationality) otherNationality.addEventListener('input', refreshOpenProfessionDetails);
    const dualPassport = document.getElementById('dualPassport');
    if (dualPassport) dualPassport.addEventListener('change', refreshOpenProfessionDetails);
    // owner 2026-10-27: one field to type or pick the nationality (js/sd-nationality.js, loaded with defer)
    const natUp = () => { if (window.SD_NAT && nationalityFilter && nationalityFilter.tagName === 'SELECT') window.SD_NAT.enhance(nationalityFilter, otherNationality); };
    if (window.SD_NAT) natUp(); else window.addEventListener('load', natUp);
    syncNationalityControls();

    // ⚡ Event delegation للكروت
    const grid = document.getElementById('professionsGrid');
    if (grid) {
        grid.addEventListener('click', function(e) {
            const card = e.target.closest('[data-prof-idx]');
            if (!card) return;
            // links inside a card (profession page, «مسار أوراقي») open normally
            if (e.target.closest('a')) return;
            // تجاهل النقرات داخل منطقة الأوراق المفتوحة (X، طباعة، واتساب)
            if (e.target.closest('.prof-inline-details')) return;
            const idx = parseInt(card.dataset.profIdx, 10);
            const source = filteredData.length ? filteredData : professionsData;
            if (source[idx]) toggleProfessionInline(card, source[idx]);
        });
        // keyboard: Enter / Space open a redesigned card like a click
        grid.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target.closest('.sd-pcard');
            if (!card || e.target !== card) return;
            e.preventDefault();
            card.click();
        });
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;
    const modal = document.getElementById('professionModal');
    if (modal && !modal.classList.contains('hidden')) closeProfessionModal();
});

// Load professions from JSON file
async function loadProfessions() {
    try {
        // Reuse the download smart-fallback.js already started (same file, read-only), otherwise fetch it here.
        const data = await (window.SD_professionsPromise || fetch('professions.json').then(r => r.json()));
        professionsData = data;
        filteredData = data;

        // 🔗 دعم روابط الفوتر الذكية: قراءة ?category= و ?search= من الرابط للفلترة المسبقة
        try {
            const params = new URLSearchParams(window.location.search);
            const cat = params.get('category');
            const q = params.get('search');
            const catSel = document.getElementById('categoryFilter');
            const searchInput = document.getElementById('searchInput');
            if (cat && catSel) {
                for (const opt of catSel.options) {
                    if (opt.value === cat) { catSel.value = cat; break; }
                }
            }
            if (q && searchInput) searchInput.value = q;
            if ((cat && catSel && catSel.value === cat) || q) {
                filterProfessions();
                document.getElementById('loadingState').classList.add('hidden');
                document.getElementById('professionsGrid').classList.remove('hidden');
                return;
            }
        } catch (e) {}

        displayProfessions(professionsData);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('professionsGrid').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading professions:', error);
    }
}

// Custom Alert Functions
function showCustomAlert(message, duration = 5000) {
    const container = document.getElementById('customAlertContainer');
    const msgElement = document.getElementById('customAlertMessage');
    if (!container || !msgElement) return;
    
    msgElement.textContent = message;
    container.classList.remove('opacity-0', '-translate-y-4');
    container.classList.add('opacity-100', 'translate-y-0');
    
    if (window._alertTimeout) clearTimeout(window._alertTimeout);
    window._alertTimeout = setTimeout(hideCustomAlert, duration);
}

function hideCustomAlert() {
    const container = document.getElementById('customAlertContainer');
    if (!container) return;
    container.classList.add('opacity-0', '-translate-y-4');
    container.classList.remove('opacity-100', 'translate-y-0');
}

// Normalize Arabic text for better search
function normalizeArabic(text) {
    if (!text) return '';
    return text
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ةه]/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[ـ]/g, '')        // strip tatweel
        .replace(/\s+/g, ' ')       // collapse whitespace
        .toLowerCase()
        .trim();
}

/* ── Profession search (owner 2026-10-25): ranked, tolerant of hamza/alef spelling, Arabic + English + code ──
 * The official names are never changed; only the comparison is tolerant. Shared by the professions page and
 * «مسار أوراقي» (window.SD_searchProfessions). Ranking: exact name > name starts with the query > a word of the
 * name starts with it > the query inside the name (3+ letters) > code > English name. A 1–2 letter query only
 * matches the START of a word (no single-letter matches in the middle of names). */
function sdNorm(text) {
    return String(text || '')
        .replace(/[ً-ٰٟ]/g, '')   // diacritics
        .replace(/[أإآٱ]/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
        .replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ـ/g, '')
        .replace(/[^؀-ۿa-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ').toLowerCase().trim();
}
const sdWords = (s) => s.split(' ').filter(Boolean).map((w) => (w.length > 4 && w.startsWith('ال') ? w.slice(2) : w));
// Approved word forms (rank 4, after the name itself): what people type → the word stem used in the official names.
// Only stems that exist in professions.json. 2026-10-28: the official «مهندس …» titles are now office records, so «مهندس»
// matches them directly; the form «هندس» still finds «هندسة / هندسية» titles, ranked below (and dropped when an engineer matches).
const SD_WORD_FORMS = { 'مهندس': ['هندس'], 'هندسه': ['هندس'], 'ممرض': ['تمريض'], 'ممرضه': ['تمريض'], 'صيدلي': ['صيدل'], 'صيدلاني': ['صيدل'], 'مبرمج': ['برمج'], 'مدرس': ['معلم', 'مدرس'], 'استاذ': ['استاذ', 'معلم'] };
function sdForms(q) {
    const out = [];
    for (const k of Object.keys(SD_WORD_FORMS)) if (q.length >= 4 && (k.startsWith(q) || q.startsWith(k))) out.push(...SD_WORD_FORMS[k]);
    return out;
}
function sdScore(p, qn, qWords, rawDigits) {
    const nameN = p.__n || (p.__n = sdNorm(p.profession_name_ar || p.name_ar || p.name || ''));
    const words = p.__w || (p.__w = sdWords(nameN));
    // English: the office record's own English name + the OFFICIAL English title of its code (HRSD), only for a code whose
    // official Arabic title is the same profession (same / close) — a conflicting code never lends its English title
    if (SD_DICT && !p.__eDict) { p.__eDict = 1; p.__e = undefined; }
    const en = p.__e != null ? p.__e : (p.__e = sdNorm([p.name_en, SD_officialEnglish(p)].filter(Boolean).join(' ')));
    const code = String(p.profession_code || p.code || '');
    // a number that is not a confirmed official code (no_official_code) is not found by «code» search (2026-10-29)
    if (rawDigits) return p.no_official_code ? 0 : code === rawDigits ? 1000 : code.startsWith(rawDigits) ? 700 - code.length : 0;
    if (!qn) return 0;
    if (nameN === qn) return 1000;
    let s = 0;
    if (nameN.startsWith(qn)) s = 800;
    // the office's former wording of the title (record.aliases, 2026-10-28) finds the official title
    if (!s && p.aliases) { const al = p.__a || (p.__a = p.aliases.map(sdNorm)); if (al.includes(qn)) s = 990; else if (al.some((a) => a.startsWith(qn))) s = 780; }
    // every query word must start a word of the name (any order) — "مهندس كهرباء", "اخصائي تسويق"
    const allPrefix = qWords.every((q) => words.some((w) => w.startsWith(q)));
    if (allPrefix) s = Math.max(s, 600 + (words[0] && words[0].startsWith(qWords[0]) ? 50 : 0));
    if (!s && qn.length >= 3 && nameN.includes(qn)) s = 400;
    if (!s) { // approved word forms: every query word matches directly or through its form
        const ok = qWords.every((q) => words.some((w) => w.startsWith(q)) || sdForms(q).some((f) => words.some((w) => w.startsWith(f))));
        if (ok && qWords.some((q) => sdForms(q).length)) s = 350;
    }
    if (!s && en && qn.length >= 2 && /[a-z]/.test(qn)) {
        const ew = en.split(' ');
        qWords = qWords.map((q) => (q === 'engineering' ? 'engineer' : q)); // «civil engineering» → the title «Civil Engineer»
        // a whole English word («nurse») ranks above a word that only starts with it («nursery»)
        if (en === qn) s = 500; else if (qWords.every((q) => ew.includes(q) || ew.includes(q + 's'))) s = 480; else if (qWords.every((q) => ew.some((w) => w.startsWith(q)))) s = 450; else if (qn.length >= 3 && en.includes(qn)) s = 300;
    }
    return s ? s - Math.min(nameN.length, 60) / 10 : 0; // shorter names first among equals
}
function SD_searchProfessions(list, query, limit) {
    const raw = String(query || '').trim();
    const digits = /^\d{2,6}$/.test(raw) ? raw : '';
    const qn = sdNorm(raw), qWords = sdWords(qn);
    if (!digits && !qn) return [];
    const scored = [];
    for (const p of list) { const s = sdScore(p, qn, qWords, digits); if (s > 0) scored.push([s, p]); }
    scored.sort((a, b) => b[0] - a[0]);
    // owner 2026-10-28: «مهندس …» that matches an engineer title shows engineers only — a manager or technician title that
    // merely contains «هندسة» (word form) is another profession with other documents
    let out = scored;
    if (/^مهندس(?:ه)?(?: |$)/.test(qn) && scored.length && scored[0][0] >= 590) out = scored.filter((x) => x[0] >= 590);
    return (limit ? out.slice(0, limit) : out).map((x) => x[1]);
}
// close spellings that EXIST in the data (edit distance on words) — offered only when nothing matched
function SD_suggestProfessions(list, query, limit = 3) {
    const qn = sdNorm(query); if (qn.length < 3) return [];
    const lev = (a, b) => { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j; for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
    // a near-miss of a known word form («مهندز» ≈ «مهندس») searches that form first
    for (const k of Object.keys(SD_WORD_FORMS)) {
        if (lev(qn, k) === 1) { const r = SD_searchProfessions(list, k, limit); if (r.length) return r; }
    }
    const qw = sdWords(qn); const out = [];
    for (const p of list) {
        const words = p.__w || (p.__w = sdWords(sdNorm(p.profession_name_ar || p.name_ar || '')));
        let best = 9; for (const q of qw) for (const w of words) best = Math.min(best, lev(q, w.slice(0, Math.max(q.length, w.length))));
        const tol = qn.length <= 4 ? 1 : 2;
        if (best <= tol) out.push([best, p]);
    }
    return out.sort((a, b) => a[0] - b[0]).slice(0, limit).map((x) => x[1]);
}
// best search score (1000 = the same name, 800 = a name that starts with the query); used to decide when a title is
// «not in the list» and an estimate by category is offered
function SD_bestScore(list, query) {
    const raw = String(query || '').trim(), digits = /^\d{2,6}$/.test(raw) ? raw : '', qn = sdNorm(raw), qWords = sdWords(qn);
    let best = 0; for (const p of list) best = Math.max(best, sdScore(p, qn, qWords, digits)); return best;
}

/* ── Smart search, stage 2 (owner 2026-10-26): a title that is NOT in the data is classified by its meaning and gets the
 * documents of a REAL record of that category (never a hand-written list), then the same computeRequirements() as every
 * other tool (rules, nationality, gender, QVP/SVP, letter, practice certificate). The result is labelled as an estimate.
 * Category template = a named record, or the most common document set among the records of that category.
 * Senior management / owners (رئيس تنفيذي، مستثمر، رئيس مجلس إدارة، صاحب شركة…) are an exception: no estimated list. */
function sdMostCommon(list, keep) {
    const groups = new Map();
    for (const p of list) { if (!keep(p)) continue; const k = JSON.stringify(p.requirements); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); }
    let best = null; for (const g of groups.values()) if (!best || g.length > best.length) best = g;
    return best ? { ...best[0], _groupSize: best.length } : null; // a shared set: described by its size, not one title
}
const SD_SENIOR_CODES = ['112001', '112002', '112004', '112007', '112009'];
const SD_SVP_NOTE = 'قد تختلف حالة تفعيل الفحص المهني لهذه المهنة. يُرجى مراجعة المكتب للتأكد من إمكانية إجراء الفحص والمتطلبات المعتمدة قبل استكمال المعاملة.';
// craft titles (the whole title is read: «مهندس كهرباء» starts with «مهندس» and is NOT a craft; «مدير صيانة» is a manager)
const SD_CRAFT_RE = /^(?:نجار|نجاره|حداد|سباك|كهربايي|ميكانيكي|ميكانيك|دهان|بلاط|مبلط|لحام|خياط|خياطه|نقاش|بناء|معلم بناء|قصير|جبس|فني تكييف|فني تبريد|فني تكييف وتبريد|فني صيانه سيارات|سمكري|منجد|خراط)(?: |$)/;
// a one-word craft/trade title is general («حداد»): it gets the category estimate even when longer records exist
const SD_HEAD_ONLY_RE = /^(?:نجار|حداد|سباك|كهربايي|ميكانيكي|دهان|بلاط|لحام|خياط|نقاش|طاهي|حلاق|مصفف|مصففه|طباخ|شيف|كوافير)$/;
// known synonyms → the official wording in the data (whole words, normalised)
const SD_SYNONYMS = [['سيارات', 'مركبات'], ['سياره', 'مركبات'], ['مستودع', 'مخزن'], ['مستودعات', 'مخزن'], ['مربيه اطفال', 'مربيه منزليه'], ['خادمه', 'عامله منزليه'], ['خادمه منزليه', 'عامله منزليه'], ['طباخ', 'طاهي'], ['طاه', 'طاهي'],
    // owner 2026-10-27: common wrong spellings of an existing title (no new profession is created)
    ['فني كهربا ميكانيك', 'فني كهروميكانيك'], ['فني كهربايي ميكانيكي', 'فني كهروميكانيك'], ['فني كهروميكانيكي', 'فني كهروميكانيك'], ['كهربا ميكانيك', 'كهروميكانيك'], ['مصففه', 'مصفف'], ['كوافير', 'مصفف شعر'], ['كوافيره', 'مصفف شعر'], ['مزين', 'حلاق'], ['مخازن', 'مخزن'],
    // owner 2026-10-29: common names of health professions → their OFFICIAL titles (HRSD), only where the official title is the same job
    ['طبيب اسنان', 'طبيب اسنان عام'], ['دكتور اسنان', 'طبيب اسنان عام'], ['طبيب قلب', 'طبيب قلب واوعيه دمويه'], ['اخصايي قلب', 'طبيب قلب واوعيه دمويه'],
    ['اخصايي كلي', 'طبيب كلي'], ['اخصايي كلى', 'طبيب كلي'], ['طبيب عيون', 'طبيب جراح عيون'], ['اخصايي عيون', 'طبيب جراح عيون'], ['طبيب باطنيه', 'طبيب باطني'], ['اخصايي باطنيه', 'طبيب باطني'],
    ['طبيب نساييه', 'طبيب نسا وولاده'], ['اخصايي نساييه', 'طبيب نسا وولاده'], ['طبيب عظام', 'طبيب جراح عظام'], ['اخصايي عظام', 'طبيب جراح عظام'],
    ['اخصايي اطفال', 'طبيب اطفال'], ['طبيب جلديه', 'طبيب امراض جلديه'], ['اخصايي جلديه', 'طبيب امراض جلديه'], ['طبيب اعصاب', 'طبيب مخ واعصاب'],
    ['طبيب نفسيه', 'طبيب نفسي'], ['طبيب تجميل', 'طبيب جراح تجميل'], ['صيدلاني', 'صيدلي'], ['صيدلانيه', 'صيدلي'], ['طبيبه', 'طبيب'], ['دكتور', 'طبيب'], ['دكتوره', 'طبيب']];
function sdSynonymRecord(list, n) {
    for (const [from, to] of SD_SYNONYMS) {
        const re = new RegExp(`(^| )${from}( |$)`);
        if (!re.test(n)) continue;
        const v = n.replace(re, `$1${to}$2`);
        const hit = list.find((p) => sdNorm(p.profession_name_ar || p.name_ar || '') === v);
        if (hit) return hit;
    }
    return null;
}
/* ── Engineers (owner 2026-10-28) ──
 * The office list now holds the official «مهندس …» titles (HRSD codes). A typed engineering title is matched to THOSE
 * records only — never to a manager or technician title that contains «هندسة», and never by guessing a code:
 *   «هندسة مدنية» / «مهندسة مدنية» → «مهندس مدني» · common spellings below → the official title
 *   one engineer title fits → that record · several fit («مهندس ميكانيك») → the visitor chooses · none → the usual flow
 * «مهندس» alone → the list of engineering specialties to choose from (no estimate for a generic title). */
const SD_ENG_SYNONYMS = [['مهندس كهربا', 'مهندس كهربايي'], ['مهندس كهربايي ميكانيكي', 'مهندس كهروميكانيكي'], ['مهندس كهربا ميكانيك', 'مهندس كهروميكانيكي'],
    ['مهندس ميكاترونيكس', 'مهندس ميكاترونكس'], ['مهندس ميكاترونيك', 'مهندس ميكاترونكس'], ['مهندس ميكاترونك', 'مهندس ميكاترونكس'], ['مهندس ميكترونكس', 'مهندس ميكاترونكس'],
    ['مهندس الكترونيك', 'مهندس الكترونيات'], ['مهندس الكترونيه', 'مهندس الكترونيات'], ['مهندس برمجه', 'مهندس برمجيات'], ['مهندس سوفتوير', 'مهندس برمجيات'],
    ['مهندس سوفت وير', 'مهندس برمجيات'], ['مهندس كمبيوتر', 'مهندس حاسب الي'], ['مهندس حاسوب', 'مهندس حاسب الي'], ['مهندس حاسبات', 'مهندس حاسب الي'],
    ['مهندس عماره', 'مهندس معماري'], ['مهندس تكييف وتبريد', 'مهندس تدفيه وتهويه وتكييف'], ['مهندس تكييف', 'مهندس تدفيه وتهويه وتكييف'], ['مهندس انشاءات', 'مهندس انشايي'], ['مهندس انشاات', 'مهندس انشايي']];
const SD_ENG_GENERIC = ['مهندس', 'مهندسه', 'هندسه', 'الهندسه', 'مهندسين', 'engineer', 'engineers', 'engineering'];
const sdIsEngineer = (p) => /^مهندس /.test(sdNorm(p.profession_name_ar || p.name_ar || ''));
function sdEngineerChoice(list, q, options, female) {
    const fem = (r) => (female && r.gender !== 'أنثى' ? { ...r, gender: 'أنثى' } : r);
    const opts = options.map((r) => ({ label: r.name_ar, record: fem(r) }));
    const few = opts.slice(0, 8).map((o) => '«' + o.label + '»').join('، ');
    return { kind: 'choose', engineering: true, question: q, options: opts, message: `${q} ${few}${opts.length > 8 ? '، وغيرها' : ''}. اكتب التخصص كما هو في التأشيرة.` };
}
function sdEngineerMatch(list, n, raw) {
    const eng = list.filter(sdIsEngineer);
    if (!eng.length) return null;
    n = n.replace(/^(?:مهندز|مهندص|مهندش|مهنتس|مهدس|مهنس)(?= |$)/, 'مهندس'); // common typing slips of «مهندس»
    if (SD_ENG_GENERIC.includes(n)) {
        const all = eng.slice().sort((a, b) => String(a.code).localeCompare(String(b.code)));
        return sdEngineerChoice(list, `«${String(raw).trim()}» مسمى عام. اختر تخصصك الهندسي كما هو مكتوب في التأشيرة (المسميات والرموز من التصنيف المهني الرسمي):`, all, /^مهندسه$/.test(n));
    }
    let q = n, female = false;
    // «مهندسة مدنية» (a woman) and «هندسة مدنية» (the field) → «مهندس مدني» (the title): the adjective loses its feminine ending
    const masc = (s) => s.split(' ').map((w) => (/يه$/.test(w) ? w.slice(0, -1) : w)).join(' ');
    if (/^مهندسه /.test(q)) { q = 'مهندس ' + masc(q.replace(/^مهندسه /, '')); female = true; }
    else if (/^(?:ال)?هندسه /.test(q)) q = 'مهندس ' + masc(q.replace(/^(?:ال)?هندسه /, ''));
    if (!/^مهندس \S/.test(q)) return null;
    for (const [from, to] of SD_ENG_SYNONYMS) if (q === from || q.startsWith(from + ' ')) { q = to + q.slice(from.length); break; }
    const fem = (r) => (female && r.gender !== 'أنثى' ? { ...r, gender: 'أنثى' } : r);
    const exact = eng.find((p) => sdNorm(p.name_ar) === q);
    if (exact) return { kind: 'synonym', record: fem(exact) };
    const qw = sdWords(q).slice(1);
    const hits = eng.filter((p) => { const w = sdWords(sdNorm(p.name_ar)).slice(1); return qw.every((x) => w.some((y) => y.startsWith(x))); })
        .sort((a, b) => a.name_ar.length - b.name_ar.length || String(a.code).localeCompare(String(b.code)));
    if (hits.length === 1) return { kind: 'synonym', record: fem(hits[0]) };
    if (hits.length > 1) return sdEngineerChoice(list, `«${String(raw).trim()}» يطابق أكثر من مسمى هندسي رسمي، ولكل مسمى رمزه. اختر المسمى المكتوب في تأشيرتك:`, hits, female);
    return null;
}
/* Related office professions for an official title the office has NOT registered (owner 2026-10-28, e.g. «خباز»):
 * shown as choices beside a clear message — their documents belong to THEIR titles, nothing is copied to the typed one. */
const SD_RELATED = [
    [/(?:^| )(?:خباز|خبازه|مخبز|مخابز|معجنات|حلويات|حلواني)(?: |$)/, ['512001', '343401'], 'الطهي والمطابخ'],
];
function sdRelatedChoice(list, n, msg) {
    for (const [re, codes, field] of SD_RELATED) {
        if (!re.test(n)) continue;
        const recs = codes.map((c) => sdByCode(list, c)).filter(Boolean);
        if (!recs.length) return null;
        const q = `${msg} مهن قريبة في مجال ${field} مسجلة في قائمة المكتب (أوراق كل منها تخص مسماها فقط):`;
        return { kind: 'choose', related: true, question: q, options: recs.map((r) => ({ label: r.name_ar, record: r })), message: q + ' ' + recs.map((r) => '«' + r.name_ar + '»').join(' أو ') + '.' };
    }
    return null;
}
/* The ONE entry point every tool uses for a typed title (owner 2026-10-26):
 *  1) the same name in the data → { kind:'exact', record }
 *  2) a known synonym of a name in the data → { kind:'synonym', record }
 *  3) names that start with what was typed (still typing / a longer official title) → { kind:'partial' } (normal results)
 *  4) otherwise the category estimate → { kind:'estimate', record } or { kind:'message', message } (generic / senior)
 *  null: nothing recognised. */
function SD_resolveTitle(list, title) {
    const n = sdNorm(title); if (!n || !list || !list.length) return null;
    const exact = list.find((p) => sdNorm(p.profession_name_ar || p.name_ar || '') === n);
    if (exact) return { kind: 'exact', record: exact };
    // owner 2026-10-27: a word with two different professions behind it → the visitor chooses (no silent guess)
    const amb = SD_AMBIGUOUS[n];
    if (amb) {
        const options = amb.options.map((o) => (o.code ? { label: o.label || '', record: sdByCode(list, o.code) } : o)).filter((o) => !o.code || o.record);
        // message: for tools that show text only (smart search panel) — the question and the choices in words
        const q = amb.q.replace(/^«[^»]+»/, '«' + String(title).trim() + '»'); // the word the visitor typed («مدرس», «سواق»)
        return { kind: 'choose', question: q, options, message: q + ' ' + options.map((o) => '«' + (o.label || (o.record && o.record.name_ar)) + '»').join(' أو ') + '. اكتب المسمى الذي تقصده.' };
    }
    // owner 2026-10-28: the office's former wording of a title now written as the official one («نجار مباني» → «نجّار»)
    const alias = list.find((p) => (p.aliases || []).some((a) => sdNorm(a) === n));
    if (alias) return { kind: 'synonym', record: alias, alias: true };
    const syn = sdSynonymRecord(list, n);
    // a feminine form of a male record («مصففة شعر» → «مصفف شعر»): the same record, with the women's documents
    if (syn) return { kind: 'synonym', record: /^\S+ه(?: |$)/.test(n) && syn.gender !== 'أنثى' && !/ه$/.test(sdNorm(syn.name_ar).split(' ')[0]) ? { ...syn, gender: 'أنثى' } : syn };
    // owner 2026-10-28: engineering titles → the official engineer records (or a choice), never an estimate from a look-alike
    const engm = sdEngineerMatch(list, n, title);
    if (engm) return engm;
    // owner 2026-10-27: an official code or title (internal dictionary) — a code already in the office list keeps its
    // normal result; one-word craft titles («نجار») keep their approved category estimate
    const raw = String(title || '').trim();
    if (!(/^\d{6}$/.test(raw) && sdByCode(list, raw) && !sdByCode(list, raw).no_official_code) && !SD_HEAD_ONLY_RE.test(n)) {
        const d = sdDictLookup(list, raw);
        if (d && !(d.kind === 'estimate' && SD_bestScore(list, title) >= 800)) return d;
    }
    if (SD_bestScore(list, title) >= 800 && !SD_HEAD_ONLY_RE.test(n)) return { kind: 'partial' };
    const est = SD_estimateProfession(list, title);
    if (est && est.record) return { kind: 'estimate', record: est.record };
    if (est && est.message) return { kind: 'message', message: est.message, senior: !!est.senior };
    return sdRelatedChoice(list, n, `لم نجد «${raw}» في قائمة مهن المكتب، فلا نعرض له أوراقًا. تواصل مع المكتب لتحديد أوراقه.`);
}
const SD_HOUSEHOLD_CODES = ['911101', '531102', '531101', '832201'];
// owner 2026-10-27: ambiguous words → a question with clear choices (record = an office profession; query = search again)
const SD_AMBIGUOUS = (() => {
    const teacher = { q: '«أستاذ» قد تعني معلمًا في مدرسة أو أستاذًا في التعليم العالي، وأوراقهما مختلفة. اختر المقصود:', options: [{ query: 'معلم', label: 'معلم مدرسة' }, { code: '231001', label: 'أستاذ تعليم عالي' }] };
    const mech = { q: '«ميكانيكي» قد تعني مهندسًا ميكانيكيًا (مؤهل جامعي هندسي) أو ميكانيكيًا حرفيًا، وأوراقهما مختلفة. اختر المقصود، أو اكتب المسمى الحرفي كاملًا كما في التأشيرة:', options: [{ code: '214401', label: 'مهندس ميكانيكي' }, { code: '723101', label: 'ميكانيكي سيارات (حرفي)' }] };
    const elec = { q: '«كهربائي» قد تعني مهندسًا كهربائيًا (مؤهل جامعي هندسي) أو كهربائيًا حرفيًا، وأوراقهما مختلفة. اختر المقصود:', options: [{ code: '215101', label: 'مهندس كهربائي' }, { code: '741101', label: 'كهربائي مباني' }, { code: '741201', label: 'كهربائي سيارات' }] };
    const doctor = { q: '«طبيب» مسمى عام: اختر المسمى المكتوب في تأشيرتك، أو اكتب التخصص (مثل: طبيب أطفال، طبيب قلب وأوعية دموية):', options: [{ code: '221101', label: 'طبيب عام' }, { code: '221201', label: 'طبيب أخصائي' }, { code: '226101', label: 'طبيب أسنان عام' }, { code: '225001', label: 'طبيب بيطري' }] };
    const nurse = { q: '«ممرض» قد تعني أخصائي تمريض (بكالوريوس) أو فني تمريض، ولكل منهما رمزه. اختر المسمى المكتوب في تأشيرتك:', options: [{ code: '222101', label: 'أخصائي تمريض' }, { code: '322101', label: 'فني تمريض' }, { code: '222201', label: 'أخصائي قبالة' }] };
    const emech = { q: '«كهروميكانيك» قد تعني مهندسًا كهروميكانيكيًا أو فني كهروميكانيك، وأوراقهما مختلفة. اختر المقصود:', options: [{ code: '215104', label: 'مهندس كهروميكانيكي' }, { code: '311308', label: 'فني كهروميكانيك' }] };
    const mtx = { q: '«ميكاترونكس» قد تعني مهندس ميكاترونكس أو فني ميكاترونيكس، وأوراقهما مختلفة. اختر المقصود:', options: [{ code: '214412', label: 'مهندس ميكاترونكس' }, { code: '311902', label: 'فني ميكاترونيكس' }] };
    const driver = { q: '«سائق» قد تعني سائقًا خاصًا لدى أسرة (عمالة منزلية) أو سائقًا لدى شركة، وأوراقهما مختلفة. اختر المقصود:', options: [{ code: '832201', label: 'سائق خاص لدى أسرة' }, { query: 'سائق سيارة', label: 'سائق لدى شركة' }] };
    return { 'شيف': { q: '«شيف» قد تعني «طاهي» أو «رئيس طهاة»، وأوراقهما مختلفة. اختر المقصود:', options: [{ code: '512001', label: 'طاهي' }, { code: '343401', label: 'رئيس طهاة' }] },
        'استاذ': teacher, 'مدرس': teacher, 'سايق': driver, 'سواق': driver, 'شوفير': driver, 'طبيب': doctor, 'دكتور': doctor, 'طبيبه': doctor, 'ممرض': nurse, 'ممرضه': nurse, 'تمريض': nurse,
        // owner 2026-10-28: an engineer and a craftsman / technician with a similar word have different documents
        ...Object.fromEntries(['ميكانيكي', 'ميكانيك'].map((w) => [w, mech])), ...Object.fromEntries(['كهربايي', 'كهربا'].map((w) => [w, elec])),
        ...Object.fromEntries(['كهروميكانيك', 'كهروميكانيكي'].map((w) => [w, emech])), ...Object.fromEntries(['ميكاترونكس', 'ميكاترونيكس', 'ميكاترونيك'].map((w) => [w, mtx])) };
})();
const sdStarts = (p, re) => re.test(sdNorm(p.profession_name_ar || p.name_ar || ''));
const sdByCode = (list, c) => list.find((p) => String(p.code) === c) || null;
const sdByName = (list, n) => list.find((p) => (p.profession_name_ar || p.name_ar) === n) || null;
const SD_EST_RULES = [
    // [category label, test on the normalised title, template record]
    // owner 2026-10-27: «سائق خاص» (household) is NOT a synonym of «سائق سيارة» / a company driver — only household wording maps here
    ['المهن السايقة', /^(?:سايق|سواق|شوفير) (?:خاص|عايله|منزلي|اسره|لدى اسره)$/, (l) => sdByCode(l, '832201')],
    ['العمالة المنزلية (مربية)', /(?:^| )(?:مربيه|جليسه اطفال)(?: |$)/, (l) => sdByCode(l, '531101')],
    ['العمالة المنزلية', /عامله منزليه|خادمه|مدبره منزل/, (l) => sdByCode(l, '531102')],
    ['العمالة المنزلية', /عامل منزلي|خادم منزلي|عامل خدمه منزليه/, (l) => sdByCode(l, '911101')],
    // owner 2026-10-26: «عاملة مساندة» (female) / «عامل مساعد» (male) — the documents of «عاملة منزلية»; no official code
    ['العمالة المنزلية (عاملة مساندة / عامل مساعد)', /^(?:عامله مسانده|عامل مساعد|عامل مساند|عامله مساعده)$/, (l) => sdByCode(l, '531102')],
    ['المهن السايقة', /^(?:سايق|سايق|سواق|شوفير) /, (l) => sdMostCommon(l, (p) => sdStarts(p, /^سايق/) && p.code !== '832201')], // no fallback to the household driver
    ['تصفيف الشعر والحلاقة', /(?:^| )(?:مصفف|مصففه|كوافير|كوافيره|حلاق|حلاقه)(?: |$)/, (l) => sdByCode(l, '514101')],
    ['الطهاة', /(?:^| )(?:طاهي|طاهيه|طباخ|طباخه|شيف)(?: |$)/, (l) => sdByCode(l, '512001')],
    // crafts: the shared document set of the craft records (10th grade, 1 year, practice certificate, SVP, no letter)
    ['المهن الحرفية', SD_CRAFT_RE, (l) => sdMostCommon(l, (p) => (p.requirements || []).some((r) => /^أصل شهادة مزاولة المهنة وصورة عنها، مختومة من وزارة الأشغال/.test(r))) || sdByCode(l, '711501')],
    ['العمال', /^(?:عامل|عامله|عمال)(?: |$)/, (l) => sdMostCommon(l, (p) => professionProfile(p).worker && !SD_HOUSEHOLD_CODES.includes(String(p.code)))],
    ['المهندسون', /^(?:مهندس|مهندسه) \S/, (l) => sdMostCommon(l, (p) => professionProfile(p).engineering)],
    ['الأطباء', /^(?:طبيب|طبيبه|دكتور|دكتوره) \S/, (l) => sdByCode(l, '221101')],
    ['التمريض', /(?:^| )(?:ممرض|ممرضه|تمريض)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /تمريض|ممرض/))],
    ['الصيدلة', /(?:^| )(?:صيدلي|صيدلانيه|صيدلاني|صيدليه)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /صيدل/))],
    ['تنسيق الزهور', /^(?:منسق|منسقه) (?:زهور|ورد)/, (l) => sdByName(l, 'منسق زهور')],
    ['البيع', /^(?:بايع|بايعه)(?: |$)/, (l) => sdByCode(l, '522301')],
    ['الإشراف والمراقبة والمندوبون (مجموعة مراقب الجودة)', /^(?:مشرف|مشرفه|مراقب|مراقبه|مندوب|مندوبه)(?: |$)/, (l) => sdByName(l, 'مراقب الجودة')],
    ['المساعدون الإداريون', /^(?:مساعد اداري|مساعده اداريه|سكرتير|سكرتيره|موظف|موظفه|مدخل بيانات|مدخله بيانات|كاتب|كاتبه)(?: |$)/, (l) => sdByCode(l, '412001')], // «مساعد إداري»: official 412001 (it used 242211)
    ['الأخصاييون', /^(?:اخصايي|اخصاييه|اختصاصي|اختصاصيه|محلل|محلله|مستشار|مستشاره|باحث|باحثه|مصمم|مصممه|مبرمج|مبرمجه|مطور|مطوره|محاسب|محاسبه)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /^اخصايي/))],
    ['المدراء', /^(?:مدير|مديره|نايب مدير|رييس قسم)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /^مدير/) && !SD_SENIOR_CODES.includes(String(p.code)))],
    ['الفنيون', /^(?:فني|فنيه)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /^فني /))],
    ['المعلمون', /^(?:معلم|معلمه|مدرس|مدرسه|استاذ|استاذه|محاضر|محاضره)(?: |$)/, (l) => sdMostCommon(l, (p) => sdStarts(p, /^معلم/))],
];
const SD_SENIOR_RE = /رييس تنفيذي|^ceo$|مستثمر|رييس مجلس|صاحب (?:شركه|منشاه|عمل|مؤسسه)|مالك (?:شركه|منشاه|مؤسسه)|^مدير شركه|^شريك|مدير عام/;
const SD_GENERIC = ['مهندس', 'مهندسه', 'مدير', 'مديره', 'اخصايي', 'اخصاييه', 'اختصاصي', 'عامل', 'عامله', 'فني', 'فنيه', 'مشرف', 'مندوب', 'طبيب', 'دكتور'];
// → { record } (an estimated profession object) · { message } (no estimate: generic title / senior management) · null
function SD_estimateProfession(list, title) {
    const raw = String(title || '').trim(); const n = sdNorm(raw);
    if (!n || n.length < 3 || !list || !list.length) return null;
    if (SD_GENERIC.includes(n)) return { message: 'يرجى كتابة المسمى الكامل كما هو في التأشيرة (مثال: مهندس كهرباء، مدير مبيعات، عامل مستودع) حتى نحدد الفئة والأوراق المناسبة.' };
    if (SD_SENIOR_RE.test(n)) return { message: 'هذا المسمى من فئة الإدارة العليا وأصحاب الشركات (مثل الرئيس التنفيذي والمستثمر ورئيس مجلس الإدارة وصاحب الشركة). متطلباتها تختلف حسب الحالة ولا نقدّرها آليًا؛ تواصل مع المكتب لتحديد الأوراق.', senior: true };
    for (const [label, re, pick] of SD_EST_RULES) {
        if (!re.test(n)) continue;
        const rep = pick(list); if (!rep) continue;
        const female = /ه$/.test(n.split(' ')[0]) || /عامله منزليه|خادمه|مربيه|جليسه/.test(n);
        const basis = rep._groupSize > 1
            ? `الأوراق المشتركة بين ${rep._groupSize} ${rep._groupSize <= 10 ? 'مهن' : 'مهنة'} من هذه الفئة في القائمة`
            : `أوراق مهنة ${rep.profession_name_ar || rep.name_ar}${/^\d{6}$/.test(String(rep.code)) ? ' (' + rep.code + ')' : ''}`;
        let estNote = `نتيجة تقديرية: لم نجد «${raw}» في قائمة المهن المعتمدة، فعرضنا أوراق فئة «${label}» على أساس ${basis}. هذه ليست سجلًا رسميًا مكتملًا، ويؤكدها المكتب قبل التقديم.`;
        if ((rep.requirements || []).some((r) => /\(SVP\)/.test(r)) && !String(rep.note || '').includes(SD_SVP_NOTE)) estNote += ' • ' + SD_SVP_NOTE;
        return { record: {
            ...rep, code: '---', profession_code: '---', name_ar: raw, profession_name_ar: raw, name_en: '', slug: '',
            gender: female ? 'أنثى' : 'ذكر', _templateCode: String(rep.code), _templateName: rep.profession_name_ar || rep.name_ar,
            isAiGenerated: true, isEstimate: true, estimateLabel: label,
            note: [rep.note, estNote].filter(Boolean).join(' • '),
        } };
    }
    return null;
}
/* ── Internal dictionary of official occupation codes and titles (owner 2026-10-27) ──
 * /data/occupation-dictionary.json is built by tools/build-occupation-dictionary.js from the official HRSD list.
 * It only helps the search RECOGNISE a code or title: it never adds a profession, a page or a sitemap link, and it never
 * moves documents from one profession to another. Relations: same / close (the same code as an office record),
 * name (the same title as an office record, under another code), conflict (the code belongs to another title in the
 * office list: never linked), official (not in the office list: recognised only). Codes stay strings («0» kept). */
let SD_DICT = null, SD_dictLoading = null;
function SD_loadDictionary() {
    if (SD_DICT) return Promise.resolve(SD_DICT);
    if (SD_dictLoading) return SD_dictLoading;
    SD_dictLoading = fetch('/data/occupation-dictionary.json').then((r) => r.json()).then((d) => {
        const byCode = new Map(), byName = new Map(), rows = [];
        for (const [code, name, rel, link, en] of d.entries || []) {
            const e = { code: String(code), name, rel, link: String(link || ''), n: sdNorm(name), en: en || '', ne: sdNorm(en || '') };
            e.w = sdWords(e.n); e.we = e.ne ? e.ne.split(' ') : []; byCode.set(e.code, e); if (!byName.has(e.n)) byName.set(e.n, e); rows.push(e);
        }
        SD_DICT = { byCode, byName, rows, source: d.source || '' };
        try { document.dispatchEvent(new CustomEvent('sd-dict-ready')); } catch (e) {}
        return SD_DICT;
    }).catch(() => { SD_dictLoading = null; return null; });
    return SD_dictLoading;
}
// health professions by OFFICIAL classification (owner 2026-10-29): 22 health professionals, 32 health associate professionals,
// except veterinary (225 / 324), environmental & occupational health (2263 / 3257) and health-insurance / quality administration
// 2026-10-29 (follow-up): every code of the two health groups, no exception (owner)
function SD_healthCode(c) { c = String(c || ''); return /^(22|32)\d{4}$/.test(c); }
if (typeof window !== 'undefined') window.SD_healthCode = SD_healthCode;
const sdLinked = (list, e) => (e.link.startsWith('n:') ? sdByName(list, e.link.slice(2)) : sdByCode(list, e.link));
const SD_OFFICIAL_SRC = 'التصنيف المهني الرسمي (وزارة الموارد البشرية)';
// → the same result shapes as SD_resolveTitle, with `official` = { code, name, rel } describing what was recognised
function sdDictResolve(list, e, raw) {
    const official = { code: e.code, name: e.name, rel: e.rel };
    if (e.rel === 'same' || e.rel === 'close') {
        const rec = sdLinked(list, e); if (rec) return { kind: 'synonym', record: rec, official };
    }
    if (e.rel === 'name') {
        const rec = sdLinked(list, e);
        if (rec) return { kind: 'synonym', record: rec, official, needsReview: true };
    }
    // conflict / official: recognised, but the office list has no record for it → an estimate by category (labelled) or a message
    // (a record flagged no_official_code no longer claims this number: the official title is simply not in the office list)
    const site = e.rel === 'conflict' && sdByCode(list, e.code) && !sdByCode(list, e.code).no_official_code ? sdByCode(list, e.code) : null;
    const why = e.rel === 'conflict' && site
        ? `في ${SD_OFFICIAL_SRC} يحمل الرمز ${e.code} المسمى «${e.name}»، وفي قائمة المكتب يُستخدم الرمز نفسه لمهنة «${site.name_ar}». يحتاج ذلك مراجعة المكتب.`
        : `«${e.name}» مسمى موجود في ${SD_OFFICIAL_SRC} برمز ${e.code}، لكنه غير مسجل في قائمة مهن المكتب، فلا نعرف أوراقه المعتمدة.`;
    // owner 2026-10-29: an official HEALTH title (code group 22 / 32) the office has not registered → the office's health
    // document set (doctors' record 221101), labelled as an estimate; the official code drives the health group (association)
    if (e.rel === 'official' && SD_healthCode(e.code)) {
        const rep = sdByCode(list, '221101');
        if (rep) return { kind: 'estimate', official, record: { ...rep, code: '---', profession_code: '---', name_ar: e.name, profession_name_ar: e.name, name_en: e.en || '', slug: '',
            gender: /^\S+ه(?: |$)/.test(sdNorm(raw || '')) ? 'أنثى' : 'ذكر', _templateCode: e.code, _templateName: rep.name_ar, isAiGenerated: true, isEstimate: true, estimateLabel: 'المهن الصحية',
            officialCode: e.code, officialRel: e.rel,
            note: [why, `نتيجة تقديرية: عرضنا أوراق الفئة الصحية المعتمدة لدى المكتب لأن «${e.name}» مصنفة رسميًا مهنةً صحية (الرمز ${e.code}). يؤكدها المكتب قبل التقديم.`].join(' • ') } };
    }
    const est = SD_estimateProfession(list, e.name);
    if (est && est.record) {
        const r = est.record;
        return { kind: 'estimate', official, record: { ...r, name_ar: e.name, profession_name_ar: e.name, officialCode: e.code, officialRel: e.rel, note: [why, r.note].filter(Boolean).join(' • ') } };
    }
    // owner 2026-10-28: an official title the office has not registered («خباز»): related office professions to choose from
    const rel = !(est && est.message) && sdRelatedChoice(list, sdNorm(e.name), why + ' تواصل مع المكتب لتحديد أوراقه.');
    if (rel) return { ...rel, official };
    return { kind: 'message', official, message: why + (est && est.message ? ' ' + est.message : ' تواصل مع المكتب لتحديد الأوراق المطلوبة.') };
}
function sdDictLookup(list, title) {
    if (!SD_DICT) return null;
    const raw = String(title || '').trim();
    if (/^\d{6}$/.test(raw)) { const e = SD_DICT.byCode.get(raw); return e ? sdDictResolve(list, e, raw) : null; }
    const n = sdNorm(raw); const e = n && SD_DICT.byName.get(n);
    return e ? sdDictResolve(list, e, raw) : null;
}
// the official English title of an office record (owner 2026-10-27), '' when the code is not the same profession officially
function SD_officialEnglish(record) {
    if (!SD_DICT || !record || record.isEstimate) return '';
    const e = SD_DICT.byCode.get(String(record.code || ''));
    return e && (e.rel === 'same' || e.rel === 'close') && e.link === String(record.code) ? e.en : '';
}
// official titles/codes that are NOT already shown through an office record (for the search list: «مسميات رسمية»)
function SD_dictSearch(query, limit = 5) {
    if (!SD_DICT) return [];
    const raw = String(query || '').trim();
    // review 2026-10-27: 'name' = the SAME title already in the office list (another code) → shown through that record, never twice
    const hidden = (e) => e.rel === 'same' || e.rel === 'close' || e.rel === 'name';
    if (/^\d{3,6}$/.test(raw)) return SD_DICT.rows.filter((e) => !hidden(e) && e.code.startsWith(raw)).slice(0, limit);
    const qn = sdNorm(raw); if (qn.length < 3) return [];
    const qw = sdWords(qn), out = [];
    for (const e of SD_DICT.rows) {
        if (hidden(e)) continue;
        let s = 0;
        if (e.n === qn) s = 1000; else if (e.n.startsWith(qn)) s = 800; else if (qw.every((q) => e.w.some((w) => w.startsWith(q)))) s = 600;
        // English (owner 2026-10-27): the official English title
        else if (/[a-z]/.test(qn) && e.ne) { if (e.ne === qn) s = 900; else if (qw.every((q) => e.we.includes(q))) s = 580; else if (qw.every((q) => e.we.some((w) => w.startsWith(q)))) s = 550; }
        if (s) out.push([s - e.n.length / 10, e]);
    }
    return out.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}
// owner 2026-10-27: the choices of an ambiguous word as search-list items (record = open it; query = search again)
function SD_choiceHits(res) {
    if (!res || res.kind !== 'choose') return [];
    return res.options.map((o) => (o.record ? { ...o.record, __choice: o.label || o.record.name_ar } : { __query: o.query, name_ar: o.label || o.query, code: '' }));
}
// review 2026-10-27: the right words for an official code shown on an estimate — a code the office list uses for ANOTHER title
// (conflict) is not «غير مدرج»
function SD_officialLabel(rec) {
    if (!rec || !rec.officialCode) return '';
    return rec.officialRel === 'conflict' ? 'رمز رسمي يستخدمه المكتب لمسمى آخر؛ يراجعه المكتب' : 'رمز رسمي، والمسمى غير مدرج في قائمة المكتب';
}
// what the official list says about a code that IS in the office list but under another title (shown as a caution)
function SD_officialNote(record) {
    if (record && record.no_official_code && !record.isEstimate) return 'لا يوجد رمز رسمي مؤكد لهذا المسمى في التصنيف المهني الرسمي (وزارة الموارد البشرية)، فلا نعرض له رمزًا. يؤكد المكتب الرمز عند التقديم.';
    if (!SD_DICT || !record || record.isEstimate) return '';
    const byName = SD_DICT.byName.get(sdNorm(record.name_ar || ''));
    if (!/^\d{6}$/.test(String(record.code))) return byName ? `هذه المهنة بلا رمز في قائمة المكتب. في ${SD_OFFICIAL_SRC} يحمل المسمى نفسه الرمز ${byName.code}؛ يؤكده المكتب.` : '';
    const e = SD_DICT.byCode.get(String(record.code));
    if (!e) return `الرمز ${record.code} غير موجود في ${SD_OFFICIAL_SRC} الذي راجعناه${byName ? `، والمسمى نفسه فيه برمز ${byName.code}` : ''}؛ يؤكده المكتب.`;
    if (e.rel === 'conflict') return `في ${SD_OFFICIAL_SRC} يحمل الرمز ${e.code} المسمى «${e.name}». تأكد من المسمى المكتوب في تأشيرتك، ويراجعه المكتب.`;
    if (e.rel === 'close') return `المسمى الرسمي لهذا الرمز: «${e.name}».`;
    return '';
}
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
    // list pages load it at once; tool pages ([data-sd-dict]) load it when the visitor focuses the profession field (speed)
    // «مسار أوراقي» needs it at once (?code= links show the official note); the professions page and the tools load it on first use
    if (document.getElementById('m-q')) SD_loadDictionary();
    else if (document.getElementById('searchInput') && /[?&]search=/.test(location.search)) SD_loadDictionary();
    document.querySelectorAll('#searchInput, [data-sd-dict]').forEach((el) => ['focus', 'pointerdown', 'input'].forEach((ev) => el.addEventListener(ev, () => SD_loadDictionary(), { once: true })));
});

if (typeof window !== 'undefined') { window.SD_officialEnglish = SD_officialEnglish; window.SD_searchProfessions = SD_searchProfessions; window.SD_suggestProfessions = SD_suggestProfessions; window.sdNorm = sdNorm; window.SD_bestScore = SD_bestScore; window.SD_estimateProfession = SD_estimateProfession; window.SD_resolveTitle = SD_resolveTitle; window.SD_getProfessions = () => professionsData; window.SD_loadDictionary = SD_loadDictionary; window.SD_dictSearch = SD_dictSearch; window.SD_officialNote = SD_officialNote; window.SD_officialLabel = SD_officialLabel; window.SD_choiceHits = SD_choiceHits; }

// (2026-10-26: the old hand-written classifier «classifyProfession» was removed; unknown titles now use
// SD_estimateProfession above, which takes its documents from real records.)

// Filter professions based on search
function filterProfessions() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const noResults = document.getElementById('noResults');
    
    let filtered = professionsData;
    
    if (searchTerm) {
        // ranked, hamza/alef-tolerant search over the real data (Arabic name, English name, code)
        filtered = SD_searchProfessions(professionsData, searchTerm);

        // Stage 2 (owner 2026-10-26): the title is not in the list (no record with this name or starting with it) →
        // an estimate by category, built from a real record of that category, shown FIRST and labelled as an estimate.
        // Generic titles («مهندس») and senior management get a message instead of a list.
        let estMessage = '';
        const resolved = SD_resolveTitle(professionsData, searchTerm);
        if (resolved && (resolved.kind === 'estimate' || resolved.kind === 'synonym')) filtered = [resolved.record, ...filtered.filter((p) => p !== resolved.record)];
        else if (resolved && resolved.kind === 'message') estMessage = resolved.message;
        // an ambiguous word («شيف»): the listed choices are shown as results, never «لم يتم العثور»
        const choose = resolved && resolved.kind === 'choose';
        if (choose) { const recs = resolved.options.map((o) => o.record).filter(Boolean); filtered = recs; }
        sdShowDictHint(resolved, filtered[0]);
        if (filtered.length === 0 && choose) { displayProfessions([]); noResults.classList.add('hidden'); return; }
        if (filtered.length === 0) {
            displayProfessions([]);
            const noResultsText = noResults.querySelector('p');
            if (noResultsText) {
                const sug = SD_suggestProfessions(professionsData, searchTerm, 3);
                noResultsText.textContent = estMessage || 'لم نعثر على مهنة مطابقة. جرّب كتابة اسم المهنة بطريقة أخرى أو تواصل مع المكتب للتأكد من المسمى الصحيح.';
                // a known title that needs the office (code conflict, generic title) is not «not found»
                const head = noResults.querySelector('h3, h2');
                if (head) { if (!head.dataset.sdOrig) head.dataset.sdOrig = head.textContent; head.textContent = estMessage ? 'يحتاج تحديد المكتب' : head.dataset.sdOrig; }
                const old = noResults.querySelector('.sd-suggest'); if (old) old.remove();
                if (sug.length) {
                    const box = document.createElement('p'); box.className = 'sd-suggest';
                    box.append('هل تقصد: ');
                    sug.forEach((p, i) => {
                        const b = document.createElement('button'); b.type = 'button'; b.className = 'sd-suggest-btn';
                        b.textContent = p.profession_name_ar || p.name_ar;
                        b.addEventListener('click', () => { const s = document.getElementById('searchInput'); s.value = b.textContent; filterProfessions(); });
                        box.append(b); if (i < sug.length - 1) box.append(' · ');
                    });
                    noResultsText.after(box);
                }
            }
            return;
        }
    } else {
        const old = noResults && noResults.querySelector('.sd-suggest'); if (old) old.remove();
        sdShowDictHint(null);
    }

    if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(p => (p.category || 'أخرى') === selectedCategory);
    }
    
    displayProfessions(filtered);
}

// one line above the results saying what the official dictionary recognised (owner 2026-10-27)
function sdShowDictHint(resolved, first) {
    const grid = document.getElementById('professionsGrid'); if (!grid) return;
    let box = document.getElementById('sdDictHint');
    const o = resolved && resolved.official;
    let text = '';
    if (o && resolved.kind === 'synonym' && resolved.record) {
        text = resolved.needsReview
            ? `«${o.name}» برمز ${o.code} في التصنيف الرسمي، وهو في قائمة المكتب «${resolved.record.name_ar}»${/^\d{6}$/.test(String(resolved.record.code)) ? ' برمز ' + resolved.record.code : ' بلا رمز'}. اختلاف الرمز يراجعه المكتب.`
            : `«${o.name}» (${o.code}) هو المسمى الرسمي لمهنة «${resolved.record.name_ar}» في القائمة.`;
    } else if (o && resolved.kind === 'estimate') {
        text = `تعرّفنا على «${o.name}» برمز رسمي ${o.code}، لكنه غير مسجل في قائمة المكتب. الأوراق المعروضة له تقديرية حسب فئته.`;
    } else if (resolved && resolved.kind === 'choose') {
        if (!box) { box = document.createElement('div'); box.id = 'sdDictHint'; box.className = 'sd-notice info sd-dict-hint'; box.setAttribute('role', 'status'); grid.parentNode.insertBefore(box, grid); }
        box.innerHTML = ''; const q = document.createElement('p'); q.textContent = resolved.question; box.append(q);
        if (resolved.options.length > 6) return; // a long list (all engineering specialties): the result cards below are the choices
        const row = document.createElement('p'); row.className = 'sd-choose';
        resolved.options.forEach((op) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sd-btn sd-btn-outline sd-btn-sm'; b.textContent = op.label || (op.record && op.record.name_ar) || op.query; b.addEventListener('click', () => { const s = document.getElementById('searchInput'); s.value = op.record ? op.record.name_ar : op.query; filterProfessions(); }); row.append(b); });
        box.append(row); return;
    } else if (!o && resolved && (resolved.kind === 'partial' || resolved.kind === 'exact') && (resolved.record || first)) {
        text = SD_officialNote(resolved.record || first);
    }
    if (!text) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('p'); box.id = 'sdDictHint'; box.className = 'sd-notice info sd-dict-hint'; box.setAttribute('role', 'status'); grid.parentNode.insertBefore(box, grid); }
    box.textContent = text;
}
if (typeof document !== 'undefined') document.addEventListener('sd-dict-ready', () => {
    const s = document.getElementById('searchInput'); if (s && s.value.trim() && typeof filterProfessions === 'function' && professionsData.length) filterProfessions();
});

function displayProfessions(professions) {
    const grid = document.getElementById('professionsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    filteredData = professions;
    renderedCount = 0;
    
    if (professions.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        resultsCount.textContent = '0';
        removeLoadMoreButton();
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    resultsCount.textContent = professions.length;
    
    grid.innerHTML = '';
    renderBatch(professions);
}

function renderBatch(professions) {
    const grid = document.getElementById('professionsGrid');
    const end = Math.min(renderedCount + BATCH_SIZE, professions.length);
    const slice = professions.slice(renderedCount, end);
    
    const frag = document.createDocumentFragment();
    const temp = document.createElement('div');
    temp.innerHTML = slice.map((p, i) => createProfessionCard(p, renderedCount + i)).join('');
    while (temp.firstChild) frag.appendChild(temp.firstChild);
    grid.appendChild(frag);
    
    renderedCount = end;
    updateLoadMoreButton(professions);
}

// The real /p/ page of a profession (index generated by tools/build-profession-index.js); '' when there is none.
function professionPageUrl(code) {
    const map = window.SD_PROFESSION_PAGES || {};
    return /^\d{6}$/.test(String(code)) && map[code] ? `/p/${encodeURIComponent(map[code])}.html` : '';
}

// owner 2026-10-29: a record whose number is officially another job (or does not exist) keeps that number only as its page
// address; it is never shown or printed as an official code
const SD_NO_CODE = 'بدون رمز رسمي مؤكد';
const SD_NO_CODE_PRINT = 'لا يوجد رمز رسمي مؤكد لهذا المسمى (يؤكده المكتب عند التقديم)';
if (typeof window !== 'undefined') { window.SD_NO_CODE = SD_NO_CODE; window.SD_NO_CODE_PRINT = SD_NO_CODE_PRINT; }
function createProfessionCard(profession, index) {
    const name = profession.profession_name_ar || profession.name_ar || 'غير محدد';
    const code = profession.code || '---';
    const cat = profession.category || 'أخرى';
    // owner 2026-10-27: «نتيجة تقديرية» only for a real estimate built at search time — the 4 office records without a code
    // (مراقب الجودة، مشرف إنتاج، منسق زهور، بائع هاتفي) carry an old isAiGenerated flag but are office records
    const isAi = profession.isEstimate === true;

    // Redesigned pages (body.sd) get the new card; the old markup below stays as the fallback.
    if (document.body && document.body.classList.contains('sd')) {
        const hasCode = /^\d{6}$/.test(String(code));
        const page = professionPageUrl(code);
        return `
    <article class="sd-pcard${isAi ? ' is-ai' : ''} profession-card" data-prof-idx="${index}" tabindex="0" role="button" aria-expanded="false" aria-label="${escapeHtml(name)}: اعرض الأوراق المطلوبة">
      <div class="sd-pcard-top">
        ${isAi ? '<span class="sd-pcard-ai">نتيجة تقديرية: تحتاج تأكيد المكتب</span>' : profession.needs_office_review ? '<span class="sd-pcard-ai">راجع المكتب قبل البدء: انطباق الأوراق يحتاج تأكيدًا</span>' : ''}
        <h3 class="sd-pcard-name">${escapeHtml(name)}</h3>${(() => { const en = SD_officialEnglish(profession); return en ? `<p class="sd-pcard-en" lang="en" dir="ltr">${escapeHtml(en)}</p>` : ''; })()}
        <p class="sd-pcard-meta">${profession.officialCode ? `<span class="sd-num">${escapeHtml(profession.officialCode)}</span><span>${escapeHtml(SD_officialLabel(profession))}</span>` : profession.no_official_code ? `<span>${SD_NO_CODE}</span>` : `<span class="sd-num">${escapeHtml(code)}</span>`}<span>${escapeHtml(cat)}</span></p>
      </div>
      <div class="sd-pcard-actions">
        <span class="sd-pcard-toggle prof-toggle-label">عرض التفاصيل <i class="fas fa-chevron-down transition-transform"></i></span>
        ${page ? `<a class="sd-pcard-link" href="${page}">صفحة المهنة</a>` : ''}
        ${hasCode ? `<a class="sd-pcard-link" href="/saudi-visa-documents-tracker.html?code=${encodeURIComponent(code)}">مسار أوراقي</a>` : ''}
      </div>
      <div class="prof-inline-details hidden" data-details-idx="${index}"></div>
    </article>`;
    }
    return `
    <div class="bg-white rounded-2xl p-6 border ${isAi ? 'border-gold bg-gold/5 shadow-md' : 'border-gray-100'} hover:border-gold hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group profession-card"
    data-prof-idx="${index}">
    <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
    ${isAi ? '<span class="text-[10px] bg-gold text-white px-2 py-0.5 rounded-full mb-2 inline-block font-bold"><i class="fas fa-robot ml-1"></i>تحليل ذكي</span>' : ''}
    <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2">
    ${escapeHtml(name)}
    </h3>
    <div class="flex items-center gap-2 text-sm text-gray-600">
    <span class="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">${profession.no_official_code ? SD_NO_CODE : escapeHtml(code)}</span>
    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">${escapeHtml(cat)}</span>
    </div>
    </div>
    <div class="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
    <i class="fas ${isAi ? 'fa-magic-wand-sparkles' : 'fa-briefcase'} text-gold group-hover:text-white text-xl transition-colors"></i>
    </div>
    </div>
    <div class="pt-4 border-t border-gray-100">
    <div class="flex items-center justify-between text-sm">
    <span class="text-gray-600"><i class="fas fa-file-alt text-gold ml-1"></i> الأوراق المطلوبة</span>
    <span class="text-gold font-semibold flex items-center gap-2 prof-toggle-label">عرض التفاصيل <i class="fas fa-chevron-down transition-transform"></i></span>
    </div>
    </div>
    <!-- منطقة الأوراق القابلة للتوسّع تحت المهنة مباشرة -->
    <div class="prof-inline-details hidden mt-4 pt-4 border-t border-gold/20" data-details-idx="${index}"></div>
    </div>
    `;
}

// يحسب الأوراق المطلوبة لمهنة (مع الجنسية والإقامة والجنس وحارس مطعوم السحايا الختامي)
function normalizeNationality(text) {
    return normalizeArabic(text || '');
}

function selectedNationalityContext() {
    const selector = document.getElementById('nationalityFilter');
    const other = document.getElementById('otherNationality');
    const selected = selector?.value || 'الأردن';
    const label = selected === 'other' ? (other?.value || 'جنسية أخرى') : selected;
    const norm = normalizeNationality(label);
    return {
        nationality: label,
        isJordanian: norm.includes('اردن'),
        isSyrian: norm.includes('سوريا') || norm.includes('سوري'),
        residency: document.getElementById('residencyFilter')?.value || 'unknown',
        // a Jordanian who also holds a foreign passport (owner 2026-10-27): still the Jordanian route
        dualPassport: norm.includes('اردن') && Boolean(document.getElementById('dualPassport')?.checked)
    };
}

function syncNationalityControls() {
    const selector = document.getElementById('nationalityFilter');
    const wrap = document.getElementById('otherNationalityWrap');
    if (!selector || !wrap) return;
    wrap.classList.toggle('hidden', selector.value !== 'other');
    // residency matters only for a non-Jordanian; the second-passport box only for a Jordanian
    const jo = normalizeNationality(selector.value === 'other' ? (document.getElementById('otherNationality')?.value || '') : selector.value).includes('اردن');
    const rw = document.getElementById('residencyWrap'); if (rw) rw.classList.toggle('hidden', jo);
    const dw = document.getElementById('dualPassportWrap'); if (dw) dw.classList.toggle('hidden', !jo);
    // the women's questions only for a woman
    const fem = (document.getElementById('genderFilter') || {}).value === 'female';
    ['maritalWrap', 'consentSourceWrap'].forEach((id) => { const w = document.getElementById(id); if (w) w.classList.toggle('hidden', !fem); });
}

function isFemaleProfession(profession, name) {
    const normalized = normalizeArabic(name || '');
    // feminine title forms only (owner 2026-10-26: «مصفف شعر» is male, «مصففة شعر» female)
    return profession?.gender === 'أنثى' || /مصففه\s*شعر/.test(normalized);
}

/* ── Women's documents (office rule, owner 2026-10-29): for EVERY profession, when the application is for a woman the
 * military documents item is removed and these items take its place; every other document of the profession stays.
 * They depend on two answers a page may offer (#maritalFilter: married / single, #consentSourceFilter: security / court /
 * abroad). An unanswered question is never guessed: the item then says what each case needs. Stamps follow the source of
 * the no-objection document — one stamp is never presented as enough:
 *   security centre → وزارة الداخلية ثم وزارة الخارجية الأردنية
 *   court           → المحكمة المصدرة ثم دائرة قاضي القضاة ثم وزارة الخارجية الأردنية
 *   another country → the issuing body and that country's foreign ministry, then the required bodies in Jordan (the office confirms) */
const SD_CONSENT_ROUTE = {
    security: 'مختومة من وزارة الداخلية ثم وزارة الخارجية الأردنية',
    court: 'مختومة من المحكمة المصدرة ثم دائرة قاضي القضاة ثم وزارة الخارجية الأردنية',
    abroad: 'تُصدق من جهة الإصدار ووزارة خارجية بلد الإصدار ثم الجهات المطلوبة في الأردن، ويؤكد المكتب المسار',
};
const SD_CONSENT_SOURCE_TEXT = { security: 'صادرة من مركز أمني', court: 'صادرة من المحكمة', abroad: 'صادرة من خارج الأردن' };
const SD_GUARDIAN_NOTE = 'ولي الأمر رجل من الأقارب المسموح بهم (الأب أو الأخ أو العم أو الخال، حسب الحالة)، ولا تُقبل الأم وحدها وليّةً للأمر في هذا الإجراء.';
function femaleContext() {
    const v = (id) => ((typeof document !== 'undefined' && document.getElementById(id)) || {}).value || '';
    const marital = ['married', 'single'].includes(v('maritalFilter')) ? v('maritalFilter') : 'unknown';
    const source = ['security', 'court', 'abroad'].includes(v('consentSourceFilter')) ? v('consentSourceFilter') : 'unknown';
    return { marital, source };
}
function femaleRequirements(context) {
    const { marital, source } = femaleContext();
    const isJo = !context || context.isJordanian !== false;
    const who = marital === 'married' ? 'الزوج' : marital === 'single' ? 'ولي الأمر' : 'الزوج (للمتزوجة) أو ولي الأمر (للعزباء)';
    const route = source !== 'unknown'
        ? `${SD_CONSENT_SOURCE_TEXT[source]} (${SD_CONSENT_ROUTE[source]})`
        : `حسب مصدرها: إذا صدرت من مركز أمني تُختم من وزارة الداخلية ثم وزارة الخارجية الأردنية؛ وإذا صدرت من المحكمة تُختم من المحكمة المصدرة ثم دائرة قاضي القضاة ثم وزارة الخارجية الأردنية${isJo ? '' : '؛ وإذا صدرت من خارج الأردن تُصدق من جهة الإصدار ووزارة خارجية ذلك البلد ثم الجهات المطلوبة في الأردن'}. حدّدي مصدرها لتظهر أختامها`;
    const items = [`عدم ممانعة من ${who}، ${route}.${marital !== 'married' ? ' ' + SD_GUARDIAN_NOTE : ''}`];
    const marriage = isJo ? 'عقد الزواج أو شهادة الزواج (يُقبل أحدهما)، مختوم من وزارة الخارجية الأردنية.'
        : 'عقد الزواج أو شهادة الزواج (يُقبل أحدهما)، مصدق حسب الأصول من جهة الإصدار ثم وزارة الخارجية الأردنية (آخر ختم).';
    if (marital === 'married') items.push(marriage, 'صورة عن جواز سفر الزوج.');
    // owner 2026-10-29: the individual civil record is stamped by the Jordanian Ministry of Foreign Affairs
    const record = isJo ? 'قيد فردي (مختوم من وزارة الخارجية الأردنية).'
        : 'قيد فردي أو بيان فردي من بلد الإصدار، مصدق حسب الأصول من جهة الإصدار ثم وزارة الخارجية الأردنية (آخر ختم).';
    if (marital === 'single') items.push(record, 'صورة عن جواز سفر ولي الأمر.');
    else if (marital !== 'married') items.push(`أوراق الحالة الاجتماعية: للمتزوجة ${marriage.replace(/\.$/, '')}، وصورة عن جواز سفر الزوج؛ وللعزباء قيد فردي مختوم من وزارة الخارجية الأردنية وصورة عن جواز سفر ولي الأمر. حدّدي الحالة الاجتماعية لتظهر أوراقك بدقة.`);
    return items;
}
// kept for older callers: the women's documents as one line
function femaleRequirement() { return femaleRequirements({ isJordanian: true }).join(' '); }
// Age (owner 2026-10-29): the four senior categories — CEO 112001, chairman 112002, general manager 112004, investor 112009 —
// over 21 with no upper limit, every nationality; every other profession keeps 21 to under 60 (engineers: rule 3 below).
const SD_SENIOR_AGE_CODES = ['112001', '112002', '112004', '112009'];
const SD_AGE_DEFAULT = 'يشترط ألا يقل عمر المتعاقد عن 21 عاماً وألا يزيد على 60 عاماً.';
const SD_AGE_SENIOR = 'يشترط أن يكون عمر المتعاقد أكثر من 21 عامًا، دون حد أعلى للعمر.';
function sdAgeText(profession) { return SD_SENIOR_AGE_CODES.includes(String((profession && (profession._templateCode || profession.code)) || '')) ? SD_AGE_SENIOR : SD_AGE_DEFAULT; }
// replaces the military documents item (or adds after the first item) with the women's documents
function sdApplyFemale(requirements, context) {
    const f = femaleRequirements(context);
    const milIdx = requirements.findIndex((r) => /الوثائق العسكرية|مشروحات الجيش|مشروحات من القيادة/.test(r));
    if (milIdx !== -1) requirements.splice(milIdx, 1, ...f);
    else requirements.splice(Math.min(1, requirements.length), 0, ...f);
    return requirements;
}

function isEngineeringProfessionName(name) {
    return /مهندس|هندسه|هندسي/.test(normalizeArabic(name));
}

function isMedicalProfessionName(name) {
    return /طبيب|دكتور|طبيبه|صيدلي|صيدله|ممرض|ممرضه|تمريض|مختبر طبي/.test(normalizeArabic(name));
}

function isUniversityDocument(text) {
    // 2026-10-29: the master's and doctorate lines of university teaching titles are university documents too
    return /الشهادة الجامعية|شهادة جامعية|المؤهل الجامعي|المؤهل العلمي|شهادة الماجستير|شهادة الدكتوراه/.test(text);
}

function adjustEducationCopyRule(text, name, isJordanian) {
    if (!isUniversityDocument(text)) return text;
    const specialist = isEngineeringProfessionName(name) || isMedicalProfessionName(name);
    if (specialist) {
        let result = text.replace(/إحضار\s+الشهادة الجامعية(?:\s*\(الأصل\))?/, 'إحضار أصل الشهادة الجامعية مع صور عنها');
        result = result.replace(/وكشف العلامات\s+الأصل/, 'وكشف العلامات: الأصل مع صور عنها');
        if (!/أصل الشهادة الجامعية مع صور عنها/.test(result)) result = `${result} (أصل الشهادة الجامعية مع صور عنها)`;
        return result;
    }
    let result = text.replace(/\(\s*الأصل\s*\)/g, '(صورة)').replace(/\bالأصل\b/g, 'صورة');
    if (/^إحضار\s+الشهادة الجامعية/.test(result) && !/صورة عن/.test(result)) result = result.replace(/^إحضار\s+الشهادة الجامعية/, 'إحضار صورة عن الشهادة الجامعية');
    return result;
}

function adjustExperienceRule(text, context) {
    if (!/خبرة|خبره/.test(text)) return text;
    const duration = text.split('(')[0].replace(/[،.\s]+$/, '').trim();
    if (context.isJordanian) return text;
    const guidance = context.isSyrian
        ? 'الخبرة حسب بلد الإصدار: إذا كانت صادرة من سوريا تُختم حسب الأصول من الجهة المصدرة والخارجية السورية، ثم سفارة الأردن في سوريا والخارجية الأردنية في عمّان؛ وإذا كانت صادرة من الأردن تُختم حسب الأصول من الجهات الأردنية المطلوبة؛ وإذا كانت صادرة من السعودية تُقبل صورة عنها بعد أختامها المطلوبة.'
        : 'الخبرة حسب بلد الإصدار: إذا كانت صادرة من السعودية تُقبل صورة عنها بعد أختامها المطلوبة؛ وإذا كانت صادرة من الأردن تُختم حسب الأصول من الجهات الأردنية؛ وإذا كانت صادرة من بلد آخر تُصدق من جهة الإصدار وخارجيتها والجهات المطلوبة في الأردن.';
    return `${duration}، ${guidance}`.replace(/\.{2,}$/g, '.');
}

function normalizeEmploymentDocuments(requirements) {
    const contractIdx = requirements.findIndex(r => /عقد\s*العمل|عقد عمل/.test(r));
    if (contractIdx === -1) return requirements;
    requirements[contractIdx] = 'عقد العمل السعودي: تُقبل صورة عنه، ويكون مختوماً من الغرفة التجارية السعودية ووزارة الخارجية السعودية.';
    const letterIdx = requirements.findIndex(r => /خطاب\s*الاطلاع/.test(r));
    const letter = 'خطاب الاطلاع من الشركة السعودية: تُقبل صورة عنه، ويكون مختوماً من الغرفة التجارية السعودية ووزارة الخارجية السعودية.';
    if (letterIdx === -1) requirements.splice(contractIdx + 1, 0, letter);
    else requirements[letterIdx] = letter;
    return requirements;
}

function nationalityAdditions(profession, name, context) {
    const additions = [];
    const female = isFemaleProfession(profession, name);
    const isEngineer = isEngineeringProfessionName(name);
    const isDoctor = isMedicalProfessionName(name);

    if (!context.isJordanian) {
        if (context.isSyrian) additions.push('قيد عائلي أو بيان فردي سوري مصدق حسب الأصول من الجهات المختصة.');
        if (isEngineer && context.isSyrian) additions.push('عضوية وتسجيل مهني من النقابة أو الجهة الهندسية السورية في بلد الإصدار.');
        // (2026-10-29: the Syrian doctors' documents are added by applyApprovedRules from the record's OFFICIAL health group,
        //  no longer from a word in the title — «مدير صيدلة» is a manager, not a doctor)
        void isDoctor;
        // the residency card: a resident; for a non-Syrian foreign national also when the residency was not chosen (the route requires it)
        if (context.residency === 'resident' || (!context.isSyrian && context.residency !== 'no' && context.residency !== 'not-resident')) additions.push(`بطاقة إقامة أردنية سارية المفعول للجنسية ${context.nationality}.`);
    }
    return additions;
}

/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * Owner-approved rules (2026-10-25) — docs/owner-briefs/2026-10-25-requirement-rules.md
 * Applied LAST, on the computed list, by computeJordanRequirements and computeRequirements, so the professions list,
 * the profession window, «مسار أوراقي», the eligibility tool and the print sheet all show the same result.
 * The 2026-10-26 rules (letter, experience, practice certificate, QVP / SVP, «مرشد موقع») are written INTO
 * professions.json by tools/apply-profession-rules.js; the rules below are applied on top. Groups come from each profession's own data:
 *   engineering = its documents include «التسجيل في هيئة المهندسين السعودية»; doctors = the 3 medical-doctor records;
 *   university = its documents include a university degree (otherwise school level / none).
 * ───────────────────────────────────────────────────────────────────────────────────────────────────────────── */
const SD_DOCTOR_CODES = ['221101', '221201', '225001'];
function professionProfile(profession) {
    const base = (profession._baseRequirements || profession.requirements || []).join(' | ');
    const code = String(profession._templateCode || profession.code || ''); // an estimate keeps its template's groups
    // owner 2026-10-29: the health group comes from the OFFICIAL code (2211/2212 doctors, 2261 dentists, 2262 pharmacists,
    // 2221/2222/3221/3222 nursing and midwifery, 225 veterinary), never from a word such as «أخصائي»
    const health = /الهيئة السعودية للتخصصات الصحية/.test(base);
    const hg = !health ? '' : /^(2211|2212)/.test(code) ? 'doctor' : /^225/.test(code) ? 'vet' : /^2261/.test(code) ? 'dentist' : /^2262/.test(code) ? 'pharmacist'
        : /^(2221|2222|3221|3222)/.test(code) ? 'nurse' : 'other';
    return {
        university: /الشهادة الجامعية|شهادة جامعية/.test(base),
        engineering: /هيئة المهندسين السعودية/.test(base),
        health, healthGroup: hg,
        doctor: SD_DOCTOR_CODES.includes(code) || hg === 'doctor' || hg === 'dentist' || hg === 'vet', // calculator «الأطباء»
        vet: code === '225001',
        // a specialist: the Board / specialty certificate is shown «if your case needs it» — never for every doctor
        specialistDoctor: code === '221201' || (/^2212/.test(code)) || ['226102', '226103', '226104', '226106', '226108', '226109'].includes(code),
        // a worker title: «عامل / عاملة / عمال» as its own word (not «قوى عاملة» = workforce, not «أعمال» = business)
        worker: /^(?:ال)?(?:عامل|عاملة|عمال)(?:\s|$)/.test(String(profession.profession_name_ar || profession.name_ar || '').trim()),
    };
}
// Country that issued the university degree (and, for association membership, where the applicant is registered).
// A page may offer #degreeCountryFilter (an Arabic country name); otherwise it follows the nationality.
function degreeIssuingCountry(context) {
    const el = document.getElementById('degreeCountryFilter');
    const v = el && el.value && el.value.trim();
    if (v === 'other') return '';           // «بلد آخر»: the general route without a country name
    if (v && v !== 'auto') return v;
    if (context.isJordanian) return 'الأردن';
    if (context.isSyrian) return 'سوريا';
    const n = String(context.nationality || '').trim();
    return n && n !== 'جنسية أخرى' ? n : '';
}
// University-degree attestation route, ending with the Jordanian Foreign Ministry (owner 2026-10-25).
// Jordan: Higher Education stamp then Foreign Ministry (owner decision). Syria and Saudi Arabia: the routes written in the
// project's attestation guide (saudi-document-attestation-jordan.js). Any other country: the guide's general route,
// naming that country. Every non-Jordanian step is shown as «عند انطباقها» (to be confirmed by the office).
function degreeRoute(country) {
    const c = country || '';
    if (c === 'الأردن') return 'مختومة من وزارة التعليم العالي ثم وزارة الخارجية الأردنية';
    if (c === 'سوريا') return 'تُصدق من الجهة السورية المصدرة ثم وزارة الخارجية السورية ثم السفارة الأردنية في سوريا عند انطباقها ثم وزارة الخارجية الأردنية في عمّان';
    if (c === 'السعودية') return 'تُصدق من الجهة السعودية المصدرة ثم وزارة الخارجية السعودية ثم السفارة السعودية في عمّان عند انطباق المسار ثم وزارة الخارجية الأردنية';
    const where = c ? `في ${c}` : 'في بلد الإصدار';
    return `تُصدق من الجهة المصدرة ${where} ثم وزارة الخارجية ${where} ثم السفارة أو البعثة المعنية في عمّان عند انطباقها ثم وزارة الخارجية الأردنية`;
}
const inCountry = (c) => (c ? `في ${c}` : 'في بلد إصدار الشهادة');
function applyApprovedRules(profession, requirements, context) {
    const pr = professionProfile(profession);
    const isJo = !!context.isJordanian;
    let list = [...requirements];

    // 1) University degree: Higher Education stamp (Jordan) / route by the country that issued the degree.
    const country = degreeIssuingCountry(context);
    const route = degreeRoute(country);
    list = list.map((t) => {
        if (!isUniversityDocument(t)) return t;
        let r = t.replace(/\s*\(مختومة من وزارة الخارجية الأردنية\)\.?\s*$/, '')
            .replace(/\s*وتُصدق حسب الأصول من بلد الإصدار والجهات المطلوبة عند تقديمها في عمّان\.?\s*$/, '');
        if (!isJo && pr.engineering && !/أصل الشهادة الجامعية مع صور عنها/.test(r)) {
            // the project's existing «original with copies» rule for engineering degrees, now for the whole engineering group
            r = r.replace(/إحضار صورة عن الشهادة الجامعية(?:\s*\(صورة\))?/, 'إحضار أصل الشهادة الجامعية مع صور عنها').replace(/وكشف العلامات\s+(?:الأصل|صورة)/, 'وكشف العلامات: الأصل مع صور عنها');
        }
        if ((pr.doctor || pr.health) && !/آخر مؤهل جامعي/.test(r)) r = r.replace(/الشهادة الجامعية/, 'الشهادة الجامعية (آخر مؤهل جامعي مناسب للمهنة: بكالوريوس أو ماجستير أو دكتوراه)');
        return `${r} (${route}).`;
    });

    // 2) No «خطاب الاطلاع» for professions whose data does not ask for a university degree, nor for a worker title
    //    («عامل / عاملة / عمال», owner 2026-10-26).
    if (!pr.university || pr.worker) {
        list = list
            .filter((t) => !/^خطاب الاطلاع من الشركة السعودية/.test(t))
            .map((t) => (/عقد عمل من الشركة السعودية\s*\+\s*خطاب إطلاع/.test(t) ? 'عقد عمل مصدق من الغرفة التجارية والخارجية السعودية.' : t));
    }

    // 3) Engineering group — office rules 2026-10-26 (the same for every nationality unless stated):
    //    · degree: original + two certified copies, the transcript optional (route of the issuing country, step 1)
    //    · Saudi platforms, separate items: Musadaqa certificate · QVP · Saudi Council of Engineers registration
    //    · association by the engineer's NATIONALITY (Jordanian / Syrian / Yemeni / other country's competent body)
    //    · experience: at least two years, title identical to the one on the Saudi visa document
    //    · medical exam in Amman + fingerprints (the office books both) · e-authorization by the office, certified by
    //      the Saudi Chamber of Commerce · age at least 21, no upper limit
    if (pr.engineering) {
        const nat = isJo ? 'الأردن' : (context.isSyrian ? 'سوريا' : String(context.nationality || '').trim());
        const ENG_ASSOC = nat === 'الأردن' ? 'عضوية + مزاولة مهنة من نقابة المهندسين الأردنية (حسب المطلوب).'
            : nat === 'سوريا' ? 'عضوية وتسجيل مهني من النقابة أو الجهة الهندسية المختصة في سوريا، حسب المتطلبات المعتمدة.'
            : `عضوية وتسجيل مهني من نقابة المهندسين أو الجهة الهندسية المختصة ${nat && nat !== 'جنسية أخرى' ? 'في ' + nat : 'في بلد المهندس'}، حسب المتطلبات المعتمدة.`;
        list = list.filter((t) => !/^عضوية وتسجيل مهني من (?:النقابة أو الجهة الهندسية|نقابة المهندسين أو الجهة الهندسية)/.test(t));
        list = list.map((t) => {
            if (isUniversityDocument(t)) {
                const route = (t.match(/\(([^()]*(?:وزارة|تُصدق)[^()]*)\)\.?\s*$/) || [])[1] || degreeRoute(country);
                return `أصل الشهادة الجامعية وصورتان طبق الأصل عنها؛ كشف العلامات اختياري إذا أردت تصديقه (${route}).`;
            }
            if (/^عضوية \+ مزاولة مهنة من نقابة المهندسين الأردنية/.test(t)) return ENG_ASSOC;
            if (/^الحصول على شهادة من موقع مصادقة السعودي/.test(t)) return 'إشعار بنتيجة طلب توثيق الشهادة (المصادقة) من منصة «مصادقة» السعودية (mosadaqa.sa).'; // the official document title (owner's sample notice, 2026-10-27; platform name checked on mosadaqa.sa)
            if (/^التسجيل في هيئة المهندسين السعودية/.test(t)) return 'استيفاء متطلبات التسجيل والعضوية لدى الهيئة السعودية للمهندسين، حسب المسمى والتخصص.';
            if (/^خبرة لمدة سنتين بنفس مسمى التأشيرة/.test(t)) return t.replace(/^خبرة لمدة سنتين بنفس مسمى التأشيرة/, 'خبرة لا تقل عن سنتين، بمسمى مطابق للمسمى المهني في مستند التأشيرة السعودي (لا تُعد الخبرة بمسمى قريب أو مشابه مطابقة تلقائيًا)');
            if (/^عمل الفحص الطبي والبصمة لدى المراكز المعتمدة للسفارة السعودية/.test(t)) return t.replace(/^عمل الفحص الطبي والبصمة لدى المراكز المعتمدة للسفارة السعودية/, 'الفحص الطبي في مركز معتمد في عمّان والبصمة حسب الإجراءات المطلوبة؛ يحجز مكتبنا الموعدين');
            if (/^عمل تفويض إلكتروني للمكتب/.test(t)) return 'التفويض الإلكتروني: ينفذه المكتب، ويُصادق عليه من الغرفة التجارية السعودية حسب الإجراء المعتمد.';
            if (/عمر المتعاقد/.test(t)) return 'يشترط ألا يقل عمر المتعاقد عن 21 عاماً.';
            return t;
        });
        if (!list.includes(ENG_ASSOC)) list.splice(Math.max(0, list.findIndex((t) => /الهيئة السعودية للمهندسين/.test(t))), 0, ENG_ASSOC);
    }

    // 4) Health professions (owner 2026-10-25 for doctors; 2026-10-29 for the whole health group by official code):
    //    professional-association membership from the country of the degree / registration — the association of THAT
    //    profession (doctors, dentists, pharmacists, nurses…); Board / specialty certificate only for specialists and only
    //    «if your case needs it». Syria keeps the project's own wording for doctors (licence + association + Syrian Board).
    if (pr.health || pr.doctor) {
        const g = pr.healthGroup || (pr.vet ? 'vet' : 'doctor');
        const assoc = { doctor: 'نقابة الأطباء', vet: 'نقابة الأطباء البيطريين', dentist: 'نقابة أطباء الأسنان', pharmacist: 'نقابة الصيادلة', nurse: 'نقابة الممرضين والممرضات والقابلات' }[g] || '';
        // (2026-10-29: the licence is its own item for every nationality — see below; the Syrian wording keeps the
        //  association document and the Syrian Board)
        const SYRIA = 'وثيقة من نقابة الأطباء في سوريا، وSyrian Board.';
        list = list.filter((t) => t !== SYRIA && t !== 'شهادة الترخيص من سوريا، ووثيقة من نقابة الأطباء في سوريا، وSyrian Board.');
        const extra = [];
        if (!assoc) extra.push(`عضوية النقابة أو الجهة المهنية المختصة بالمهنة ${inCountry(country)}، حسب المطلوب: الأصل مع صور عنها، مصدقة حسب الأصول.`);
        else if (country === 'الأردن') extra.push(`عضوية ${assoc} الأردنية: الأصل مع صور عنها، مختومة حسب الأصول.`);
        else if (country === 'سوريا' && g === 'doctor') extra.push(SYRIA);
        else extra.push(`عضوية ${assoc} أو الجهة المهنية المختصة ${inCountry(country)}: الأصل مع صور عنها، مصدقة حسب الأصول.`);
        // owner 2026-10-29: doctors and dentists — the practice licence from the DOCTOR'S OWN COUNTRY (nationality), for every
        // nationality. Jordan: Ministry of Health. Syria: already in the Syrian wording («شهادة الترخيص من سوريا»). Any other
        // nationality: the competent licensing body of that country — not named here (not verified), the office confirms it.
        if (g === 'doctor' || g === 'dentist') {
            const prof = g === 'dentist' ? 'طب الأسنان' : 'الطب';
            const nat = isJo ? 'الأردن' : (context.isSyrian ? 'سوريا' : String(context.nationality || '').trim());
            // owner 2026-10-29 (final round): Jordan → Ministry of Health; every other nationality → «the competent
            // authorities in <country>» (no ministry / association names invented). Follows the nationality chosen now.
            const where = nat && nat !== 'جنسية أخرى' ? nat : 'بلد الطبيب';
            if (nat === 'الأردن') extra.push(`رخصة مزاولة مهنة ${prof} من وزارة الصحة الأردنية: الأصل مع صورة عنها، مختومة حسب الأصول.`);
            else extra.push(`رخصة مزاولة مهنة ${prof} من الجهات المختصة في ${where}: الأصل مع صورة عنها، مصدقة حسب الأصول.`);
        }
        if (pr.specialistDoctor && country !== 'سوريا') extra.push('البورد أو المؤهل التخصصي في التخصص المطلوب، إذا كانت حالتك تتطلبه (يؤكده المكتب).');
        const at = list.findIndex((t) => isUniversityDocument(t));
        list.splice(at >= 0 ? at + 1 : 1, 0, ...extra.filter((x) => !list.includes(x)));
    }

    // 5) Professional verification (owner 2026-10-26): «التحقق المهني (QVP)» for university-degree professions,
    //    «الفحص المهني (SVP)» for school level or less. Old wording (smart-search templates, older texts) is renamed
    //    here so no tool shows «الاعتماد المهني» for either procedure. Exceptions keep what their data says.
    const pcode = String(profession._templateCode || profession.code || '');
    const verificationException = SD_HOUSEHOLD_CODES.includes(pcode) || SD_SENIOR_CODES.includes(pcode) || ['524401', '932102', '912902'].includes(pcode) /* official codes since 2026-10-28 (they used 932103 / 932104) */ || (profession._templateName || profession.name_ar) === 'بائع هاتفي';
    if (!verificationException) {
        list = list.map((t) => (/^(?:الحصول على شهادة الاعتماد المهني|التقديم على الاعتماد المهني السعودي)\.?$/.test(t.trim())
            ? (pr.university ? SD_QVP_TEXT : SD_SVP_TEXT) : t));
    }

    // 6) Practice certificate (owner 2026-10-26): Jordanian stamp only when it is issued in Jordan; otherwise the route
    //    of the issuing country, as for the experience certificate.
    if (!isJo) {
        list = list.map((t) => (/^أصل شهادة مزاولة المهنة وصورة عنها/.test(t)
            ? `أصل شهادة مزاولة المهنة وصورة عنها، مصدقة حسب بلد الإصدار: إذا كانت صادرة من الأردن تُختم من ${/الأشغال/.test(t) ? 'وزارة الأشغال العامة والإسكان، ثم ' : ''}وزارة الخارجية الأردنية؛ وإذا كانت صادرة من بلد آخر تُصدق من جهة الإصدار وخارجية ذلك البلد ثم الجهات المطلوبة في الأردن (يؤكد المكتب المسار).`
            : t));
    }
    return list;
}
const SD_QVP_TEXT = 'الحصول على شهادة التحقق المهني (QVP).';
const SD_SVP_TEXT = 'التقديم على الفحص المهني (SVP) واجتيازه، ويشمل الامتحان النظري عند انطباقه.';
// Fee-calculator category of a profession (calculator.html «تصنيف المهنة»), from the profession's own documents.
function SD_calcCategory(profession) {
    const pr = professionProfile(profession);
    const code = String(profession._templateCode || profession.code || '');
    if (SD_HOUSEHOLD_CODES.includes(code)) return 'domestic';
    if (code === '112004') return 'gm'; // مدير عام (owner 2026-10-27: 450)
    if (SD_SENIOR_CODES.includes(code)) return 'senior';
    if (pr.doctor) return 'doctor';
    if (pr.engineering) return 'engineer';
    if (pr.university) return 'professional';
    if (pr.worker) return 'worker';
    return 'secondary';
}
if (typeof window !== 'undefined') window.SD_calcCategory = SD_calcCategory;
// «QVP» / «SVP» / none for a computed list (used by the eligibility tool, «مسار أوراقي» labels and the FAQ generator).
function professionVerificationType(requirements) {
    const t = (requirements || []).join(' | ');
    if (/\(QVP\)|التحقق المهني/.test(t)) return 'QVP';
    if (/\(SVP\)|الفحص المهني/.test(t)) return 'SVP';
    return '';
}
if (typeof window !== 'undefined') window.professionVerificationType = professionVerificationType;

function computeJordanRequirements(profession) {
    const name = profession.profession_name_ar || profession.name_ar || '';
    const code = profession.code || '';
    let requirements = [...(profession._baseRequirements || profession.requirements || [])];
    const selectedGender = (document.getElementById('genderFilter') || {}).value;

    // a female applicant (gender choice) or a female title / record: the military documents give way to the women's
    // documents. Owner 2026-10-29: for EVERY profession — the former exception for titles with «مدير / رئيس / تنفيذي /
    // مهندس / طبيب» (which kept the military documents for women) is removed.
    if (selectedGender === 'female' || isFemaleProfession(profession, name)) sdApplyFemale(requirements, { isJordanian: true });

    const appendCompletion = (text, suffix) => {
        if (text.includes('وزارة الخارجية الأردنية')) return text;
        const clean = text.replace(/\.?$/, '');
        return `${clean} (${suffix}).`;
    };
    requirements = requirements.map(text => {
        if (/حسن سيرة وسلوك|حسن السيرة والسلوك|السيرة الذاتية/.test(text)) return appendCompletion(text, 'مختوم من وزارة الخارجية الأردنية');
        if (/مشروحات الجيش|مشروحات من القيادة|الوثائق العسكرية/.test(text)) return appendCompletion(text, 'مختومة من وزارة الخارجية الأردنية');
        if (/الشهادة الجامعية|شهادة جامعية|الشهادة المدرسية|شهادة مدرسية|شهادة الثانوية|شهادة الصف العاشر/.test(text)) return appendCompletion(text, 'مختومة من وزارة الخارجية الأردنية');
        if (/\bخبرة\b|خبرة لمدة|خبره/.test(text)) return appendCompletion(text, 'مختومة من مكتب العمل ووزارة الخارجية الأردنية');
        if (/المشروعات|المشاريع|مشروعات|مشاريع/.test(text)) return appendCompletion(text, 'مختومة من وزارة الخارجية الأردنية');
        return text;
    });

    let note = profession.note || '';
    const noteItems = requirements.filter(r => /^\s*ملاحظة/.test(r));
    if (noteItems.length) {
        requirements = requirements.filter(r => !/^\s*ملاحظة/.test(r));
        const cleaned = noteItems.map(n => n.replace(/^\s*ملاحظة(\s+هامة\s+جداً)?\s*[:：]?\s*/, '').trim());
        note = [note].concat(cleaned).filter(Boolean).join(' • ');
    }

    const VACCINE_ITEM = 'الحصول على شهادة مطعوم السحايا.';
    const isFamilyRecruitment = name.includes('استقدام') || name.includes('اقامة') || name.includes('إقامة') || code === 'FAMILY';
    requirements = requirements.filter(r => r.replace(/\s+/g, ' ').trim() !== VACCINE_ITEM);
    if (!isFamilyRecruitment) requirements.push(VACCINE_ITEM);
    requirements = requirements.filter(r => !r.includes('عمر المتعاقد'));
    if (requirements.length === 0) requirements.push(sdAgeText(profession));
    else requirements.splice(requirements.length - 1, 0, sdAgeText(profession));

    return { name, code, requirements, note };
}

function computeRequirements(profession) {
    const name = profession.profession_name_ar || profession.name_ar || '';
    const code = profession.code || '';
    const baseRequirements = profession._baseRequirements || profession.requirements || [];
    let requirements = [...baseRequirements];

    const selectedGender = (document.getElementById('genderFilter') || {}).value;
    const context = selectedNationalityContext();
    const nonResident = context.residency === 'no' || context.residency === 'not-resident';
    const female = isFemaleProfession(profession, name) || selectedGender === 'female';

    // الأردن يبقى على قاعدة النسخة المحفوظة قبل قواعد الجنسية؛ الإضافات الجديدة لغير الأردني فقط.
    if (context.isJordanian) {
        const jordan = computeJordanRequirements(profession);
        return sdDualPassport(sdProfessorNote(profession, { ...jordan, requirements: applyApprovedRules(profession, jordan.requirements, context), nationality: context.nationality, isJordanian: true }), context);
    }

    if (female) sdApplyFemale(requirements, context);
    else if (!context.isJordanian) {
        const milIdx = requirements.findIndex(r => /الوثائق العسكرية|مشروحات الجيش|مشروحات من القيادة/.test(r));
        if (milIdx !== -1) requirements.splice(milIdx, 1);
    }

    const conductIdx = requirements.findIndex(r => /حسن سيرة وسلوك|حسن السيرة والسلوك|السيرة الذاتية/.test(r));
    if (!context.isJordanian && conductIdx !== -1) {
        // owner 2026-10-27: a Syrian sees «لا حكم عليه» unless he is a resident of Jordan (then the Jordanian good-conduct
        // certificate); any other foreign national follows the resident's route (this route requires a valid Jordanian residency)
        const JO_CONDUCT = 'حسن سيرة وسلوك من المخابرات العامة الأردنية، بالحضور الشخصي أمام الجهة المختصة، وليس من خلال تطبيق سند.';
        requirements[conductIdx] = context.isSyrian
            ? (context.residency === 'resident' ? JO_CONDUCT : 'لا حكم عليه من سوريا، مختوم من الخارجية السورية ثم السفارة الأردنية في سوريا ثم وزارة الخارجية الأردنية في عمّان.')
            : JO_CONDUCT;
    }

    const appendCompletion = (text, suffix) => {
        if (text.includes('وزارة الخارجية الأردنية')) return text;
        const clean = text.replace(/\.?$/, '');
        return `${clean} (${suffix}).`;
    };
    requirements = requirements.map(text => {
        if (/حسن سيرة وسلوك|حسن السيرة والسلوك|السيرة الذاتية/.test(text)) {
            return context.isJordanian ? appendCompletion(text, 'مختوم من وزارة الخارجية الأردنية') : text;
        }
        if (/مشروحات الجيش|مشروحات من القيادة|الوثائق العسكرية/.test(text)) {
            return context.isJordanian ? appendCompletion(text, 'مختومة من وزارة الخارجية الأردنية') : text;
        }
        if (isUniversityDocument(text) || /الشهادة المدرسية|شهادة مدرسية|شهادة الثانوية|شهادة الصف العاشر/.test(text)) {
            let result = adjustEducationCopyRule(text, name, context.isJordanian);
            if (!context.isJordanian) result = result.replace(/\s*\(مختومة من وزارة الخارجية الأردنية\)\.?/g, '') + ' وتُصدق حسب الأصول من بلد الإصدار والجهات المطلوبة عند تقديمها في عمّان.';
            else result = appendCompletion(result, 'مختومة من وزارة الخارجية الأردنية');
            return result;
        }
        if (/خبرة|خبره/.test(text)) return adjustExperienceRule(context.isJordanian ? appendCompletion(text, 'مختومة من مكتب العمل ووزارة الخارجية الأردنية') : text, context);
        if (/المشروعات|المشاريع|مشروعات|مشاريع/.test(text)) return context.isJordanian ? appendCompletion(text, 'مختومة من وزارة الخارجية الأردنية') : text;
        return text;
    });

    if (!context.isJordanian) requirements = normalizeEmploymentDocuments(requirements);
    const contextAdditions = nationalityAdditions(profession, name, context);
    requirements = requirements.filter(text => !contextAdditions.includes(text));

    let note = profession.note || '';
    const noteItems = requirements.filter(r => /^\s*ملاحظة/.test(r));
    if (noteItems.length) {
        requirements = requirements.filter(r => !/^\s*ملاحظة/.test(r));
        const cleaned = noteItems.map(n => n.replace(/^\s*ملاحظة(\s+هامة\s+جداً)?\s*[:：]?\s*/, '').trim());
        note = [note].concat(cleaned).filter(Boolean).join(' • ');
    }

    if (!context.isJordanian && nonResident && !context.isSyrian) {
        note = [note, `لا يمكن استكمال التقديم من الأردن دون إقامة أردنية سارية للجنسية ${context.nationality}. راجع المكتب لتحديد المسار المناسب قبل تجهيز الأوراق.`].filter(Boolean).join(' • ');
    } else if (!context.isJordanian && !context.isSyrian && context.residency !== 'resident') {
        note = [note, 'هذه الأوراق لغير الأردني المقيم في الأردن بإقامة سارية، وتُستكمل المعاملة لدى السفارة السعودية في عمّان. إذا لم تكن مقيمًا في الأردن، راجع المكتب لتحديد المسار المناسب.'].filter(Boolean).join(' • ');
    } else if (context.isSyrian && context.residency !== 'resident' && !nonResident) {
        note = [note, 'إذا كنت مقيمًا في الأردن، يُطلب منك «حسن سيرة وسلوك» من الجهة الأردنية المختصة بدلًا من «لا حكم عليه» الخاص بغير المقيمين. اختر حالة الإقامة لتظهر أوراقك بدقة.'].filter(Boolean).join(' • ');
    } else if (context.isSyrian && nonResident) {
        note = [note, 'معاملة السوري غير المقيم مشروطة حاليًا؛ يجب تأكيدها مع المكتب والجهة المختصة قبل التقديم.'].filter(Boolean).join(' • ');
    }
    // owner 2026-10-28: on the foreign-national route (not Jordanian, not Syrian) the visa's place of arrival must be Amman
    if (!context.isJordanian && !context.isSyrian && !nonResident) note = [note, SD_AMMAN_NOTE].filter(Boolean).join(' • ');

    const VACCINE_ITEM = "الحصول على شهادة مطعوم السحايا.";
    const isFamilyRecruitment = name.includes("استقدام") || name.includes("اقامة") || name.includes("إقامة") || code === "FAMILY";
    requirements = requirements.filter(r => r.replace(/\s+/g, ' ').trim() !== VACCINE_ITEM);

    requirements = requirements.filter(r => !r.includes('عمر المتعاقد'));
    if (requirements.length === 0) requirements.push(sdAgeText(profession));
    else requirements.splice(requirements.length - 1, 0, sdAgeText(profession));

    // nationality additions BEFORE the closing vaccine item, so the screen order is the print order (print always
    // ends with the vaccine — script.js)
    if (contextAdditions.length) requirements.push(...contextAdditions);
    if (!isFamilyRecruitment) requirements.push(VACCINE_ITEM);

    return sdProfessorNote(profession, { name, code, requirements: applyApprovedRules(profession, requirements, context), note, nationality: context.nationality, isJordanian: context.isJordanian });
}

// owner 2026-10-27: «أستاذ تعليم عالي» is its own case. The university or the beneficiary MAY ask for the Musadaqa of each
// degree (bachelor, master, doctorate) — a NOTE, never a required document for everyone. Musadaqa (the degree) is a
// different procedure from QVP (the profession), which stays in the list as the profession's data says. Every nationality.
// owner 2026-10-29: bring only the degrees you hold; Musadaqa + the Saudi embassy attestation when the university asks
// owner 2026-10-29 (appendix): held ≠ required ≠ needs extra attestation. Master and doctorate are not assumed for everyone;
// a degree the university or the transaction asks for must be held and stamped; Musadaqa + embassy only if the university asks
const SD_PROFESSOR_MUSADAQA = 'تُقدَّم المؤهلات الجامعية ضمن الملف: البكالوريوس، ومعه الماجستير والدكتوراه إن كنت تحملهما؛ فلا يُفترض أن يحمل كل متقدم الماجستير أو الدكتوراه. جهّز الشهادات الجامعية ذات الصلة بأختامها كما في القائمة. إذا كانت الجامعة أو المعاملة تطلب مؤهلًا محددًا (مثل الماجستير أو الدكتوراه)، فيجب أن يكون متوفرًا لديك ومستوفيًا لأختامه؛ وإذا كان مطلوبًا ولا تحمله، راجع المكتب قبل البدء بالمعاملة. التصديق الإضافي عبر منصة «مصادقة» السعودية (لكل شهادة طلب مستقل) ثم تصديق السفارة السعودية يُطلب فقط إذا طلبته الجامعة ضمن إجراءاتها؛ وإذا لم تطلبه، يُكتفى بمتطلبات الاعتماد المهني المعتمدة لدى المكتب. المصادقة إجراء مختلف عن التحقق المهني (QVP).';
// owner 2026-10-27: a Jordanian citizen who also holds a foreign passport stays on the Jordanian route (Jordanian
// documents as usual); the visa may be issued on the foreign passport where the procedure allows. Copies of both passports,
// and the full name must match exactly in both — a different name is sent to the office for review, not refused here.
const SD_AMMAN_NOTE = 'جهة القدوم في التأشيرة يجب أن تكون عمّان، لأن المعاملة تُستكمل لدى السفارة السعودية في عمّان.';
const SD_DUAL_DOC = 'صورة عن الجواز الأردني وصورة عن الجواز الأجنبي الذي ستُستكمل عليه المعاملة.';
const SD_DUAL_NOTE = 'تحمل جوازًا أجنبيًا أيضًا: تبقى أوراقك أوراق المواطن الأردني. يجب أن يتطابق الاسم الكامل في الجوازين تمامًا؛ إذا اختلف الاسم يراجع المكتب حالتك قبل استكمال الإجراءات.';
function sdDualPassport(res, context) {
    if (!context || !context.dualPassport) return res;
    const reqs = (res.requirements || []).slice();
    if (!reqs.includes(SD_DUAL_DOC)) { const v = reqs.findIndex((r) => /مطعوم السحايا/.test(r)); reqs.splice(v === -1 ? reqs.length : v, 0, SD_DUAL_DOC); }
    const note = String(res.note || '').includes(SD_DUAL_NOTE) ? res.note : [res.note, SD_DUAL_NOTE].filter(Boolean).join(' • ');
    return { ...res, requirements: reqs, note };
}
function sdProfessorNote(profession, res) {
    // 2026-10-29: every university teaching title (official codes 231xxx), not only 231001
    if (!/^231\d{3}$/.test(String((profession && (profession._templateCode || profession.code)) || ''))) return res;
    if (!String(res.note || '').includes(SD_PROFESSOR_MUSADAQA)) res.note = [res.note, SD_PROFESSOR_MUSADAQA].filter(Boolean).join(' • ');
    return res;
}

function refreshOpenProfessionDetails() {
    syncNationalityControls();
    if (!currentProfession) return;
    const modal = document.getElementById('professionModal');
    if (modal && !modal.classList.contains('hidden')) {
        showProfessionDetails(currentProfession);
    }
}

// 🔽 يعرض/يطوي الأوراق المطلوبة تحت بطاقة المهنة مباشرة (Inline)
function toggleProfessionInline(card, profession) {
    // ── Desktop (≥ 768px): نافذة منبثقة واضحة ──
    if (window.innerWidth >= 768) {
        showProfessionDetails(profession);
        return;
    }

    // ── Mobile (< 768px): inline تحت البطاقة مباشرة ──
    const box = card.querySelector('.prof-inline-details');
    const label = card.querySelector('.prof-toggle-label');
    if (!box) return;

    // طيّ إذا كانت مفتوحة
    if (!box.classList.contains('hidden')) {
        box.classList.add('hidden');
        box.innerHTML = '';
        card.setAttribute('aria-expanded', 'false');
        if (label) label.innerHTML = 'عرض التفاصيل <i class="fas fa-chevron-down transition-transform"></i>';
        return;
    }

    const { name, code, requirements, note, nationality } = computeRequirements(profession);
    currentProfession = { ...profession, _baseRequirements: profession._baseRequirements || [...(profession.requirements || [])], requirements, nationality };

    const list = requirements.map((r, i) => `
        <li class="flex gap-2 py-1.5 text-sm text-gray-700 leading-relaxed">
            <span class="flex-shrink-0 w-5 h-5 bg-gold/15 text-gold rounded-full text-xs font-bold flex items-center justify-center">${i + 1}</span>
            <span class="flex-1">${escapeHtml(r)}</span>
        </li>`).join('');

    const safeName = escapeHtml(name).replace(/'/g, '&#39;');
    box.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-bold text-navy flex items-center gap-2">
                <i class="fas fa-clipboard-list text-gold"></i> الأوراق والمستندات المطلوبة:
            </h4>
            <button onclick="event.stopPropagation(); closeInlineProfession(this)" title="إغلاق" aria-label="إغلاق"
                class="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition flex-shrink-0 text-lg">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <ol class="space-y-1 mb-4" data-sd-cert-auto data-profession="${safeName}">${list}</ol>
        ${note ? `<div class="bg-amber-50 border-r-4 border-amber-400 p-3 rounded-lg mb-4">
            <p class="text-xs text-amber-900"><i class="fas fa-exclamation-circle ml-1"></i> ملاحظة: ${escapeHtml(note)}</p>${/مصادقة/.test(note) ? '<div data-sd-cert="musadaqa"></div>' : ''}
        </div>` : ''}
        <div class="bg-blue-50 border-r-4 border-blue-400 p-3 rounded-lg mb-4">
            <p class="text-xs text-blue-900"><i class="fas fa-info-circle ml-1"></i> قد تختلف بعض المتطلبات حسب الحالة الفردية، يرجى التواصل مع مكتبنا المعتمد.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
            <button onclick="event.stopPropagation(); printInlineProfession(this)" data-code="${escapeHtml(code)}" data-name="${safeName}"
                class="flex-1 bg-gold hover:bg-gold-light text-white px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                <i class="fas fa-print"></i> طباعة الأوراق
            </button>
            <a href="https://wa.me/962789881009?text=${encodeURIComponent('مرحباً Saudia-visa، أود الاستفسار عن إجراءات تأشيرة مهنة: ' + name + '.')}"
               target="_blank" rel="noopener nofollow" data-keep-msg onclick="event.stopPropagation()"
               class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                <i class="fab fa-whatsapp"></i> استفسار واتساب
            </a>
        </div>`;
    if (window.SD_CERT) window.SD_CERT.enhance(box); // owner 2026-10-27: sample certificate next to SVP / QVP / Musadaqa
    box.classList.remove('hidden');
    card.setAttribute('aria-expanded', 'true');
    if (label) label.innerHTML = 'إخفاء التفاصيل <i class="fas fa-chevron-up transition-transform"></i>';
    // خزّن الأوراق على المنطقة لاستخدامها في الطباعة
    box._requirements = requirements;
    box._profName = name;
    box._profCode = SD_printCode(profession, code);
    box._profNote = note || '';
}

// طباعة من البطاقة الـ inline
function printInlineProfession(btn) {
    const box = btn.closest('.prof-inline-details');
    if (box && box._requirements) {
        printProfessionDocument(box._profCode, box._profName, [...box._requirements], currentProfession?.nationality, box._profNote);
    }
}

// إغلاق منطقة الأوراق المعروضة inline ضمن البطاقة
function closeInlineProfession(btn) {
    const box = btn.closest('.prof-inline-details');
    if (!box) return;
    const card = box.closest('[data-prof-idx]');
    box.classList.add('hidden');
    box.innerHTML = '';
    if (card) {
        const label = card.querySelector('.prof-toggle-label');
        if (label) label.innerHTML = 'عرض التفاصيل <i class="fas fa-chevron-down transition-transform"></i>';
    }
}

function showProfessionDetails(profession) {
    // استخدام computeRequirements لضمان نفس منطق الأوراق (الجنس + الملاحظة + السحايا الختامي)
    const { name, code, requirements, note, nationality } = computeRequirements(profession);
    currentProfession = { ...profession, _baseRequirements: profession._baseRequirements || [...(profession.requirements || [])], requirements, nationality };

    document.getElementById('modalProfessionName').textContent = name;
    document.getElementById('modalProfessionCode').textContent = profession.no_official_code ? SD_NO_CODE : (profession.isEstimate && profession.officialCode ? SD_printCode(profession, code) : code);
    const modalList = document.getElementById('modalRequirementsList');
    modalList.innerHTML = requirements.map(req =>
        `<li class="py-2 border-b border-gray-100 last:border-0">${escapeHtml(req)}</li>`
    ).join('');
    // owner 2026-10-27: the same sample-certificate link as the inline details (small screens open this modal instead)
    modalList.setAttribute('data-sd-cert-auto', ''); modalList.setAttribute('data-profession', name);
    if (window.SD_CERT) window.SD_CERT.enhance(modalList.parentNode);

    // «الصفحة الكاملة»: the profession's own /p/ page when it exists
    const seoLink = document.getElementById('modalSeoLink');
    if (seoLink) {
        const url = professionPageUrl(code);
        seoLink.classList.toggle('hidden', !url);
        if (url) seoLink.href = url;
    }

    // ملاحظة خارج البنود (مثل بائع مباشر)
    const noteEl = document.getElementById('modalNoteBox');
    const noteContainer = document.getElementById('modalNoteContainer');
    if (noteEl && noteContainer) {
        if (note) {
            noteEl.textContent = note;
            // the optional Musadaqa note («أستاذ تعليم عالي») gets the Musadaqa sample next to it
            const oldCert = noteContainer.querySelector('.sdc-trigger'); if (oldCert) oldCert.remove();
            if (window.SD_CERT && /مصادقة/.test(note)) noteContainer.appendChild(window.SD_CERT.button('musadaqa'));
            noteContainer.classList.remove('hidden');
        } else {
            noteContainer.classList.add('hidden');
        }
    }

    const modal = document.getElementById('professionModal');
    const openingModal = modal.classList.contains('hidden');
    if (openingModal) {
        professionModalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        professionModalBodyState = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            overflow: document.body.style.overflow
        };
        document.documentElement.classList.add('overflow-hidden');
        document.body.style.position = 'fixed';
        document.body.style.top = `-${professionModalScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    if (openingModal) modal.querySelector('[data-profession-modal-scroll]')?.focus({ preventScroll: true });
}

function closeProfessionModal() {
    const modal = document.getElementById('professionModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('overflow-hidden');
    const state = professionModalBodyState || {};
    document.body.style.position = state.position || '';
    document.body.style.top = state.top || '';
    document.body.style.left = state.left || '';
    document.body.style.right = state.right || '';
    document.body.style.width = state.width || '';
    document.body.style.overflow = state.overflow || '';
    professionModalBodyState = null;
    window.scrollTo(0, professionModalScrollY);
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function updateLoadMoreButton(professions) {
    let btn = document.getElementById('loadMoreBtn');
    if (renderedCount >= professions.length) { if (btn) btn.remove(); return; }
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'loadMoreBtn';
        btn.className = 'mx-auto mt-8 px-8 py-4 bg-gold text-white rounded-xl font-bold shadow-lg flex items-center gap-3 hover:scale-105 transition-transform';
        btn.addEventListener('click', () => renderBatch(filteredData));
        document.getElementById('professionsGrid').parentNode.insertBefore(btn, document.getElementById('professionsGrid').nextSibling);
    }
    btn.innerHTML = `<i class="fas fa-plus-circle"></i> تحميل المزيد`;
}

function removeLoadMoreButton() {
    const btn = document.getElementById('loadMoreBtn');
    if (btn) btn.remove();
}

function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// owner 2026-10-29: the code on the printed sheet — the record's code; for an estimate recognised from the official list,
// its OFFICIAL code, saying plainly that the title is not registered with the office and the documents are an estimate
function SD_printCode(p, code) {
    if (p && p.no_official_code) return SD_NO_CODE_PRINT;
    return p && p.isEstimate && /^\d{6}$/.test(String(p.officialCode || '')) ? `${p.officialCode} (رمز رسمي؛ المسمى غير مسجل لدى المكتب والأوراق تقديرية)` : code;
}
if (typeof window !== 'undefined') window.SD_printCode = SD_printCode;
function printProfessionDetails() {
    if (!currentProfession) return;
    const fresh = computeRequirements(currentProfession);
    currentProfession = { ...currentProfession, requirements: fresh.requirements, nationality: fresh.nationality, isJordanian: fresh.isJordanian };
    const name = fresh.name;
    const code = SD_printCode(currentProfession, fresh.code);
    const requirements = fresh.requirements;
    const printableNationality = fresh.isJordanian ? '' : fresh.nationality;

    if (typeof window.printProfessionDocument === 'function') {
        window.printProfessionDocument(code, name, requirements, printableNationality, fresh.note || '');
    } else {
        window.print();
    }
}

function downloadProfessionPDF() {
    if (!currentProfession) return;
    const name = currentProfession.profession_name_ar || currentProfession.name_ar;
    showCustomAlert(`جاري تجهيز ملف PDF لمهنة: ${name}\nيرجى الانتظار قليلاً...`);
    printProfessionDetails();
}
