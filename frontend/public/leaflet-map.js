// ⚡ Leaflet Map - Replace Google Maps with OpenStreetMap
// خريطة Leaflet - استبدال جوجل ماب بـ OpenStreetMap
// Initialize Leaflet map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
});

function initializeMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded yet');
        return;
    }
    
    // ⚡ PRECISE COORDINATES — نقطة الدوار الأول الرسمية على OpenStreetMap
    // (way/151463243 — بجانب سوبر ماركت عيسى / أرامكس)
    const lat = 31.9507;   // First Circle official OSM coordinate
    const lng = 35.9230;   // First Circle official OSM coordinate
    
    try {
        // Create map with optimized settings
        const map = L.map('map', {
            center: [lat, lng],
            zoom: 17,  // Higher zoom for precise location
            scrollWheelZoom: true,
            zoomControl: true,
            attributionControl: true
        });
        
        // Add OpenStreetMap tiles with better detail
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 2,
            opacity: 0.95
        }).addTo(map);
        
        // Add a circle to highlight the exact location
        L.circle([lat, lng], {
            color: '#C9A35E',
            fillColor: '#C9A35E',
            fillOpacity: 0.2,
            weight: 2,
            radius: 50  // 50 meters radius
        }).addTo(map);
        
        // Add main marker for the office
        const marker = L.marker([lat, lng], {
            title: 'مكتب تأشيرات السعودية - الدوار الأول، جبل عمّان'
        }).addTo(map);
        
        // Create detailed popup with location info
        const popupContent = `
            <div style="text-align: right; font-family: Arial, sans-serif; direction: rtl; min-width: 250px;">
                <h3 style="margin: 0 0 15px 0; color: #1B2A41; font-weight: bold; font-size: 16px; border-bottom: 2px solid #C9A35E; padding-bottom: 10px;">
                    🏢 مكتب تأشيرات السعودية
                </h3>
                
                <div style="margin: 12px 0; color: #333; font-size: 14px;">
                    <p style="margin: 8px 0; font-weight: bold; color: #C9A35E;">
                        📍 الموقع الدقيق:
                    </p>
                    <p style="margin: 5px 0; color: #555;">
                        الدوار الأول - جبل عمّان<br/>
                        عمّان، الأردن
                    </p>
                </div>
                
                <div style="margin: 12px 0; color: #333; font-size: 14px;">
                    <p style="margin: 8px 0; font-weight: bold; color: #C9A35E;">
                        📞 جهات الاتصال:
                    </p>
                    <p style="margin: 5px 0; color: #555;">
                        <strong>الهاتف:</strong> 0789881009<br/>
                        <strong>الواتساب:</strong> 0789881009<br/>
                        <span style="font-size: 11px; color: #999; margin-top: 5px; display: block;">
                            <em>مفتاح الأردن: +962</em>
                        </span>
                    </p>
                </div>
                
                <div style="margin: 12px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; color: #666;">
                    <strong>الإحداثيات:</strong><br/>
                    خط العرض: 31.9507°<br/>
                    خط الطول: 35.9230°
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'saudi-visa-popup'
        }).openPopup();
        
        // Add additional markers for nearby landmarks
        const landmarks = [
            {
                lat: 31.9518,
                lng: 35.9225,
                name: 'الدوار الأول',
                icon: '🔄'
            }
        ];
        
        landmarks.forEach(landmark => {
            const landmarkMarker = L.marker([landmark.lat, landmark.lng], {
                title: landmark.name,
                opacity: 0.6
            }).addTo(map);
            
            landmarkMarker.bindPopup(`<div style="text-align: center; font-family: Arial;">${landmark.icon} ${landmark.name}</div>`);
        });
        
        // Responsive map
        window.addEventListener('resize', () => {
            map.invalidateSize();
        });
        
        // Add custom CSS for popup
        const style = document.createElement('style');
        style.textContent = `
            .saudi-visa-popup .leaflet-popup-content {
                padding: 12px !important;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .leaflet-popup-content-wrapper {
                border-radius: 8px;
                background: white;
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Leaflet map initialized successfully at First Circle, Jabal Amman');
    } catch (error) {
        console.error('Error initializing Leaflet map:', error);
    }
}

// Preload Leaflet CSS and JS
function preloadLeaflet() {
    // Check if Leaflet is already loaded
    if (window.L) return;
    
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    
    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
        console.log('✅ Leaflet library loaded');
        // Reinitialize map if it wasn't initialized yet
        if (!window.mapInitialized) {
            initializeMap();
            window.mapInitialized = true;
        }
    };
    document.head.appendChild(script);
}

// Preload Leaflet when page starts loading
preloadLeaflet();
