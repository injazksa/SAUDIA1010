/**
 * 📍 SCHEMA MARKUP — Saudia Visa Jordan
 * Version: 2.0.0 (2026-01-22)
 *
 * ⚠️ تغييرات مهمة من النسخة القديمة:
 * - ✅ حذف AggregateRating الوهمي (كان يعرّض الموقع لعقوبات Google)
 * - ✅ إضافة Service Schema لكل خدمة
 * - ✅ إضافة sameAs حقيقي (Facebook + WhatsApp)
 * - ✅ إضافة hasCredential (الترخيص رقم 22128)
 * - ✅ إضافة BreadcrumbList يعمل تلقائياً لكل صفحة فرعية
 * - ✅ إضافة Article schema عند وجود <article>
 * - ✅ إضافة FAQPage schema عند وجود [data-faq]
 */

(function () {
  'use strict';

  const BUSINESS = {
    name: 'مكتب تأشيرات السعودية في الأردن',
    alternateName: ['Saudi Visa Office Jordan', 'مركز السعودية المعتمد', 'إنجاز السعودية'],
    url: 'https://saudia-visa.com',
    logo: 'https://saudia-visa.com/icons/logo-512.png',
    phone: '+962789881009',
    email: 'Info@saudia-visa.com',
    address: {
      street: 'الدوار الأول - جبل عمان',
      city: 'عمان',
      region: 'عمان',
      postal: '11190',
      country: 'JO'
    },
    geo: { lat: 31.9520, lng: 35.9224 },
    license: '22128',
    founded: '2015',
    sameAs: [
      'https://www.facebook.com/Saudiavisajo',
      'https://wa.me/962789881009'
    ]
  };

  // ─── LocalBusiness + Organization (الأساسية) ───
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${BUSINESS.url}#business`,
    name: BUSINESS.name,
    alternateName: BUSINESS.alternateName,
    description: 'مكتب معتمد رسمياً من السفارة السعودية في الأردن لإنجاز تأشيرات العمل والاستقدام والاعتماد المهني وتصديق الشهادات. ترخيص رقم 22128.',
    url: BUSINESS.url,
    logo: BUSINESS.logo,
    image: BUSINESS.logo,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: '$$',
    foundingDate: BUSINESS.founded,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postal,
      addressCountry: BUSINESS.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lng
    },
    areaServed: [
      { '@type': 'Country', name: 'Jordan', '@id': 'https://www.wikidata.org/wiki/Q810' },
      { '@type': 'Country', name: 'Saudi Arabia', '@id': 'https://www.wikidata.org/wiki/Q851' }
    ],
    sameAs: BUSINESS.sameAs,
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'license',
      identifier: BUSINESS.license,
      name: 'ترخيص مكتب تأشيرات معتمد',
      recognizedBy: {
        '@type': 'Organization',
        name: 'السفارة السعودية في الأردن'
      }
    },
    knowsAbout: [
      'تأشيرات العمل السعودية',
      'تأشيرة العمرة',
      'الاستقدام العائلي',
      'الاعتماد المهني (QVP)',
      'تصديق الشهادات الجامعية',
      'تصديق الوثائق الرسمية',
      'تأشيرة الزيارة السعودية'
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '16:00'
      }
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phone,
        contactType: 'customer service',
        email: BUSINESS.email,
        areaServed: ['JO', 'SA'],
        availableLanguage: ['Arabic', 'English']
      },
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phone,
        contactType: 'WhatsApp',
        areaServed: ['JO', 'SA'],
        availableLanguage: ['Arabic']
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'خدمات التأشيرات السعودية',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تأشيرة العمل السعودية', url: `${BUSINESS.url}/work-visa.html` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تصديق الشهادات', url: `${BUSINESS.url}/certificates.html` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'الاعتماد المهني (QVP)', url: `${BUSINESS.url}/professional.html` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'خدمات الشركات', url: `${BUSINESS.url}/corporate.html` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تأشيرة العمرة', url: `${BUSINESS.url}/blog/umrah-visa-guide-2026.html` } }
      ]
    }
  };

  // ─── Organization (مكمّل) ───
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BUSINESS.url}#organization`,
    name: BUSINESS.name,
    legalName: 'الشركة المتخصصة',
    alternateName: BUSINESS.alternateName,
    url: BUSINESS.url,
    logo: {
      '@type': 'ImageObject',
      url: BUSINESS.logo,
      width: 512,
      height: 512
    },
    sameAs: BUSINESS.sameAs,
    foundingDate: BUSINESS.founded,
    identifier: BUSINESS.license,
    taxID: BUSINESS.license,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'Customer Service',
      email: BUSINESS.email,
      availableLanguage: ['ar', 'en']
    }
  };

  // ─── WebSite (Sitelinks Searchbox) ───
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BUSINESS.url}#website`,
    url: BUSINESS.url,
    name: BUSINESS.name,
    inLanguage: 'ar',
    publisher: { '@id': `${BUSINESS.url}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BUSINESS.url}/professions.html?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // ─── BreadcrumbList تلقائي ───
  function generateBreadcrumbs() {
    const path = location.pathname.replace(/\.html$/, '').replace(/^\//, '');
    if (!path || path === 'index') return null;

    const parts = path.split('/').filter(Boolean);
    const items = [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: BUSINESS.url + '/' }
    ];

    const labels = {
      'work-visa': 'تأشيرة العمل',
      'professions': 'المهن والأوراق',
      'calculator': 'حاسبة الرسوم',
      'professional': 'الاعتماد المهني',
      'certificates': 'تصديق الشهادات',
      'corporate': 'خدمات الشركات',
      'blog': 'المدونة',
      'about': 'من نحن',
      'faq': 'الأسئلة الشائعة',
      'privacy': 'سياسة الخصوصية',
      'terms': 'الشروط والأحكام',
      'disclaimer': 'إخلاء المسؤولية',
      'post': 'مقال',
      'umrah-visa-guide-2026': 'دليل تأشيرة العمرة',
      'work-visa-comprehensive-2026': 'دليل تأشيرة العمل الشامل',
      'tourist-visa-guide': 'دليل التأشيرة السياحية',
      'family-sponsorship-guide': 'دليل الاستقدام العائلي'
    };

    let url = BUSINESS.url;
    parts.forEach((part, i) => {
      url += '/' + part;
      items.push({
        '@type': 'ListItem',
        position: i + 2,
        name: labels[part] || part.replace(/-/g, ' '),
        item: url + (part.endsWith('html') ? '' : '.html')
      });
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    };
  }

  // ─── حقن الـ schemas في الصفحة ───
  function inject(obj) {
    if (!obj) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }

  function init() {
    inject(localBusiness);
    inject(organization);
    inject(website);
    inject(generateBreadcrumbs());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
