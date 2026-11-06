/* Office service fees in Jordanian dinars — the ONE place prices live.
 * Sources: owner decision 2026-10-24 (docs/owner-briefs/2026-10-24-prices.md) and owner message 2026-10-27
 * (medical exam 160 + appointment 10 = 170; meningitis vaccine 60 only when needed; general manager 450).
 * Prices not named by the owner keep their previous values. These are office fees and the fees the office books
 * for the visitor (medical exam); government / embassy fees are NOT included and are never assumed to be zero.
 * Used by js/calculator.js (SD_calcEstimate) and tests/snapshot.js. Static texts that quote prices: tools/check-prices.js. */
var SD_PRICES = {
  workVisa: {
    worker:    { min: 150, max: 200, label: 'العمال والمهن العمالية' },
    secondary: { min: 150, max: 200, label: 'مهن الثانوية العامة أو أقل والمهن الحرفية' },
    professional: { min: 220, max: 300, label: 'مهن تتطلب بكالوريوس' },
    engineer:  { min: 220, max: 300, label: 'المهندسون' },
    doctor:    { min: 350, max: 500, label: 'الأطباء' },
    // owner 2026-10-27: the general manager is 450
    gm:        { min: 450, max: 450, label: 'المدير العام' },
    // owner 2026-10-27 (second message): 450 for the senior management categories set by the office (classification and Saudi CR rules)
    senior:    { min: 450, max: 450, label: 'الإدارة العليا والمستثمرون (الرئيس التنفيذي، رئيس مجلس الإدارة، المدير الشريك، المستثمر)' },
    ceo:       { min: 450, max: 450, label: 'الرئيس التنفيذي' }, // old links (?cat=ceo)
    domestic:  { min: 150, max: 200, label: 'العمالة المنزلية' }
  },
  qvp: 250,                 // التحقق المهني QVP — تجهيز ورفع الشهادات والخبرة ومراجعة المستندات (خبرة لا تقل عن سنتين)
  qvpMinExperienceYears: 2,
  labourExam: 80,           // الفحص المهني SVP — حجز موعد الامتحان في AMIDEAST؛ النتيجة حسب أداء المتقدم
  engineerCertificates: { 1: 160, 2: 180 }, // تصديق الشهادات الجامعية للمهندسين (مصادقة + السفارة) حسب عدد النسخ
  // owner 2026-10-27
  medicalExam: 160,
  appointmentBooking: 10,   // موعد الفحص الطبي
  meningitisVaccine: 60,    // مطعوم السحايا: إضافي فقط لمن لم يحصل عليه
  otherVisas: {
    residence: { min: 70, max: 90 }, visit: { min: 120, max: 140 }, family: { min: 120, max: 140 },
    personal: { min: 120, max: 140 }, business: { min: 120, max: 140 }, government: { min: 50, max: 90 }
  }
};
if (typeof window !== 'undefined') window.SD_PRICES = SD_PRICES;
