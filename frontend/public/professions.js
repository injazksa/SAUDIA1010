// Professions Page JavaScript
let professionsData = [];
let currentProfession = null;

// Security: HTML Sanitization Helper
function sanitizeForHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

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
});

// Load professions from JSON file
async function loadProfessions() {
    try {
        const response = await fetch('professions.json');
        const data = await response.json();
        professionsData = data;
        
        displayProfessions(professionsData);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('professionsGrid').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading professions:', error);
        document.getElementById('loadingState').innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <h3 class="text-2xl font-bold text-navy mb-2">حدث خطأ في تحميل البيانات</h3>
                <p class="text-gray-600 mb-6">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
                <button onclick="location.reload()" class="px-6 py-3 bg-gold text-white rounded-lg font-bold hover:bg-gold-light transition-colors">
                    تحديث الصفحة
                </button>
            </div>
        `;
    }
}

// Display professions in grid
function displayProfessions(professions) {
    const grid = document.getElementById('professionsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (professions.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        resultsCount.textContent = '0';
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    resultsCount.textContent = professions.length;
    
    grid.innerHTML = professions.map(profession => createProfessionCard(profession)).join('');
}

// Create profession card HTML (XSS-safe)
function createProfessionCard(profession) {
    const professionName = sanitizeForHTML(profession.profession_name_ar || profession.name || profession.professionName || 'غير محدد');
    const professionCode = sanitizeForHTML(profession.profession_code || profession.code || profession.professionCode || 'N/A');
    const category = sanitizeForHTML(profession.category || profession.classification || 'أخرى');
    
    // Store profession index instead of injecting JSON into onclick
    const profIndex = professionsData.indexOf(profession);
    
    return `
        <div class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gold/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer group"
             onclick="showProfessionByIndex(${profIndex})" 
             data-testid="profession-card-${professionCode}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2">
                        ${professionName}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <span class="px-3 py-1 bg-gold/10 text-gold rounded-full font-semibold">
                            ${professionCode}
                        </span>
                        <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                            ${category}
                        </span>
                    </div>
                </div>
                <div class="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-colors">
                    <i class="fas fa-briefcase text-gold group-hover:text-white text-xl transition-colors"></i>
                </div>
            </div>
            
            <div class="pt-4 border-t border-gray-100">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">
                        <i class="fas fa-file-alt text-gold ml-1"></i>
                        الأوراق المطلوبة
                    </span>
                    <span class="text-gold font-semibold group-hover:gap-3 flex items-center gap-2 transition-all">
                        عرض التفاصيل
                        <i class="fas fa-arrow-left"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Show profession by index (safe - no JSON in HTML attributes)
function showProfessionByIndex(index) {
    if (index >= 0 && index < professionsData.length) {
        showProfessionDetails(professionsData[index]);
    }
}

// Normalize Arabic text for better search
function normalizeArabic(text) {
    if (!text) return '';
    return text
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ةه]/g, 'ه')
        .replace(/ى/g, 'ي')
        .toLowerCase();
}

// Filter professions based on search and category
function filterProfessions() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    let filtered = professionsData;
    
    // Filter by search term
    if (searchTerm) {
        const normalizedSearch = normalizeArabic(searchTerm);
        filtered = filtered.filter(profession => {
            const name = normalizeArabic(profession.profession_name_ar || profession.name || profession.professionName || '');
            const code = (profession.profession_code || profession.code || profession.professionCode || '').toLowerCase();
            return name.includes(normalizedSearch) || code.includes(searchTerm.toLowerCase());
        });
    }
    
    // Filter by category
    if (selectedCategory) {
        filtered = filtered.filter(profession => {
            const category = profession.category || profession.classification || 'أخرى';
            return category === selectedCategory;
        });
    }
    
    displayProfessions(filtered);
}

