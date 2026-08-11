/*
 * بيانات منظمة مشتركة لموقع Saudia Visa Jordan.
 * تُنشئ فقط معلومات تستند إلى بيانات الاتصال والخدمات الظاهرة بالموقع.
 */
(function () {
  'use strict';

  const BASE_URL = 'https://saudia-visa.com';
  const BUSINESS_ID = BASE_URL + '/#business';
  const ORGANIZATION_ID = BASE_URL + '/#organization';
  const WEBSITE_ID = BASE_URL + '/#website';
  const business = {
    name: 'مكتب تأشيرات السعودية في الأردن',
    alternateName: ['Saudia Visa Jordan', 'إنجاز السعودية'],
    url: BASE_URL + '/',
    logo: BASE_URL + '/icons/logo-512.png',
    image: BASE_URL + '/images/og-cover.png',
    telephone: '+962789881009',
    email: 'Info@saudia-visa.com',
    address: {
      streetAddress: 'الدوار الأول - جبل عمان',
      addressLocality: 'عمان',
      addressRegion: 'عمان',
      postalCode: '11110',
      addressCountry: 'JO'
    },
    geo: { latitude: 31.9507, longitude: 35.9230 }
  };

  function inject(payload) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-site-schema', 'true');
    script.textContent = JSON.stringify(payload);
    document.head.appendChild(script);
  }

  function canonicalUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : window.location.href.split('#')[0];
  }

  function pageName() {
    const heading = document.querySelector('h1');
    if (heading && heading.textContent.trim()) return heading.textContent.trim();
    return document.title.trim();
  }

  function breadcrumbForCurrentPage(url) {
    const current = new URL(url);
    if (current.pathname === '/' || current.pathname === '/index.html') return null;
    return {
      '@type': 'BreadcrumbList',
      '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: BASE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: pageName(), item: url }
      ]
    };
  }

  function siteGraph(currentUrl) {
    const graph = [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: business.name,
        alternateName: business.alternateName,
        url: business.url,
        logo: { '@type': 'ImageObject', url: business.logo },
        sameAs: ['https://www.facebook.com/Saudiavisajo'],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: business.telephone,
          email: business.email,
          contactType: 'customer service',
          availableLanguage: ['ar', 'en']
        }
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: business.url,
        name: business.name,
        inLanguage: 'ar-JO',
        publisher: { '@id': ORGANIZATION_ID }
      }
    ];

    const breadcrumb = breadcrumbForCurrentPage(currentUrl);
    if (breadcrumb) graph.push(breadcrumb);

    if (new URL(currentUrl).pathname === '/' || new URL(currentUrl).pathname === '/index.html') {
      graph.push({
        '@type': ['ProfessionalService', 'LocalBusiness'],
        '@id': BUSINESS_ID,
        name: business.name,
        alternateName: business.alternateName,
        url: business.url,
        logo: business.logo,
        image: business.image,
        description: 'خدمات تأشيرات العمل السعودية والتصديقات والاعتماد المهني من الأردن.',
        telephone: business.telephone,
        email: business.email,
        address: { '@type': 'PostalAddress', ...business.address },
        geo: { '@type': 'GeoCoordinates', ...business.geo },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '09:00',
          closes: '16:00'
        },
        areaServed: { '@type': 'Country', name: 'Jordan' },
        parentOrganization: { '@id': ORGANIZATION_ID },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'خدمات المكتب',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تأشيرات العمل السعودية', url: BASE_URL + '/work-visa.html' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'تصديق الشهادات', url: BASE_URL + '/certificates.html' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'الاعتماد المهني', url: BASE_URL + '/professional.html' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'خدمات الشركات', url: BASE_URL + '/corporate.html' } }
          ]
        }
      });
    }
    return graph;
  }

  function init() {
    if (document.querySelector('script[data-site-schema="true"]')) return;
    const currentUrl = canonicalUrl();
    inject({ '@context': 'https://schema.org', '@graph': siteGraph(currentUrl) });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
