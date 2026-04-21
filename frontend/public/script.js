// Modern Saudi Visa Website - JavaScript

// Global functions for modal
window.openReviewModal = function() {
    const modal = document.getElementById('review-modal');
    const content = document.getElementById('modal-content');
    const formContainer = document.getElementById('review-form-container');
    const successContainer = document.getElementById('review-success-container');
    
    if (modal) {
        // Reset state
        if (formContainer) formContainer.classList.remove('hidden');
        if (successContainer) successContainer.classList.add('hidden');
        
        // Reset stars to 5
        const starsInput = document.getElementById('stars-input');
        const stars = document.querySelectorAll('#star-rating i');
        if (starsInput && stars.length > 0) {
            starsInput.value = "5";
            stars.forEach(s => {
                s.classList.remove('text-gray-200');
                s.classList.add('text-gold');
            });
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            if (content) {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        }, 10);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
};

window.closeReviewModal = function() {
    const modal = document.getElementById('review-modal');
    const content = document.getElementById('modal-content');
    if (modal) {
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            // Re-enable body scroll
            document.body.style.overflow = '';
        }, 300);
    }
};

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
            
            answer.classList.toggle('hidden');
            answer.classList.toggle('active');
            icon.classList.toggle('rotate-180');
        });
    });
    
    // ======================
    // Smooth Scroll
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
    // Load Blog Posts
    // ======================
    const blogPostsContainer = document.getElementById('blog-posts');
    if (blogPostsContainer) {
        fetch('blog/posts.json')
            .then(response => response.json())
            .then(posts => {
                blogPostsContainer.innerHTML = '';
                const postsToShow = posts.slice(0, 3);
                postsToShow.forEach(post => {
                    blogPostsContainer.innerHTML += createBlogCard(post);
                });
            })
            .catch(error => console.error('Error loading blog posts:', error));
    }
    
    // ======================
    // Navbar Scroll Effect
    // ======================
    const navbar = document.querySelector('header');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                navbar.classList.add('shadow-lg');
            } else {
                navbar.classList.remove('shadow-lg');
            }
        });
    }

    // Initialize Reviews
    initReviews();
});

// ======================
// Real-time Reviews System
// ======================

function initReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    // Load reviews from JSON
    fetch('reviews.json')
        .then(response => response.json())
        .then(reviews => {
            const localReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
            const allReviews = [...localReviews, ...reviews];
            displayReviews(allReviews);
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            const localReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
            if (localReviews.length > 0) displayReviews(localReviews);
        });

    // Star Rating Logic
    const stars = document.querySelectorAll('#star-rating i');
    const starsInput = document.getElementById('stars-input');
    
    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                updateStars(value);
            });
        });
    }

    function updateStars(value) {
        if (starsInput) starsInput.value = value;
        stars.forEach(s => {
            if (parseInt(s.getAttribute('data-value')) <= parseInt(value)) {
                s.classList.remove('text-gray-200');
                s.classList.add('text-gold');
            } else {
                s.classList.remove('text-gold');
                s.classList.add('text-gray-200');
            }
        });
    }

    // Set default to 5 stars on init
    updateStars(5);

    // Form Submission
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const newReview = {
                id: Date.now(),
                name: formData.get('name'),
                stars: parseInt(formData.get('stars')),
                comment: formData.get('comment') || "خدمة ممتازة وسريعة، أنصح بالتعامل معهم.",
                date: new Date().toISOString().split('T')[0]
            };

            const localReviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
            localReviews.unshift(newReview);
            localStorage.setItem('user_reviews', JSON.stringify(localReviews));

            // Show Success State
            const formContainer = document.getElementById('review-form-container');
            const successContainer = document.getElementById('review-success-container');
            if (formContainer && successContainer) {
                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
            }
            
            // Refresh display after short delay
            setTimeout(() => {
                fetch('reviews.json')
                    .then(r => r.json())
                    .then(orig => displayReviews([...localReviews, ...orig]));
            }, 500);
        });
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-12">كن أول من يشارك تجربته معنا!</div>';
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gold/30 transition-all shadow-sm hover:shadow-lg">
            <div class="flex text-gold text-lg mb-4">
                ${Array(5).fill(0).map((_, i) => `
                    <i class="${i < review.stars ? 'fas' : 'far'} fa-star"></i>
                `).join('')}
            </div>
            <p class="text-gray-700 mb-6 leading-relaxed italic">
                "${review.comment}"
            </p>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                    <div class="font-bold text-navy">${review.name}</div>
                    <div class="text-sm text-gray-500">رأي موثق</div>
                </div>
                <div class="text-xs text-gray-400">${formatRelativeDate(review.date)}</div>
            </div>
        </div>
    `).join('');
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffDays / 30)} أشهر`;
}

function createBlogCard(post) {
    const date = new Date(post.date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <article class="blog-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gold/30 transition-all">
            <div class="overflow-hidden">
                <img src="${post.image || 'images/default-blog.webp'}" 
                     alt="${post.title}" 
                     class="w-full h-48 object-cover">
            </div>
            <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span class="flex items-center gap-1">
                        <i class="far fa-calendar"></i>
                        ${date}
                    </span>
                </div>
                <h3 class="text-xl font-bold text-navy mb-3 line-clamp-2 hover:text-gold transition-colors">
                    ${post.title}
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    ${post.description || post.excerpt || ''}
                </p>
                <a href="post.html?id=${post.slug}" 
                   class="inline-flex items-center text-gold font-semibold hover:gap-3 transition-all">
                    اقرأ المزيد
                    <i class="fas fa-arrow-left mr-2"></i>
                </a>
            </div>
        </article>
    `;
}
