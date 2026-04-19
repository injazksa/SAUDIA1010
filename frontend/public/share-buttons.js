/**
 * 📤 Share Buttons Widget — Saudia Visa Jordan
 * يُضاف تلقائياً لأي صفحة فيها عنصر <div data-share-buttons></div>
 * آمن ضد XSS: يستخدم encodeURIComponent لكل المعاملات
 */
(function () {
  'use strict';

  function buildShareButtons() {
    const containers = document.querySelectorAll('[data-share-buttons]');
    if (!containers.length) return;

    // قراءة البيانات الآمنة من الصفحة (لا نثق بـ URL مباشرة)
    const url = encodeURIComponent(window.location.href);
    const titleElement = document.querySelector('h1, title');
    const rawTitle = titleElement ? titleElement.textContent.trim() : document.title;
    const title = encodeURIComponent(rawTitle);
    const desc = encodeURIComponent(
      (document.querySelector('meta[name="description"]')?.content || '').slice(0, 160)
    );

    const shares = [
      {
        name: 'WhatsApp', icon: 'fa-whatsapp', brand: 'fab',
        color: 'bg-green-500 hover:bg-green-600',
        href: `https://wa.me/?text=${title}%20${url}`
      },
      {
        name: 'Facebook', icon: 'fa-facebook-f', brand: 'fab',
        color: 'bg-[#1877F2] hover:bg-[#156bd8]',
        href: `https://www.facebook.com/sharer/sharer.php?u=${url}`
      },
      {
        name: 'X (Twitter)', icon: 'fa-x-twitter', brand: 'fab',
        color: 'bg-black hover:bg-gray-800',
        href: `https://twitter.com/intent/tweet?text=${title}&url=${url}`
      },
      {
        name: 'Telegram', icon: 'fa-telegram', brand: 'fab',
        color: 'bg-[#0088cc] hover:bg-[#0076b3]',
        href: `https://t.me/share/url?url=${url}&text=${title}`
      },
      {
        name: 'LinkedIn', icon: 'fa-linkedin-in', brand: 'fab',
        color: 'bg-[#0a66c2] hover:bg-[#084a93]',
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      },
      {
        name: 'نسخ الرابط', icon: 'fa-link', brand: 'fas',
        color: 'bg-navy hover:bg-navy-dark',
        action: 'copy'
      }
    ];

    const html = `
      <div class="bg-white rounded-2xl border-2 border-gold/20 p-6 my-8">
        <div class="flex items-center gap-3 mb-4">
          <i class="fas fa-share-nodes text-gold text-xl"></i>
          <h3 class="text-lg font-bold text-navy">شارك المقال</h3>
        </div>
        <div class="flex flex-wrap gap-3" role="group" aria-label="أزرار المشاركة">
          ${shares.map((s, i) => s.action === 'copy'
            ? `<button type="button" data-share-copy class="inline-flex items-center gap-2 ${s.color} text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-sm" aria-label="نسخ رابط المقال" data-testid="share-copy-btn">
                 <i class="${s.brand} ${s.icon}"></i>
                 <span>${s.name}</span>
               </button>`
            : `<a href="${s.href}" target="_blank" rel="noopener noreferrer nofollow" class="inline-flex items-center gap-2 ${s.color} text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-sm" aria-label="شارك على ${s.name}" data-testid="share-${s.name.toLowerCase().replace(/\s/g,'-')}-btn">
                 <i class="${s.brand} ${s.icon}"></i>
                 <span>${s.name}</span>
               </a>`
          ).join('')}
        </div>
      </div>
    `;

    containers.forEach((c) => {
      c.innerHTML = html;
    });

    // Handler آمن لزر "نسخ الرابط"
    document.querySelectorAll('[data-share-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          const originalHtml = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i><span>تم النسخ!</span>';
          setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
        } catch (err) {
          // fallback للمتصفحات القديمة
          const ta = document.createElement('textarea');
          ta.value = window.location.href;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (_) {}
          document.body.removeChild(ta);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildShareButtons);
  } else {
    buildShareButtons();
  }
})();
