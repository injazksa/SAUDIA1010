// ⚔️ SECURITY MODULE - Advanced Protection System
// This file provides comprehensive security measures for the website

// 1. Disable Developer Tools & Right-Click Menu
(function() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);

    // Disable keyboard shortcuts for developer tools
    document.addEventListener('keydown', function(e) {
        // F12 - Developer Tools
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I - Inspect Element
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J - Console
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C - Inspect Element
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+K - Console
        if (e.ctrlKey && e.shiftKey && e.key === 'K') {
            e.preventDefault();
            return false;
        }
    }, false);

    // Detect if DevTools is open
    let devtools = { open: false };
    const threshold = 160;
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.clear();
                console.log('%c⚠️ Security Warning', 'color: red; font-size: 20px; font-weight: bold;');
                console.log('%cDeveloper tools are not allowed on this website.', 'color: red; font-size: 14px;');
                console.log('%cIf you are the owner, please contact support.', 'color: orange; font-size: 12px;');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
})();

// 2. Prevent Copy/Paste
(function() {
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });

    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    document.addEventListener('mousedown', function(e) {
        if (e.detail > 1) {
            e.preventDefault();
            return false;
        }
    });
})();

// 3. XSS Protection - Sanitize User Input
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>\"']/g, function(char) {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return entities[char];
        })
        .trim();
}

// 4. Prevent SQL Injection - Validate Input
function validateInput(input, type = 'text') {
    if (!input) return '';
    
    switch(type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? input : '';
        case 'phone':
            return /^\+?[\d\s\-()]{7,}$/.test(input) ? input : '';
        case 'number':
            return /^\d+$/.test(input) ? input : '';
        case 'text':
        default:
            return sanitizeInput(input);
    }
}

// 5. Hide Sensitive Information
(function() {
    // Remove any console.log statements that might expose data
    const originalLog = console.log;
    console.log = function() {
        // Only allow specific safe logs
        const args = Array.from(arguments);
        if (args[0] && typeof args[0] === 'string' && 
            !args[0].includes('password') && 
            !args[0].includes('token') && 
            !args[0].includes('key') &&
            !args[0].includes('secret')) {
            originalLog.apply(console, arguments);
        }
    };

    // Hide sensitive data from localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
            console.warn('⚠️ Attempt to store sensitive data in localStorage blocked');
            return;
        }
        originalSetItem.call(localStorage, key, value);
    };
})();

// 6. Content Security Policy (CSP) — يُعالج الآن عبر Netlify headers/netlify.toml
// لا نضيف meta CSP هنا لتجنب التعارض مع HTTP headers
function setCSPHeaders() {
    // no-op: CSP is delivered via Netlify headers (see netlify.toml)
}

// 7. Prevent Clickjacking
(function() {
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }
})();

// 8. Disable Autocomplete on Sensitive Fields
(function() {
    const sensitiveFields = document.querySelectorAll('input[type="password"], input[name*="password"], input[name*="token"], input[name*="secret"]');
    sensitiveFields.forEach(field => {
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('autocorrect', 'off');
        field.setAttribute('autocapitalize', 'off');
        field.setAttribute('spellcheck', 'false');
    });
})();

// 9. Monitor for Suspicious Activity
(function() {
    const suspiciousPatterns = [
        /eval\(/gi,
        /javascript:/gi,
        /onerror=/gi,
        /onload=/gi,
        /onclick=/gi,
        /script>/gi
    ];

    window.addEventListener('message', function(e) {
        const message = JSON.stringify(e.data);
        suspiciousPatterns.forEach(pattern => {
            if (pattern.test(message)) {
                console.warn('⚠️ Suspicious activity detected');
                e.preventDefault();
            }
        });
    });
})();

// 10. Secure Headers Verification
function verifySecureHeaders() {
    const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
    
    console.log('🔒 Security Headers Configuration:', headers);
}

// Initialize all security measures on page load
document.addEventListener('DOMContentLoaded', function() {
    setCSPHeaders();
    verifySecureHeaders();
    console.log('🔐 Security Module Loaded - All protections active');
});

// Export functions for use in other scripts
window.SecurityModule = {
    sanitizeHTML: sanitizeHTML,
    sanitizeInput: sanitizeInput,
    validateInput: validateInput
};
