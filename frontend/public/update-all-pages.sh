#!/bin/bash

# ⚡ Update All HTML Pages with Performance Optimizations
# تحديث جميع صفحات HTML بتحسينات الأداء

PAGES=(
    "about.html"
    "services.html"
    "professions.html"
    "calculator.html"
    "professional.html"
    "certificates.html"
    "work-visa.html"
    "corporate.html"
    "blog.html"
    "post.html"
    "privacy.html"
    "terms.html"
    "disclaimer.html"
)

echo "⚡ Updating all pages with performance optimizations..."

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "📝 Processing: $page"
        
        # Check if the page already has the performance scripts
        if ! grep -q "instant-navigation.js" "$page"; then
            # Add smooth-transitions.css if not present
            if ! grep -q "smooth-transitions.css" "$page"; then
                sed -i '/<link rel="stylesheet" href="styles.css">/a \    \n    <!-- ⚡ Performance Optimization Styles -->\n    <link rel="stylesheet" href="smooth-transitions.css">' "$page"
                echo "  ✅ Added smooth-transitions.css"
            fi
            
            # Add performance scripts before closing body tag
            sed -i '/<\/body>/i \    \n    <!-- ⚡ ULTRA-FAST PERFORMANCE SCRIPTS -->\n    <!-- Performance Optimizer -->\n    <script src="performance-optimizer.js" defer><\/script>\n    \n    <!-- Pages Optimizer -->\n    <script src="pages-optimizer.js" defer><\/script>\n    \n    <!-- Instant Navigation System -->\n    <script src="instant-navigation.js" defer><\/script>' "$page"
            echo "  ✅ Added performance scripts"
        else
            echo "  ℹ️  Already optimized"
        fi
    else
        echo "⚠️  File not found: $page"
    fi
done

echo "✅ All pages updated successfully!"