// Show profession details in modal (XSS-safe)
function showProfessionDetails(profession) {
    currentProfession = profession;
    
    const professionName = profession.profession_name_ar || profession.name || profession.professionName || 'غير محدد';
    const professionCode = profession.profession_code || profession.code || profession.professionCode || 'N/A';
    const requirements = profession.requirements || profession.required_documents || getDefaultRequirements();
    
    document.getElementById('modalProfessionName').textContent = professionName;
    document.getElementById('modalProfessionCode').textContent = professionCode;
    
    const requirementsList = document.getElementById('modalRequirementsList');
    requirementsList.innerHTML = requirements.map(req => `<li class="py-2 border-b border-gray-100 last:border-0">${sanitizeForHTML(req)}</li>`).join('');
    
    document.getElementById('professionModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close profession details modal
function closeProfessionModal() {
    document.getElementById('professionModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Print profession details
function printProfessionDetails() {
    if (!currentProfession) return;
    
    const professionName = currentProfession.profession_name_ar || currentProfession.name || currentProfession.professionName || 'غير محدد';
    const professionCode = currentProfession.profession_code || currentProfession.code || currentProfession.professionCode || 'N/A';
    const requirements = currentProfession.requirements || currentProfession.required_documents || getDefaultRequirements();
    
    printProfessionDocument(professionCode, professionName, requirements);
}

// Download profession details as PDF
function downloadProfessionPDF() {
    // For now, this will use the print function
    // In future, can integrate jsPDF library
    printProfessionDetails();
    showToast('جاري تحضير ملف PDF للطباعة...');
}

// Get default requirements if none provided
function getDefaultRequirements() {
    return [
        'جواز سفر ساري المفعول (صلاحية 6 أشهر على الأقل)',
        'صور شخصية حديثة (مقاس 4×6، خلفية بيضاء)',
        'الفحص الطبي المعتمد من المراكز المعتمدة',
        'الشهادات الأكاديمية (البكالوريوس أو الدبلوم حسب المهنة)',
        'شهادات الخبرة العملية (إن وجدت)',
        'تصديق الشهادات من وزارة التعليم العالي الأردنية',
        'تصديق الشهادات من وزارة الخارجية الأردنية',
        'تصديق الشهادات من السفارة السعودية',
        'تفويض إلكتروني (إنجاز) من الكفيل في السعودية',
        'عقد العمل موثق ومصدق'
    ];
}

// Enhanced print function with RESPONSIVE & FLEXIBLE layout (XSS-safe)
function printProfessionDocument(professionCode, professionName, requirements) {
    const printWindow = window.open('', '_blank');
    
    const safeName = sanitizeForHTML(professionName);
    const safeCode = sanitizeForHTML(professionCode);
    
    // فصل الملاحظة عن الأوراق
    let actualRequirements = requirements.filter(req => !req.includes('ملاحظة هامة'));
    let note = requirements.find(req => req.includes('ملاحظة هامة'));
    
    // Sanitize requirements
    const safeRequirements = actualRequirements.map(req => sanitizeForHTML(req));
    const safeNote = note ? sanitizeForHTML(note.replace('ملاحظة هامة جداً (التصديقات الخارجية): ', '')) : null;
    
    // حساب المسافات بشكل ديناميكي حسب عدد البنود
    const reqCount = actualRequirements.length;
    let itemMargin = '5px';
    let itemPadding = '7px';
    let itemPaddingRight = '45px';  // مسافة كبيرة جداً من الرقم
    let fontSize = '11.5px';
    let lineHeight = '1.65';
    let titleSize = '14.5px';
    
    // تعديل المسافات حسب عدد البنود
    if (reqCount <= 7) {
        itemMargin = '10px';
        itemPadding = '11px';
        itemPaddingRight = '50px';  // مسافة كبيرة جداً
        fontSize = '13px';
        lineHeight = '1.75';
        titleSize = '16px';
    } else if (reqCount <= 9) {
        itemMargin = '8px';
        itemPadding = '9px';
        itemPaddingRight = '48px';
        fontSize = '12px';
        lineHeight = '1.7';
        titleSize = '15px';
    } else if (reqCount <= 10) {
        itemMargin = '6px';
        itemPadding = '8px';
        itemPaddingRight = '46px';
        fontSize = '11.5px';
        lineHeight = '1.65';
        titleSize = '14.5px';
    } else {
        itemMargin = '5px';
        itemPadding = '7px';
        itemPaddingRight = '45px';
        fontSize = '11px';
        lineHeight = '1.6';
        titleSize = '14px';
    }
    
    const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>الأوراق المطلوبة - ${safeName}</title>
            <style>
                @page { 
                    size: A4; 
                    margin: 0;
                }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body {
                    width: 210mm;
                    height: 297mm;
                    margin: 0;
                    padding: 0;
                }
                body {
                    font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
                    direction: rtl;
                    text-align: right;
                    color: #1B2A41;
                    background: white;
                    padding: 15mm 12mm;
                    display: flex;
                    flex-direction: column;
                    min-height: 297mm;
                }
                .print-header {
                    background: linear-gradient(135deg, #1B2A41 0%, #2a3f5f 100%);
                    color: white;
                    padding: 12px 18px;
                    text-align: center;
                    border-radius: 5px;
                    margin-bottom: 12px;
                    flex-shrink: 0;
                }
                .print-header h1 {
                    font-size: 17px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    letter-spacing: 0.3px;
                }
                .print-header .subtitle {
                    color: #C9A35E;
                    font-size: 10.5px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                .office-info {
                    background: rgba(255,255,255,0.1);
                    padding: 6px;
                    border-radius: 4px;
                    font-size: 9px;
                    display: flex;
                    justify-content: space-around;
                    gap: 8px;
                }
                .document-title {
                    background: #C9A35E;
                    color: white;
                    padding: 12px;
                    margin: 10px 0;
                    border-radius: 5px;
                    font-size: ${titleSize};
                    font-weight: bold;
                    text-align: center;
                    flex-shrink: 0;
                    letter-spacing: 0.5px;
                }
                .profession-info {
                    background: #f8f9fa;
                    padding: 9px;
                    margin: 8px 0 10px;
                    border-right: 3px solid #C9A35E;
                    border-radius: 4px;
                    font-size: 10.5px;
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    flex-shrink: 0;
                }
                .profession-info strong { color: #1B2A41; font-weight: 600; }
                .section-title {
                    color: #1B2A41;
                    font-size: 12.5px;
                    font-weight: bold;
                    margin: 10px 0 8px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #C9A35E;
                    flex-shrink: 0;
                }
                .content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }
                .requirements-list {
                    margin: 0;
                    padding: 0;
                    counter-reset: item;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                }
                .requirements-list li {
                    padding: ${itemPadding};
                    padding-right: 0;
                    margin: ${itemMargin} 0;
                    margin-right: 32px;
                    border-bottom: 1px solid #e5e7eb;
                    list-style: none;
                    position: relative;
                    font-size: ${fontSize};
                    line-height: ${lineHeight};
                    font-weight: 500;
                }
                .requirements-list li:before {
                    content: counter(item);
                    counter-increment: item;
                    position: absolute;
                    right: -32px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #1B2A41;
                    color: white;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 4px rgba(27, 42, 65, 0.3);
                }
                .note-box {
                    background: #fff9e6;
                    border: 2px solid #C9A35E;
                    border-radius: 5px;
                    padding: 11px;
                    margin: 10px 0;
                    font-size: 10px;
                    line-height: 1.6;
                    flex-shrink: 0;
                }
                .note-box strong {
                    color: #C9A35E;
                    font-size: 11px;
                    font-weight: 600;
                }
                .footer {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid #C9A35E;
                    text-align: center;
                    color: #64748b;
                    font-size: 8.5px;
                    flex-shrink: 0;
                }
                .footer p { margin: 2px 0; }
                @media print {
                    html, body {
                        width: 210mm;
                        height: 297mm;
                    }
                    body { 
                        print-color-adjust: exact; 
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>مكتب تأشيرات السعودية في الأردن - Saudia-visa.com</h1>
                <div class="subtitle">المكتب المعتمد والمرخص من السفارة السعودية</div>
                <div class="office-info">
                    <span>الدوار الأول - جبل عمان</span>
                    <span>0789881009</span>
                    <span>Visa@saudia-visa.com</span>
                </div>
            </div>
            
            <div class="document-title">الأوراق والمستندات المطلوبة لمهنة: ${safeName}</div>
            
            <div class="profession-info">
                <span><strong>المهنة:</strong> ${safeName}</span>
                <span><strong>رمز المهنة:</strong> ${safeCode}</span>
                <span><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <div class="content-wrapper">
                <h2 class="section-title">📋 قائمة الأوراق والمستندات المطلوبة:</h2>
                <ul class="requirements-list">
                    ${safeRequirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
                
                ${safeNote ? `
                <div class="note-box">
                    <strong>ملاحظة هامة:</strong><br>
                    ${safeNote}
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p><strong>مكتب تأشيرات السعودية في الأردن</strong> | نخدمكم بأعلى معايير الدقة والاحترافية</p>
                <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        setTimeout(() => { printWindow.print(); }, 250);
    };
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
