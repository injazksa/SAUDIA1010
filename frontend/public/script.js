// Print Function for Profession Documents
function printProfessionDocument(professionCode, professionName, requirements, selectedNationality = '', professionNote = '') {
 // owner 2026-10-26: the printed list carries the same notes as the screen (estimate by category, SVP activation,
 // office notes) and says clearly when the profession is an estimate rather than a listed record
 const escP = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
 const isEstimate = /نتيجة تقديرية/.test(professionNote || '');
 // (2026-10-29: «XXXXXX (رمز رسمي؛ …)» = the official code of an estimate, printed as given)
 // (and «لا يوجد رمز رسمي مؤكد…» for a record without a confirmed official code, also printed as given)
 if (!/^\d{6}(?:$| \()|^لا يوجد رمز رسمي مؤكد/.test(String(professionCode)) && professionCode !== 'FAMILY') professionCode = isEstimate ? 'غير مدرجة (نتيجة تقديرية)' : 'غير محدد';
 // 🛑 حارس إجباري: ضمان أن بند مطعوم السحايا هو البند الختامي الأخير في أي مستند مطبوع
 // (يُستثنى الاستقدام العائلي لأنه معاملة إقامة وليس تأشيرة عمل)
 const VACCINE_ITEM = 'الحصول على شهادة مطعوم السحايا.';
 const isFamilyDoc = (professionName || '').includes('استقدام') || (professionName || '').includes('اقامة') || (professionName || '').includes('إقامة') || professionCode === 'FAMILY';
 const nationalityFromPage = selectedNationality || document.getElementById('nationalityFilter')?.value || '';
 const otherNationality = document.getElementById('otherNationality')?.value || '';
 const printNationality = nationalityFromPage === 'other' ? otherNationality : nationalityFromPage;
 requirements = (requirements || []).filter(r => r.replace(/\s+/g, ' ').trim() !== VACCINE_ITEM);
 if (!isFamilyDoc) {
   requirements.push(VACCINE_ITEM);
 }
 // 2026-11-05 (security, owner approval): every value written into the print document is escaped — the profession
 // name and the nationality can be typed by the visitor (smart fallback, «جنسية أخرى»), so no markup may run.
 // The site's data has no & < > in these values, so the printed document is byte-for-byte the same as before.
 const nameH = escP(professionName), natH = escP(printNationality), codeH = escP(professionCode);

 // Create a new window for printing
 const printWindow = window.open('', '_blank');
 
  const printContent = `
	 <!DOCTYPE html>
	 <html lang="ar" dir="rtl">
	 <head>
	 <meta charset="UTF-8">
	 <title>الأوراق المطلوبة - ${nameH}</title>
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
		 /* 2026-10-30: the watermark comes from the site's one system (js/sd-watermark.js): A4 pages, 3–5 marks per page in the empty areas */
		 .print-container { position: relative; z-index: 1;
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
		 /* 2026-11-07 (owner): the item number in a small navy/gold ring. The text column keeps its width (26px, as with the old
		    marker), so lines and pages do not change; counter(list-item) follows the list's start= when a list continues on a page */
		 .requirements-list { list-style: none; padding-right: 0; }
		 .requirements-list li { position: relative; padding-right: 26px; }
		 .requirements-list li::before { content: counter(list-item); position: absolute; right: 0; top: 11px; width: 19px; height: 19px; box-sizing: border-box; border-radius: 50%; border: 1.2px solid #C9A35E; background: #FBF6EA; color: #1B2A41; font: 700 10.5px/16.5px Arial, sans-serif; text-align: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
		 .sv-snug .requirements-list li::before { top: 8px; }
		 .footer {
		 margin-top: auto;
		 padding-top: 16px;
		 border-top: 1px solid #e2e8f0;
		 text-align: center;
		 color: #64748b;
		 font-size: 11px;
		 }
		 .footer p { margin: 4px 0; }
		 /* 2026-10-31: only when the footer would stand alone on a second page — less space between items, same text */
		 .sv-snug .print-header { margin-bottom: 14px; padding-bottom: 10px; }
		 .sv-snug .document-title { margin: 12px 0; }
		 .sv-snug .profession-info { margin: 10px 0; }
		 .sv-snug h2 { margin: 10px 0 8px; }
		 .sv-snug .requirements-list { margin: 10px 0; }
		 .sv-snug .requirements-list li { padding: 6px 0; margin-bottom: 3px; }
		 .sv-snug .footer { padding-top: 10px; }
		 .sv-keep .requirements-list { margin-top: 0; }
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
<span><strong>المهنة:</strong> ${nameH}</span>
			 ${printNationality && printNationality !== 'الأردن' ? `<span><strong>الجنسية:</strong> ${natH}</span>` : ''}
			 <span><strong>رمز المهنة:</strong> ${codeH}</span>
			 <span><strong>التاريخ:</strong> ${(window.SD_printToday ? window.SD_printToday() : new Date().toLocaleDateString('en-GB'))}</span>
		 </div>
	 
	 <h2>الأوراق والمستندات المطلوبة:</h2>
			 <ol class="requirements-list">
			 ${requirements.filter(r => {
				// Deduplicate passport/photo in print view too
				// Only deduplicate if it's EXACTLY the same string and not the first occurrence
if (r === 'إحضار جواز السفر و 6 صور شخصية بخلفية بيضاء حديثة لكافة المعاملات.' && requirements.indexOf(r) !== requirements.lastIndexOf(r) && requirements.indexOf(r) !== requirements.indexOf(r)) return false;
				return true;
			 }).map(req => `<li>${escP(req)}</li>`).join('')}
			 </ol>
		 ${professionNote ? `
		 <div style="margin-top: 6px; padding: 6px; background-color: #fffbeb; border-right: 2px solid #d97706; border-radius: 3px;">
			 <div style="font-weight: bold; color: #92400e; font-size: 9pt; margin-bottom: 2px;">${isEstimate ? 'نتيجة تقديرية — تحتاج تأكيد المكتب' : 'ملاحظة'}</div>
			 <div style="color: #78350f; font-size: 8pt; line-height: 1.3;">${escP(professionNote)}</div>
		 </div>` : ''}

		 ${(!requirements.some(r => /الاعتماد المهني|التحقق المهني|الفحص المهني|QVP|SVP/.test(r)) && !professionName.includes('استقدام') && !professionName.includes('اقامة')) ? `
		 <div style="margin-top: 6px; padding: 6px; background-color: #f0f7ff; border-right: 2px solid #3b82f6; border-radius: 3px;">
			 <div style="font-weight: bold; color: #1e40af; font-size: 9pt; margin-bottom: 2px;">تنبيه بخصوص التحقق أو الفحص المهني</div>
			 <div style="color: #1e3a8a; font-size: 8pt; line-height: 1.2;">لا يظهر في قائمة هذه المهنة حاليًا التحقق المهني (QVP) ولا الفحص المهني (SVP)، ولكن قد يتم تفعيل أحدهما في أي وقت حسب تحديثات الأنظمة السعودية.</div>
		 </div>
		 ` : ''}
		 
		 <div class="footer">
		 <p><strong>ملاحظة:</strong> قد تختلف المستندات حسب السفارة والحالة الفردية، يرجى التواصل معنا للحصول على معلومات دقيقة ومحدثة. هذه الورقة إرشادية ولا تعني ضمان صدور التأشيرة.</p>
		 <p>© 2026 مكتب تأشيرات السعودية في الأردن - جميع الحقوق محفوظة</p>
		 </div>
	 </div>
	 <script src="${location.origin}/js/sd-watermark.js?v=20261107"><\/script>
	 <script>
	 // lay the sheet out on A4 pages with the office watermark (the site's one system), then print
	 (function () {
	   // 2026-10-31 (owner): never a last page holding only the footer. 1) as designed; 2) if the footer would stand
	   // alone: slightly less space BETWEEN items (same font size, same line height); 3) if still alone: the last two
	   // items go to the second page with the footer (two natural pages). The whole document always prints.
	   function footerAlone(root) {
	     var ps = root.querySelectorAll('.sdp-page'); if (ps.length < 2) return false;
	     var inner = ps[ps.length - 1].querySelector('.sdp-page-inner'), f = inner && inner.querySelector('.footer');
	     var all = inner ? inner.textContent.replace(/\\s+/g, '').length : 0, ft = f ? f.textContent.replace(/\\s+/g, '').length : 0;
	     return all - ft < 40;
	   }
	   function go() {
	     var st = document.createElement('style'); st.textContent = SD_WM.css(); document.head.appendChild(st);
	     var root = document.querySelector('.print-container'), orig = root.innerHTML;
	     function again() { root.innerHTML = orig; root.removeAttribute('style'); }
	     SD_WM.layout(root, { fill: 0.99 });
	     if (footerAlone(root)) { again(); document.body.classList.add('sv-snug'); SD_WM.layout(root, { fill: 0.99 }); }
	     if (footerAlone(root)) {
	       again(); document.body.classList.remove('sv-snug');
	       var ol = root.querySelector('.requirements-list'), lis = ol ? ol.children : [];
	       if (lis.length > 3) {
	         // the last two items + notes + footer: one block that moves to the next page together
	         var grp = document.createElement('div'); grp.setAttribute('data-sdp-atom', ''); grp.className = 'sv-keep';
	         var ol2 = document.createElement('ol'); ol2.className = 'requirements-list'; ol2.setAttribute('start', String(lis.length - 1));
	         ol2.appendChild(lis[lis.length - 2]); ol2.appendChild(lis[lis.length - 1]);
	         ol.parentNode.insertBefore(grp, ol.nextSibling); grp.appendChild(ol2);
	         while (grp.nextSibling) grp.appendChild(grp.nextSibling);
	       }
	       SD_WM.layout(root, { fill: 0.99 });
	       // the footer (not the whole block) sits at the bottom of the last page
	       var g = root.querySelector('.sv-keep'), f = g && g.querySelector('.footer');
	       if (g && f && g.style.marginTop) { f.style.marginTop = g.style.marginTop; g.style.marginTop = ''; }
	     }
	     document.documentElement.setAttribute('data-sdp-ready', '1');
	     if (!window.__SDP_NO_PRINT) setTimeout(function () { window.print(); }, 60);
	   }
	   if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
	 })();
	 <\/script>
	 </body>
	 </html>
	 `;

 printWindow.document.write(printContent);
 printWindow.document.close();
}
