// ⚡ Share Buttons - Add sharing functionality to blog posts
// أزرار المشاركة - إضافة خاصية المشاركة لمقالات المدونة

document.addEventListener('DOMContentLoaded', () => {
    addShareButtons();
});

function addShareButtons() {
    // Find all blog articles
    const articles = document.querySelectorAll('article, [data-article], .blog-post, .article-content');
    
    articles.forEach(article => {
        // Get article title and URL
        const titleElement = article.querySelector('h1, h2, .title, .article-title');
        const title = titleElement ? titleElement.textContent.trim() : document.title;
        const url = window.location.href;
        
        // Create share container
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-buttons-container';
        shareContainer.style.cssText = `
            display: flex;
            gap: 12px;
            margin: 20px 0;
            padding: 16px;
            background: #f5f5f5;
            border-radius: 8px;
            align-items: center;
            flex-wrap: wrap;
        `;
        
        // Share label
        const label = document.createElement('span');
        label.textContent = '📤 شارك هذا المقال:';
        label.style.cssText = `
            font-weight: bold;
            color: #1B2A41;
            margin-right: 12px;
        `;
        shareContainer.appendChild(label);
        
        // Facebook share
        const fbBtn = createShareButton(
            'Facebook',
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '#1877F2',
            'fab fa-facebook-f'
        );
        shareContainer.appendChild(fbBtn);
        
        // Twitter share
        const twitterBtn = createShareButton(
            'Twitter',
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            '#1DA1F2',
            'fab fa-twitter'
        );
        shareContainer.appendChild(twitterBtn);
        
        // WhatsApp share
        const waBtn = createShareButton(
            'WhatsApp',
            `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
            '#25D366',
            'fab fa-whatsapp'
        );
        shareContainer.appendChild(waBtn);
        
        // LinkedIn share
        const linkedinBtn = createShareButton(
            'LinkedIn',
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '#0A66C2',
            'fab fa-linkedin-in'
        );
        shareContainer.appendChild(linkedinBtn);
        
        // Email share
        const emailBtn = createShareButton(
            'Email',
            `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
            '#EA4335',
            'fas fa-envelope'
        );
        shareContainer.appendChild(emailBtn);
        
        // Copy link button
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-link"></i>';
        copyBtn.title = 'نسخ الرابط';
        copyBtn.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: #666;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 16px;
        `;
        
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.background = '#555';
            copyBtn.style.transform = 'scale(1.1)';
        });
        
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.background = '#666';
            copyBtn.style.transform = 'scale(1)';
        });
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(url).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.style.background = '#4CAF50';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-link"></i>';
                    copyBtn.style.background = '#666';
                }, 2000);
            });
        });
        
        shareContainer.appendChild(copyBtn);
        
        // Insert share buttons after article title or at the beginning
        if (titleElement) {
            titleElement.parentElement.insertBefore(shareContainer, titleElement.nextSibling);
        } else {
            article.insertBefore(shareContainer, article.firstChild);
        }
    });
}

function createShareButton(name, url, color, icon) {
    const btn = document.createElement('a');
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.title = `شارك على ${name}`;
    btn.innerHTML = `<i class="${icon}"></i>`;
    btn.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${color};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: all 0.3s ease;
        font-size: 16px;
    `;
    
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.15)';
        btn.style.boxShadow = `0 4px 12px ${color}40`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
    });
    
    return btn;
}
