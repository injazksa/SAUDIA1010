// Modern Saudi Visa Website - JavaScript

// ======================
// Security: HTML Sanitization Helper
// ======================
function sanitizeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ======================
    // Mobile Menu Toggle
    // ======================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // ======================
    // FAQ Accordion
    // ======================
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('i');
            
            // Close all other items
            document.querySelectorAll('.faq-answer').forEach(item => {
                if (item !== answer) {
                    item.classList.remove('active');
                    item.classList.add('hidden');
                }
            });
            
            document.querySelectorAll('.faq-question i').forEach(i => {
                if (i !== icon) {
                    i.classList.remove('rotate-180');
                }
            });
            
            // Toggle current item
            answer.classList.toggle('hidden');
            answer.classList.toggle('active');
            icon.classList.toggle('rotate-180');
        });
    });
    
    // ======================
    // Smooth Scroll for Anchor Links
    // ======================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // ======================
    // Load Blog Posts (Homepage)
    // ======================
    const blogPostsContainer = document.getElementById('blog-posts');
    
    if (blogPostsContainer) {
        fetch('blog/posts.json')
            .then(response => response.json())
            .then(posts => {
                blogPostsContainer.innerHTML = '';
                
                // Show only first 3 posts on homepage
                const postsToShow = posts.slice(0, 3);
                
                postsToShow.forEach(post => {
                    const postCard = createBlogCard(post);
                    blogPostsContainer.innerHTML += postCard;
                });
            })
            .catch(error => {
                console.error('Error loading blog posts:', error);
                blogPostsContainer.innerHTML = `
                    <div class="col-span-full text-center text-gray-500 py-12">
                        <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                        <p>عذراً، حدث خطأ في تحميل المقالات</p>
                    </div>
                `;
            });
    }
    
    // ======================
    // Navbar Scroll Effect
    // ======================
    const navbar = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
        
        lastScroll = currentScroll;
    });
    
    // ======================
    // Animate Elements on Scroll
    // ======================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe service cards and other elements
    document.querySelectorAll('.service-card, .review-card, .blog-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ======================
    // Back to Top Button
    // ======================
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'fixed bottom-24 left-6 z-40 w-12 h-12 bg-navy hover:bg-navy-dark text-white rounded-full shadow-2xl opacity-0 pointer-events-none transition-all duration-300';
    backToTopBtn.setAttribute('aria-label', 'العودة للأعلى');
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'auto';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.pointerEvents = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
});

// ======================
// Helper Functions
// ======================

