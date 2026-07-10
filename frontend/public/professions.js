let professionsData = [];
let filteredData = [];
let renderedCount = 0;
const BATCH_SIZE = 30;
let currentProfession = null;
let professionModalScrollY = 0; // ✅ حفظ موضع التمرير عند فتح النافذة

// Load professions data on page load
document.addEventListener('DOMContentLoaded', function() {
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
        genderFilter.addEventListener('change', filterProfessions);
    }

    // ⚡ Event delegation للكروت
    const grid = document.getElementById('professionsGrid');
    if (grid) {
        grid.addEventListener('click', function(e) {
            const card = e.target.closest('[data-prof-idx]');
            if (!card) return;
            // تجاهل النقرات داخل منطقة الأوراق المفتوحة (X، طباعة، واتساب)
            if (e.target.closest('.prof-inline-details')) return;
            const idx = parseInt(card.dataset.profIdx, 10);
            const source = filteredData.length ? filteredData : professionsData;
            if (source[idx]) toggleProfessionInline(card, source[idx]);
        });
    }
});

// Load professions from JSON file
async function loadProfessions() {
    try {
        const response = await fetch('professions.json');
        const data = await response.json();
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

// 🚫 GIBBERISH FILTER (ANTI-ABUSE)
function isGibberish(input) {
    const norm = normalizeArabic(input);
    if (!norm || norm.length < 3) return true;
    
    // Reject pure numeric / punctuation
    if (!/[\u0600-\u06FFa-z]/.test(norm)) return true;

    const nonsensicalPatterns = [
        "انا", "مين", "شو", "وين", "ليش", "مش", "انت", "لا", "ميسي", "رونالدو", "بطيخ", 
        "كلب", "حيوان", "حمار", "خيل", "ابن", "ملعون", "طيز", "منيك", "شرموط", "عرص",
        "asd", "qwe", "zxc", "123", "مطرب", "مغني", "فنان", "سعفون", "جربان", "جرابين",
        "قحبة", "كس", "شلن", "مرا الملعون", "الشراميط", "المنيك", "طيزري", "طيزي",
        "ليش مين انا", "شو وين", "مش انت", "لاللا", "مواصفات الكلب", "ابن الكلب"
    ];
    
    if (nonsensicalPatterns.some(p => norm.includes(p))) return true;
    
    // Check for fake job compounds
    const fakeCompounds = ["مهندس انا", "مهندس بيت", "عامل مصري", "عامل برميل", "عامل تنين", "عامل فقط", "عامل عام", "عامل عملة", "عامل زريعه", "عامل طوب", "مهندس مجاري", "مهندسين كنادر", "كندرجي"];
    if (fakeCompounds.some(p => norm.includes(p))) return true;
    
    return false;
}

// 🧠 AI-Logic: Classify ANY profession and get requirements
function classifyProfession(inputName) {
    const normName = normalizeArabic(inputName);
    
    // Specific check for generic terms that need clarification
    if (normName === "مهندس") {
        showCustomAlert("يرجى تحديد نوع المهندس (مثلاً: مهندس معماري، مهندس كهرباء، إلخ)");
        return null;
    }
    if (normName === "طبيب" || normName === "دكتور") {
        showCustomAlert("يرجى تحديد تخصص الطبيب (مثلاً: طبيب أسنان، طبيب عام، إلخ)");
        return null;
    }
    if (normName === "عامل") {
        showCustomAlert("يرجى تحديد نوع العمل (مثلاً: عامل مخزن، عامل تعبئة، إلخ)");
        return null;
    }

    if (isGibberish(inputName)) return null;

    // 📋 PREDEFINED DOCUMENT TEMPLATES (Fixed Sets)
    const DOCS = {
        BASE: [
            "حسن سيرة وسلوك من المخابرات العامة (التقديم إلكتروني عبر موقع المخابرات العامة أو من خلال تطبيق سند).",
            "الوثائق العسكرية (مشروحات من القيادة العامة، كتاب من التعبئة / قسم شؤون الأفراد العنوان: طبربور دوار الدبابة يكون معك دفتر خدمة العلم / بطاقة إنهاء الخدمة أو الإعفاء).",
            "عمل الفحص الطبي والبصمة لدى المراكز المعتمدة للسفارة السعودية (إحضار جواز السفر و 6 صور شخصية حديثة بخلفية بيضاء لكافة المعاملات).",
            "عقد عمل مصدق من الغرفة التجارية والخارجية السعودية.",
            "عمل تفويض إلكتروني للمكتب.",
            "الحصول على شهادة مطعوم السحايا.",
            "ملاحظة هامة جداً (التصديقات الخارجية): يجب تصديق جميع الأوراق الرسمية والشهادات المطلوبة أعلاه من وزارة الخارجية الأردنية قبل تقديمها."
        ],
        ACADEMIC_ADDON: [
            "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل",
            "خبرة لمدة سنتين بنفس مسمى التأشيرة"
        ],
        ENGINEERING_ADDON: [
            "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل",
            "خبرة لمدة سنتين بنفس مسمى التأشيرة",
            "الحصول على شهادة الاعتماد المهني"
        ],
        MEDICAL_ADDON: [
            "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل",
            "خبرة لمدة سنتين بنفس مسمى التأشيرة",
            "الحصول على شهادة الاعتماد المهني (ممارس بلس) و DataFlow"
        ],
        EXECUTIVE_ADDON: [
            "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل",
            "خبرة لمدة سنتين بنفس مسمى التأشيرة",
            "السجل التجاري السعودي (في حال كان المسمى مدير عام أو شريك)"
        ],
        TECHNICAL_ADDON: [
            "إحضار شهادة الثانوية العامة (الأصل)",
            "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة",
            "الحصول على شهادة الاعتماد المهني"
        ],
        SKILLED_SERVICE_ADDON: [
            "إحضار شهادة مدرسية (الصف العاشر)",
            "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة",
            "الحصول على شهادة الاعتماد المهني ومزاولة المهنة"
        ],
        LABOUR_ADDON: [
            "إحضار الشهادة المدرسية (الأصل)"
        ],
        DRIVER_ADDON: [
            "رخصة سياقة سارية المفعول (مختومة من السفارة)"
        ]
    };

    let finalReqs = [...DOCS.BASE];
    let category = "أخرى";
    let role = "General Role";

    // 🧠 DOCUMENT RULE ENGINE (Category Classifier + Role Refiner)
    
    // 0. Generic Title Blocker
    const genericTitles = ["مهندس", "مدير", "مدراء", "أخصائي", "اخصائي", "أخصائية", "اخصائية", "دكتور", "طبيب"];
    if (genericTitles.includes(normName)) {
        let msg = "يرجى إدخال مسمى وظيفي دقيق.";
        if (normName.includes("مهندس")) msg = "يرجى تحديد تخصص الهندسة بدقة (مثال: مهندس كهرباء، مهندس مدني، مهندس ميكانيك...) للوصول للأوراق الصحيحة.";
        if (normName.includes("مدير")) msg = "يرجى كتابة المسمى الإداري الكامل للتأشيرة (مثال: مدير إداري، مدير مبيعات، مدير مشاريع...).";
        if (normName.includes("أخصائي") || normName.includes("اخصائي")) msg = "يرجى تحديد التخصص (مثال: أخصائي تسويق، أخصائي مختبرات...) للوصول للأوراق الصحيحة.";
        if (normName.includes("دكتور") || normName.includes("طبيب")) msg = "يرجى تحديد تخصص الطب بدقة (مثال: طبيب عام، طبيب أسنان...) للوصول للأوراق الصحيحة.";
        
        return {
            name_ar: inputName,
            profession_name_ar: inputName,
            code: "---",
            category: "تنبيه",
            role: "Generic Title",
            requirements: [msg],
            isAiGenerated: true,
            isGenericWarning: true
        };
    }

    // 1. SOVEREIGN EXECUTIVE EXCLUSIONS (Premium titles - DO NOT MODIFY)
    if (normName === "رئيس تنفيذي" || normName === "مدير عام" || normName === "مستثمر") {
        category = "المدراء";
        role = "Executive / Sovereign";
        finalReqs.splice(2, 0, ...DOCS.EXECUTIVE_ADDON);
        if (normName === "مستثمر" || normName === "مدير عام") {
             finalReqs.splice(4, 0, "السجل التجاري السعودي (في حال كان المسمى مدير عام أو شريك)");
        }
    }
    // 2. MEDICAL SECTOR (Master Template for all medical titles)
    else if (normName.includes("طبيب") || normName.includes("دكتور") || normName.includes("ممرض") || normName.includes("صيدلي") || normName.includes("فني مختبر") || normName.includes("قابلة")) {
        category = "الاختصاصيون";
        role = "Medical Sector";
        finalReqs.splice(2, 0, ...DOCS.MEDICAL_ADDON);
    }
    // 3. ENGINEERING SECTOR — أي مسمى يحتوي "مهندس" (أياً كان التخصص) يأخذ نفس مصفوفة أوراق المهندسين الموحدة
    else if (normName.includes("مهندس") || normName.includes("هندسه")) {
        return {
            name_ar: inputName,
            profession_name_ar: inputName,
            code: "---",
            category: "الاختصاصيون",
            role: "Engineering Sector",
            requirements: [
                "حسن سيرة وسلوك من المخابرات العامة (التقديم إلكتروني عبر موقع المخابرات العامة أو من خلال تطبيق سند).",
                "الوثائق العسكرية (مشروحات من القيادة العامة، كتاب من التعبئة / قسم شؤون الأفراد العنوان: طبربور دوار الدبابة يكون معك دفتر خدمة العلم / بطاقة إنهاء الخدمة أو الإعفاء).",
                "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل.",
                "عمل الفحص الطبي والبصمة لدى المراكز المعتمدة للسفارة السعودية (إحضار جواز السفر و 6 صور شخصية حديثة بخلفية بيضاء لكافة المعاملات).",
                "خبرة لمدة سنتين بنفس مسمى التأشيرة.",
                "عقد عمل من الشركة السعودية + خطاب إطلاع مختومين من الغرفة التجارية والخارجية السعودية.",
                "الحصول على شهادة الاعتماد المهني.",
                "الحصول على شهادة من موقع مصادقة السعودي.",
                "عضوية + مزاولة مهنة من نقابة المهندسين الأردنية.",
                "التسجيل في هيئة المهندسين السعودية.",
                "عمل تفويض إلكتروني للمكتب.",
                "الحصول على شهادة مطعوم السحايا."
            ],
            isAiGenerated: true
        };
    }
    // 4. ACADEMIC & ADVANCED SECTOR (Specialists, Supervisors, Coordinators)
    else if (normName.includes("اخصائي") || normName.includes("مشرف") || normName.includes("منسق") || normName.includes("سكرتير") || normName.includes("مدير") || normName.includes("رئيس") || normName.includes("مسؤول")) {
        
        // Specific Overrides for Quality / Admin Assistant
        if (normName.includes("مراقب جودة") || normName.includes("مساعد اداري")) {
            category = "الفنيون";
            role = "Quality / Admin Assistant";
            finalReqs.splice(2, 0, "إحضار شهادة الثانوية العامة (الأصل)", "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة");
            // NO accreditation for these two
        } else {
            category = "المدراء";
            role = "Academic / Management Sector";
            finalReqs.splice(2, 0, ...DOCS.ACADEMIC_ADDON, "الحصول على شهادة الاعتماد المهني");
        }
    }
    // 5. DRIVING & DOMESTIC SECTOR
    else if (normName.includes("سائق") || normName.includes("مربية") || normName.includes("منزلي")) {
        category = "العمال";
        if (normName.includes("سائق")) {
            role = "Driving Sector";
            finalReqs.splice(2, 0, "صورة عن رخصة السياقة مختومة من إدارة الترخيص");
        } else if (normName.includes("مربية")) {
            role = "Domestic Nanny";
            finalReqs.splice(2, 0, "عدم ممانعة من ولي الأمر مصدقة", "شهادة خلو سوابق");
        } else {
            role = "Domestic Worker";
            finalReqs.splice(2, 0, "إحضار الشهادة المدرسية (الأصل)");
        }
    }
    // 6. COMMERCIAL & SALES SECTOR
    else if (normName.includes("مندوب") || normName.includes("بائع") || normName.includes("مبيعات") || normName.includes("مشتريات") || normName.includes("منسق زهور")) {
        category = "الكتبة";
        if (normName.includes("بائع") || normName.includes("منسق زهور")) {
            role = "Direct Sales / Florist";
            finalReqs.splice(2, 0, "إحضار شهادة الصف العاشر", "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة");
            // NO accreditation for these
        } else {
            // 🔗 مندوب مبيعات / مندوب مشتريات → نفس أوراق (أخصائي تسويق) تماماً
            // الفرق الوحيد: مندوب المبيعات خبرة سنة واحدة، والمشتريات سنتين
            role = "Sales / Purchasing Representative";
            const expYears = normName.includes("مشتريات") ? "سنتين" : "سنة واحدة";
            finalReqs.splice(2, 0, "إحضار الشهادة الجامعية (الأصل) وكشف العلامات الأصل", `خبرة لمدة ${expYears} بنفس مسمى التأشيرة`, "الحصول على شهادة الاعتماد المهني");
        }
    }
    // 7. CRAFTS & PERSONAL SERVICES
    else if (normName.includes("مصفف شعر") || normName.includes("حلاق") || normName.includes("طاهي") || normName.includes("شيف") || normName.includes("حداد") || normName.includes("نجار") || normName.includes("كهربائي") || normName.includes("سباك") || normName.includes("ميكانيكي") || normName.includes("ميكانيك") || normName.includes("دهان") || normName.includes("بلاط") || normName.includes("نقاش") || normName.includes("لحام") || normName.includes("خياط") || normName.includes("تكييف") || normName.includes("تبريد") || normName.includes("تمديدات")) {
        category = "الحرفيون";
        if (normName.includes("مصفف شعر")) {
            role = "Hair Stylist";
            finalReqs.splice(2, 0, "إحضار شهادة الثانوية العامة (الأصل)", "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة", "شهادة مزاولة مهنة", "الحصول على شهادة الاعتماد المهني");
        } else {
            role = "Crafts / Services";
            finalReqs.splice(2, 0, "إحضار الشهادة المدرسية (الأصل)", "خبرة لمدة سنة واحدة بنفس مسمى التأشيرة", "شهادة مزاولة مهنة", "الحصول على شهادة الاعتماد المهني");
        }
    }
    // 8. GENERAL LABOUR SECTOR — نفس أوراق (عامل تحميل وتنزيل) تماماً دون بند التصديقات المرقم،
    // ولأن شرط الفحص المهني غير محدد بعد لهذه المهن تظهر ملاحظة التحقق خارج البنود المرقمة
    else if (normName.includes("عامل") || normName.includes("تحميل") || normName.includes("تنزيل") || normName.includes("تغليف") || normName.includes("مخزن") || normName.includes("تنظيف") || normName.includes("فراش")) {
        return {
            name_ar: inputName,
            profession_name_ar: inputName,
            code: "---",
            category: "العمال",
            role: "General Labour Sector",
            requirements: [
                "حسن سيرة وسلوك من المخابرات العامة (التقديم إلكتروني عبر موقع المخابرات العامة أو من خلال تطبيق سند).",
                "الوثائق العسكرية (مشروحات من القيادة العامة، كتاب من التعبئة / قسم شؤون الأفراد العنوان: طبربور دوار الدبابة يكون معك دفتر خدمة العلم / بطاقة إنهاء الخدمة أو الإعفاء).",
                "إحضار الشهادة المدرسية (الأصل).",
                "عمل الفحص الطبي والبصمة لدى المراكز المعتمدة للسفارة السعودية (إحضار جواز السفر الجديد و 6 صور شخصية حديثة بخلفية بيضاء لكافة المعاملات).",
                "عقد عمل مصدق من الغرفة التجارية والخارجية السعودية.",
                "عمل تفويض إلكتروني للمكتب.",
                "الحصول على شهادة مطعوم السحايا."
            ],
            note: "يرجى التواصل مع خدمة العملاء مباشرة للتحقق من مدى حاجتكم لاعتماد الفحص المهني لهذه المهنة وتأكيد الإجراءات المحدثة.",
            isAiGenerated: true
        };
    }
    // 9. FAMILY RECRUITMENT
    else if (normName.includes("استقدام") || normName.includes("اقامة") || normName.includes("أقامة") || normName.includes("زيارة")) {
        category = "المعاملات العائلية";
        role = "Family Recruitment";
        return {
            name_ar: inputName,
            profession_name_ar: inputName,
            code: "FAMILY",
            category: category,
            role: role,
            requirements: [
                "حسن سيرة وسلوك من المخابرات العامة (التقديم إلكتروني عبر موقع المخابرات العامة أو من خلال تطبيق سند)",
                "شهادات الميلاد الأصلية للأولاد مصدقة من الأحوال والخارجية",
                "عقد الزواج أو شهادة الزواج أصلي مصدق (في حال كان عقد زواج يكون مختوم من قاضي القضاة والمحكمة الشرعية وخارجية أردنية)",
                "عمل فحص طبي للزوجة من المختبر المعتمد لدى السفارة السعودية (صورة شخصية بخلفية بيضاء + جواز السفر). (إذا كان المولود فوق سن الـ 16 يجب إحضار فحص طبي له أيضاً)",
                "جواز السفر الجديد + صور شخصية عدد 2 بخلفية بيضاء",
                "إذا كان المولود أنثى فوق سن 16 إحضار شهادة خلو موانع من المحكمة الشرعية مصدقة من المحكمة وقاضي القضاة ووزارة الخارجية الأردنية",
                "صورة عن تأشيرة الاستقدام",
                "حجز موعد لدى مكتب تأشير",
                "ملاحظة هامة جداً (التصديقات الخارجية): يجب تصديق جميع الأوراق الرسمية والشهادات المطلوبة أعلاه (مثل: حسن السيرة والسلوك، وشهادات الميلاد أو الزواج) من وزارة الخارجية الأردنية قبل تقديمها"
            ],
            isAiGenerated: true
        };
    }

    return {
        name_ar: inputName,
        profession_name_ar: inputName,
        code: "---",
        category: category,
        role: role,
        requirements: finalReqs,
        isAiGenerated: true
    };
}

// Filter professions based on search
function filterProfessions() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const noResults = document.getElementById('noResults');
    
    let filtered = professionsData;
    
    if (searchTerm) {
        const normalizedSearch = normalizeArabic(searchTerm);
        filtered = professionsData.filter(profession => {
            const name = normalizeArabic(profession.profession_name_ar || profession.name_ar || profession.name || '');
            const code = (profession.profession_code || profession.code || '').toLowerCase();
            return name.includes(normalizedSearch) || code.includes(searchTerm.toLowerCase());
        });

        // 🧠 AI-Logic Fallback
        if (filtered.length === 0) {
            if (isGibberish(searchTerm)) {
                displayProfessions([]);
                const noResultsText = noResults.querySelector('p');
                if (noResultsText) noResultsText.textContent = "يرجى إدخال اسم مهنة واضح أو وصف وظيفي صحيح";
                return;
            }
            
            // 🔎 التطابق الجزئي: كلمة جزئية من مهنة مركبة معروفة (زهور → منسق زهور)
            if (window.smartFallback && typeof window.smartFallback.resolvePartial === 'function') {
                const partial = window.smartFallback.resolvePartial(searchTerm);
                if (partial) {
                    displayProfessions([{
                        name_ar: partial.title,
                        profession_name_ar: partial.title,
                        code: "---",
                        category: partial.label,
                        requirements: partial.reqs,
                        note: partial.note || '',
                        isAiGenerated: true
                    }]);
                    return;
                }
            }

            const aiProfession = classifyProfession(searchTerm);
            if (aiProfession) {
                displayProfessions([aiProfession]);
                return;
            }
        }
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(p => (p.category || 'أخرى') === selectedCategory);
    }
    
    displayProfessions(filtered);
}

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

function createProfessionCard(profession, index) {
    const name = profession.profession_name_ar || profession.name_ar || 'غير محدد';
    const code = profession.code || '---';
    const cat = profession.category || 'أخرى';
    const isAi = profession.isAiGenerated;

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
    <span class="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">${escapeHtml(code)}</span>
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

// يحسب الأوراق المطلوبة لمهنة (مع منطق الجنس وحارس مطعوم السحايا الختامي)
function computeRequirements(profession) {
    const name = profession.profession_name_ar || profession.name_ar || '';
    const code = profession.code || '';
    let requirements = [...(profession.requirements || [])];

    const selectedGender = (document.getElementById('genderFilter') || {}).value;
    const seniorPositions = ['مدير', 'رئيس', 'تنفيذي', 'مهندس', 'طبيب'];
    const isSenior = seniorPositions.some(pos => name.includes(pos));

    if (selectedGender === 'female' && !isSenior) {
        const femaleReq = "عدم ممانعة من ولي الأمر (للمتزوجة: شهادة زواج + عدم ممانعة الزوج + صورة جوازه) (للعزباء: عدم ممانعة ولي الأمر + قيد فردي + صورة جوازه)";
        const milIdx = requirements.findIndex(r => r.includes("الوثائق العسكرية"));
        if (milIdx !== -1) requirements[milIdx] = femaleReq;
        else requirements.splice(1, 0, femaleReq);
    }

    // 📌 فصل الملاحظات والتنبيهات عن البنود المرقمة — تُعرض خارج القائمة كملحوظة مستقلة
    let note = profession.note || '';
    const noteItems = requirements.filter(r => /^\s*ملاحظة/.test(r));
    if (noteItems.length) {
        requirements = requirements.filter(r => !/^\s*ملاحظة/.test(r));
        const cleaned = noteItems.map(n => n.replace(/^\s*ملاحظة(\s+هامة\s+جداً)?\s*[:：]?\s*/, '').trim());
        note = [note].concat(cleaned).filter(Boolean).join(' • ');
    }

    const VACCINE_ITEM = "الحصول على شهادة مطعوم السحايا.";
    const isFamilyRecruitment = name.includes("استقدام") || name.includes("اقامة") || name.includes("إقامة") || code === "FAMILY";
    requirements = requirements.filter(r => r.replace(/\s+/g, ' ').trim() !== VACCINE_ITEM);
    if (!isFamilyRecruitment) requirements.push(VACCINE_ITEM);

    return { name, code, requirements, note };
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
        if (label) label.innerHTML = 'عرض التفاصيل <i class="fas fa-chevron-down transition-transform"></i>';
        return;
    }

    const { name, code, requirements, note } = computeRequirements(profession);
    currentProfession = { ...profession, requirements };

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
        <ol class="space-y-1 mb-4">${list}</ol>
        ${note ? `<div class="bg-amber-50 border-r-4 border-amber-400 p-3 rounded-lg mb-4">
            <p class="text-xs text-amber-900"><i class="fas fa-exclamation-circle ml-1"></i> ملاحظة: ${escapeHtml(note)}</p>
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
    box.classList.remove('hidden');
    if (label) label.innerHTML = 'إخفاء التفاصيل <i class="fas fa-chevron-up transition-transform"></i>';
    // خزّن الأوراق على المنطقة لاستخدامها في الطباعة
    box._requirements = requirements;
    box._profName = name;
    box._profCode = code;
}

// طباعة من البطاقة الـ inline
function printInlineProfession(btn) {
    const box = btn.closest('.prof-inline-details');
    if (box && box._requirements) {
        printProfessionDocument(box._profCode, box._profName, [...box._requirements]);
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
    const { name, code, requirements, note } = computeRequirements(profession);
    currentProfession = { ...profession, requirements };

    document.getElementById('modalProfessionName').textContent = name;
    document.getElementById('modalProfessionCode').textContent = code;
    document.getElementById('modalRequirementsList').innerHTML = requirements.map(req =>
        `<li class="py-2 border-b border-gray-100 last:border-0">${escapeHtml(req)}</li>`
    ).join('');

    // ملاحظة خارج البنود (مثل بائع مباشر)
    const noteEl = document.getElementById('modalNoteBox');
    const noteContainer = document.getElementById('modalNoteContainer');
    if (noteEl && noteContainer) {
        if (note) {
            noteEl.textContent = note;
            noteContainer.classList.remove('hidden');
        } else {
            noteContainer.classList.add('hidden');
        }
    }

    const modal = document.getElementById('professionModal');
    professionModalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    modal.classList.remove('hidden');
    document.body.style.width = '100%';
    document.body.classList.add('overflow-hidden');
}

function closeProfessionModal() {
    document.getElementById('professionModal').classList.add('hidden');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('overflow-hidden');
    // window.scrollTo(0, professionModalScrollY); // Not needed if we don't fix position // ✅ استعادة موضع التمرير
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

function printProfessionDetails() {
    if (!currentProfession) return;
    const name = currentProfession.profession_name_ar || currentProfession.name_ar;
    const code = currentProfession.code;
    const requirements = Array.from(document.querySelectorAll('#modalRequirementsList li')).map(li => li.textContent);
    
    if (typeof window.printProfessionDocument === 'function') {
        window.printProfessionDocument(code, name, requirements);
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
