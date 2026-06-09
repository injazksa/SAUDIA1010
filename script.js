// Print Function for Profession Documents
function printProfessionDocument(professionCode, professionName, requirements) {
 // 🛑 حارس إجباري: ضمان أن بند مطعوم السحايا هو البند الختامي الأخير في أي مستند مطبوع
 // (يُستثنى الاستقدام العائلي لأنه معاملة إقامة وليس تأشيرة عمل)
 const VACCINE_ITEM = 'الحصول على شهادة مطعوم السحايا.';
 const isFamilyDoc = (professionName || '').includes('استقدام') || (professionName || '').includes('اقامة') || (professionName || '').includes('إقامة') || professionCode === 'FAMILY';
 requirements = (requirements || []).filter(r => r.replace(/\s+/g, ' ').trim() !== VACCINE_ITEM);
 if (!isFamilyDoc) {
   requirements.push(VACCINE_ITEM);
 }

 // Create a new window for printing
 const printWindow = window.open('', '_blank');
 
  const printContent = `
	 <!DOCTYPE html>
	 <html lang="ar" dir="rtl">
	 <head>
	 <meta charset="UTF-8">
	 <title>الأوراق المطلوبة - ${professionName}</title>
		 <style>
			 @page {
			 size: A4;
			 margin: 10mm 12mm;
			 @top-left { content: ""; }
			 @top-center { content: ""; }
			 @top-right { content: ""; }
			 @bottom-left { content: ""; }
			 @bottom-center { content: ""; }
			 @bottom-right { content: ""; }
			 }
			 @media print { html, body { margin: 0 !important; padding: 0 !important; } }
		 * { 
			box-sizing: border-box; 
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		 }
		 a[href]:after { content: "" !important; }
		 body {
		 font-family: 'Arial', sans-serif;
		 direction: rtl;
		 text-align: right;
			 line-height: 1.7;
			 color: #1e293b;
			 margin: 0;
			 padding: 0;
			 font-size: 14px;
		 }
		 .print-container {
		 width: 100%;
		 height: 100%;
		 display: flex;
		 flex-direction: column;
		 }
		 .print-header {
		 text-align: center;
		 margin-bottom: 22px;
		 padding-bottom: 14px;
		 border-bottom: 2px solid #C9A26A;
		 }
		 .print-header h1 {
		 color: #1B2A41;
		 font-size: 24px;
		 margin: 0 0 6px 0;
		 font-weight: bold;
		 }
		 .print-header .subtitle {
		 color: #C9A26A;
		 font-size: 15px;
		 font-weight: bold;
		 margin-bottom: 6px;
		 }
		 .office-info {
		 color: #475569;
		 font-size: 11px;
		 line-height: 1.6;
		 }
		 .document-title {
		 background: #1B2A41;
		 color: white;
		 padding: 12px 16px;
		 margin: 18px 0;
		 border-radius: 6px;
		 font-size: 16px;
		 font-weight: bold;
		 text-align: center;
		 box-shadow: 0 1px 2px rgba(0,0,0,0.1);
		 }
		 .profession-info {
		 background: #f8fafc;
		 padding: 10px 16px;
		 margin: 14px 0;
		 border-right: 3px solid #C9A26A;
		 border-radius: 4px;
		 font-size: 13px;
		 display: flex;
		 justify-content: space-between;
		 align-items: center;
		 flex-wrap: wrap;
		 }
		 .requirements-list {
		 margin: 16px 0;
		 padding-right: 26px;
		 flex-grow: 1;
		 }
		 .requirements-list li {
		 padding: 9px 0;
		 border-bottom: 0.5px solid #e8eef7;
		 margin-bottom: 6px;
		 line-height: 1.7;
		 }
		 .requirements-list li:last-child { border-bottom: none; }
		 .footer {
		 margin-top: auto;
		 padding-top: 16px;
		 border-top: 1px solid #e2e8f0;
		 text-align: center;
		 color: #64748b;
		 font-size: 11px;
		 }
		 .footer p { margin: 4px 0; }
		 h2 { 
		 color: #1B2A41; 
		 margin: 16px 0 10px; 
		 font-size: 15px;
		 border-bottom: 0.5px solid #e2e8f0;
		 padding-bottom: 5px;
		 }
	 </style>
	 </head>
	 <body>
	 <div class="print-container">
	 <div class="print-header">
	 <h1>مكتب تأشيرات السعودية في الأردن</h1>
	 <div class="subtitle">المركز المعتمد من السفارة السعودية</div>
	 <div class="office-info">
	 <div>📍 العنوان: الدوار الأول - جبل عمان، الأردن</div>
	 <div>📞 الهاتف / واتساب: 0789881009 | ✉️ البريد: Visa@saudia-visa.com</div>
	 <div>🌐 الموقع الإلكتروني: www.saudia-visa.com</div>
	 </div>
	 </div>
	 
	 <div class="document-title">
	 الأوراق المطلوبة لتأشيرة العمل السعودية
	 </div>
	 
		 <div class="profession-info">
		 <span><strong>المهنة:</strong> ${professionName}</span>
		 <span><strong>رمز المهنة:</strong> ${professionCode}</span>
		 <span><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</span>
		 </div>
	 
	 <h2>الأوراق والمستندات المطلوبة:</h2>
			 <ol class="requirements-list">
			 ${requirements.filter(r => {
				// Deduplicate passport/photo in print view too
				// Only deduplicate if it's EXACTLY the same string and not the first occurrence
if (r === 'إحضار جواز السفر و 6 صور شخصية بخلفية بيضاء حديثة لكافة المعاملات.' && requirements.indexOf(r) !== requirements.lastIndexOf(r) && requirements.indexOf(r) !== requirements.indexOf(r)) return false;
				return true;
			 }).map(req => `<li>${req}</li>`).join('')}
			 </ol>

		 ${(!requirements.some(r => r.includes('الاعتماد المهني')) && !professionName.includes('استقدام') && !professionName.includes('اقامة')) ? `
		 <div style="margin-top: 6px; padding: 6px; background-color: #f0f7ff; border-right: 2px solid #3b82f6; border-radius: 3px;">
			 <div style="font-weight: bold; color: #1e40af; font-size: 9pt; margin-bottom: 2px;">تنبيه بخصوص الاعتماد المهني</div>
			 <div style="color: #1e3a8a; font-size: 8pt; line-height: 1.2;">هذه المهنة لا تتطلب اختبار اعتماد مهني حالياً، ولكن يرجى العلم أنه قد يتم تفعيل شرط الاعتماد في أي وقت حسب تحديثات الأنظمة السعودية.</div>
		 </div>
		 ` : ''}
		 
		 <div class="footer">
		 <p><strong>ملاحظة:</strong> قد تختلف المستندات حسب السفارة والحالة الفردية، يرجى التواصل معنا للحصول على معلومات دقيقة ومحدثة.</p>
		 <p>© 2026 مكتب تأشيرات السعودية في الأردن - جميع الحقوق محفوظة</p>
		 </div>
	 </div>
	 </body>
	 </html>
	 `;
 
 printWindow.document.write(printContent);
 printWindow.document.close();
 
 // Wait for content to load then print
 printWindow.onload = function() {
 printWindow.print();
 };
}