// Create Blog Card HTML (XSS-safe)
function createBlogCard(post) {
    const date = new Date(post.date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const safeSlug = sanitizeHTML(post.slug);
    const safeTitle = sanitizeHTML(post.title);
    const safeImage = sanitizeHTML(post.image || 'images/default-blog.webp');
    const safeAuthor = sanitizeHTML(post.author);
    const safeDesc = sanitizeHTML(post.description || post.excerpt || '');
    
    return `
        <article class="blog-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gold/30 transition-all" data-testid="blog-post-${safeSlug}">
            <div class="overflow-hidden">
                <img src="${safeImage}" 
                     alt="${safeTitle}" 
                     class="w-full h-48 object-cover">
            </div>
            <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span class="flex items-center gap-1">
                        <i class="far fa-calendar"></i>
                        ${date}
                    </span>
                    ${post.author ? `
                    <span class="flex items-center gap-1">
                        <i class="far fa-user"></i>
                        ${safeAuthor}
                    </span>
                    ` : ''}
                </div>
                <h3 class="text-xl font-bold text-navy mb-3 line-clamp-2 hover:text-gold transition-colors">
                    ${safeTitle}
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    ${safeDesc}
                </p>
                <a href="post.html?id=${encodeURIComponent(post.slug)}" 
                   class="inline-flex items-center text-gold font-semibold hover:gap-3 transition-all"
                   data-testid="blog-read-more-${safeSlug}">
                    اقرأ المزيد
                    <i class="fas fa-arrow-left mr-2"></i>
                </a>
            </div>
        </article>
    `;
}

// Format Date in Arabic
function formatDateArabic(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show Loading Spinner
function showLoader(container) {
    container.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="loader"></div>
        </div>
    `;
}

// Show Error Message (XSS-safe)
function showError(container, message) {
    const safeMessage = sanitizeHTML(message);
    container.innerHTML = `
        <div class="error-message text-center">
            <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
            <p>${safeMessage}</p>
        </div>
    `;
}

// Show Success Message (XSS-safe)
function showSuccess(container, message) {
    const safeMessage = sanitizeHTML(message);
    container.innerHTML = `
        <div class="success-message text-center">
            <i class="fas fa-check-circle text-3xl mb-3"></i>
            <p>${safeMessage}</p>
        </div>
    `;
}

// Debounce Function
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

// Search Highlight (XSS-safe)
function highlightText(text, query) {
    if (!query) return sanitizeHTML(text);
    const safeText = sanitizeHTML(text);
    const safeQuery = escapeRegExp(sanitizeHTML(query));
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    return safeText.replace(regex, '<span class="search-highlight">$1</span>');
}

// Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('تم النسخ بنجاح');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('تم النسخ بنجاح');
    }
}

// Show Toast Notification (XSS-safe)
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-navy text-white px-6 py-3 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full';
    const safeMessage = sanitizeHTML(message);
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-gold"></i>
            <span>${safeMessage}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Print Function for Profession Documents (XSS-safe)
function printProfessionDocument(professionCode, professionName, requirements) {
    const printWindow = window.open('', '_blank');
    
    const safeName = sanitizeHTML(professionName);
    const safeCode = sanitizeHTML(professionCode);
    const safeRequirements = requirements.map(req => sanitizeHTML(req));
    
    const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>الأوراق المطلوبة - ${safeName}</title>
            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    direction: rtl;
                    text-align: right;
                    line-height: 1.8;
                    color: #333;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #C9A26A;
                }
                .print-header h1 {
                    color: #1B2A41;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                .print-header .subtitle {
                    color: #C9A26A;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .office-info {
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .document-title {
                    background: #1B2A41;
                    color: white;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-size: 20px;
                    font-weight: bold;
                    text-align: center;
                }
                .profession-info {
                    background: #f9fafb;
                    padding: 15px;
                    margin: 20px 0;
                    border-right: 4px solid #C9A26A;
                    border-radius: 4px;
                }
                .requirements-list {
                    margin: 20px 0;
                }
                .requirements-list li {
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                    list-style-position: inside;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #C9A26A;
                    text-align: center;
                    color: #64748b;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>مكتب تأشيرات السعودية في الأردن</h1>
                <div class="subtitle">المركز المعتمد من السفارة السعودية</div>
                <div class="office-info">
                    <div>العنوان: الدوار الأول - جبل عمان، الأردن</div>
                    <div>الهاتف / واتساب: 0789881009</div>
                    <div>البريد الإلكتروني: Visa@saudia-visa.com</div>
                    <div>الموقع الإلكتروني: www.saudia-visa.com</div>
                </div>
            </div>
            
            <div class="document-title">
                الأوراق المطلوبة لتأشيرة العمل السعودية
            </div>
            
            <div class="profession-info">
                <strong>المهنة:</strong> ${safeName}<br>
                <strong>رمز المهنة:</strong> ${safeCode}<br>
                <strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString('ar-SA')}
            </div>
            
            <h2 style="color: #1B2A41; margin-top: 30px;">الأوراق والمستندات المطلوبة:</h2>
            <ol class="requirements-list">
                ${safeRequirements.map(req => `<li>${req}</li>`).join('')}
            </ol>
            
            <div class="footer">
                <p><strong>ملاحظة:</strong> قد تختلف المتطلبات حسب السفارة والحالة الفردية. يرجى التواصل معنا للحصول على معلومات دقيقة ومحدثة.</p>
                <p style="margin-top: 10px;">© 2025 مكتب تأشيرات السعودية في الأردن - جميع الحقوق محفوظة</p>
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

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createBlogCard,
        formatDateArabic,
        showLoader,
        showError,
        showSuccess,
        debounce,
        highlightText,
        copyToClipboard,
        showToast,
        printProfessionDocument
    };
}
