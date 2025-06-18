// Google Maps ve Places nesneleri
let map;
let placesService;
let autocompleteService;
let marker;
let parselPolygon;
let selectedCoordinates = null;

// DOM elemanları
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const suggestionsDiv = document.getElementById('suggestions');
const coordinateInfo = document.getElementById('coordinateInfo');
const selectedCoordsSpan = document.getElementById('selectedCoords');
const getTkgmBtn = document.getElementById('getTkgmBtn');
const tkgmResults = document.getElementById('tkgm-results');
const tkgmLoading = document.getElementById('tkgm-loading');
const parselInfo = document.getElementById('parsel-info');
const tkgmError = document.getElementById('tkgm-error');
const locationDetails = document.getElementById('location-details');
const parselDetails = document.getElementById('parsel-details');
const geometryDetails = document.getElementById('geometry-details');
const rawJsonData = document.getElementById('raw-json-data');

// TKGM API URLs
const PROXY_BASE_URL = 'http://localhost:5000/api/parsel';

// Harita başlatma
function initMap() {
    // Varsayılan konum (İstanbul)
    const defaultLocation = { lat: 41.0082, lng: 28.9784 };
    
    // Harita oluşturma
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultLocation,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: 'hybrid', // Hybrid view for better parcel visibility
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
            }
        ]
    });

    // Places servisi başlatma
    placesService = new google.maps.places.PlacesService(map);
    autocompleteService = new google.maps.places.AutocompleteService();

    // Event listeners
    setupEventListeners();
    
    // Harita tıklama event'i
    map.addListener('click', (event) => {
        handleMapClick(event.latLng);
    });
    
    console.log('Google Maps başlatıldı - Harita tıklama özelliği aktif');
}

// Event listener'ları ayarlama
function setupEventListeners() {
    // Arama butonu
    searchBtn.addEventListener('click', performSearch);
    
    // Temizle butonu
    clearBtn.addEventListener('click', clearAll);
    
    // TKGM butonu
    getTkgmBtn.addEventListener('click', getTkgmData);
    
    // Enter tuşu
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Otomatik tamamlama
    searchInput.addEventListener('input', handleAutoComplete);
    
    // Önerileri gizleme
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Harita tıklama işlemi
function handleMapClick(latLng) {
    const lat = latLng.lat();
    const lng = latLng.lng();
    
    selectedCoordinates = { lat, lng };
    
    // Koordinat bilgisini göster
    selectedCoordsSpan.textContent = `${lat.toFixed(8)}, ${lng.toFixed(8)}`;
    coordinateInfo.style.display = 'block';
    getTkgmBtn.style.display = 'inline-block';
    
    // Marker yerleştir
    if (marker) {
        marker.setMap(null);
    }
    
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: 'Seçilen Koordinat',
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"%3E%3Cpath fill="%23FF6B6B" d="M16 2C10.486 2 6 6.486 6 12c0 6.837 9.269 16.943 9.542 17.285a1 1 0 001.916 0C17.731 28.943 27 18.837 27 12c0-5.514-4.486-10-10-10zm0 14c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/%3E%3C/svg%3E',
            scaledSize: new google.maps.Size(32, 32)
        }
    });
    
    // Haritayı bu konuma odakla
    map.setCenter(latLng);
    if (map.getZoom() < 16) {
        map.setZoom(16);
    }
    
    console.log('Harita tıklandı:', lat, lng);
}

// Otomatik tamamlama işlemi
function handleAutoComplete() {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    autocompleteService.getPlacePredictions({
        input: query,
        language: 'tr',
        types: ['establishment', 'geocode']
    }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            showSuggestions(predictions.slice(0, 5));
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Önerileri gösterme
function showSuggestions(predictions) {
    suggestionsDiv.innerHTML = '';
    
    predictions.forEach(prediction => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = prediction.description;
        
        suggestionItem.addEventListener('click', () => {
            searchInput.value = prediction.description;
            suggestionsDiv.style.display = 'none';
            searchByPlaceId(prediction.place_id);
        });
        
        suggestionsDiv.appendChild(suggestionItem);
    });
    
    suggestionsDiv.style.display = 'block';
}

// Arama işlemi
function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Lütfen bir yer adı girin');
        return;
    }

    suggestionsDiv.style.display = 'none';

    // Text search kullanarak arama
    const request = {
        query: query,
        language: 'tr'
    };

    placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
            const place = results[0];
            const location = place.geometry.location;
            
            // Harita tıklama simülasyonu
            handleMapClick(location);
            
            // Arama inputunu temizle
            searchInput.value = '';
        } else {
            alert('Yer bulunamadı. Lütfen farklı bir arama terimi deneyin.');
        }
    });
}

// Place ID ile arama
function searchByPlaceId(placeId) {
    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry'],
        language: 'tr'
    };

    placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const location = place.geometry.location;
            handleMapClick(location);
        }
    });
}

// Tümü temizle
function clearAll() {
    // Input'u temizle
    searchInput.value = '';
    suggestionsDiv.style.display = 'none';
    
    // Koordinat bilgisini gizle
    coordinateInfo.style.display = 'none';
    selectedCoordinates = null;
    
    // TKGM sonuçlarını gizle
    tkgmResults.style.display = 'none';
    
    // Dinamik olarak eklenen bağımsız bölüm card'ını kaldır
    const bagimsizBolumCard = parselInfo.querySelector('.bagimsiz-bolum-card');
    if (bagimsizBolumCard) {
        bagimsizBolumCard.remove();
    }
    
    // Marker'ı kaldır
    if (marker) {
        marker.setMap(null);
        marker = null;
    }
    
    // Polygon'u kaldır
    if (parselPolygon) {
        parselPolygon.setMap(null);
        parselPolygon = null;
    }
    
    console.log('Tümü temizlendi');
}

// TKGM verilerini al
async function getTkgmData() {
    if (!selectedCoordinates) {
        alert('Önce haritadan bir nokta seçin');
        return;
    }
    
    const { lat, lng } = selectedCoordinates;
    
    // UI'ı güncelle
    showTkgmLoading();
    
    try {
        // 1. Koordinatlardan temel parsel bilgilerini al
        const coordinateUrl = `${PROXY_BASE_URL}/koordinat/${lat}/${lng}`;
        console.log('1. Adım: Koordinat sorgusu yapılıyor:', coordinateUrl);
        
        const coordinateResponse = await fetch(coordinateUrl);
        const coordinateResult = await coordinateResponse.json();

        if (!coordinateResponse.ok || !coordinateResult.success) {
            const errorMsg = coordinateResult.error || `Koordinat API hatası: ${coordinateResponse.status}`;
            throw new Error(errorMsg);
        }
        
        const basicData = coordinateResult.data;
        const props = basicData.properties;
        
        let bagimsizBolumData = null;
        
        // 2. Mahalle ID, ada ve parsel varsa bağımsız bölümleri al
        if (props && props.mahalleId && props.adaNo && props.parselNo) {
            const { mahalleId, adaNo, parselNo } = props;
            const bagimsizBolumUrl = `${PROXY_BASE_URL}/bagimsizbolum/${mahalleId}/${adaNo}/${parselNo}`;
            console.log('2. Adım: Bağımsız bölüm sorgusu yapılıyor:', bagimsizBolumUrl);

            const bagimsizBolumResponse = await fetch(bagimsizBolumUrl);
            const bagimsizBolumResult = await bagimsizBolumResponse.json();

            if (bagimsizBolumResponse.ok && bagimsizBolumResult.success) {
                bagimsizBolumData = bagimsizBolumResult.data;
                console.log('Bağımsız bölüm bilgisi başarıyla alındı.');
            } else {
                console.warn('Bağımsız bölüm bilgisi alınamadı veya bu parselde bulunmuyor.');
            }
        } else {
            console.log('Ek bilgiler için MahalleID, Ada, Parsel bulunamadı.');
        }
        
        // 3. Tüm verileri göster
        displayTkgmData(basicData, bagimsizBolumData);
        drawParselPolygon(basicData);
        
    } catch (error) {
        console.error('TKGM API Hatası:', error);
        showTkgmError(`TKGM verisi alınamadı: ${error.message}`);
    }
}

// TKGM loading göster
function showTkgmLoading() {
    tkgmResults.style.display = 'block';
    tkgmLoading.style.display = 'block';
    parselInfo.style.display = 'none';
    tkgmError.style.display = 'none';
}

// TKGM verisini göster
function displayTkgmData(basicData, bagimsizBolumData = null) {
    tkgmLoading.style.display = 'none';
    parselInfo.style.display = 'grid';
    tkgmError.style.display = 'none';

    // Önceki bağımsız bölüm card'ını temizle
    const existingCard = parselInfo.querySelector('.bagimsiz-bolum-card');
    if (existingCard) {
        existingCard.remove();
    }
    
    const props = basicData.properties;
    
    // Konum bilgileri
    locationDetails.innerHTML = `
        <div class="detail-item">
            <strong>🏙️ İl:</strong>
            <span>${props.ilAd || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>🏘️ İlçe:</strong>
            <span>${props.ilceAd || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>🏠 Mahalle:</strong>
            <span>${props.mahalleAd || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>🆔 Mahalle ID:</strong>
            <span>${props.mahalleId || 'Belirtilmemiş'}</span>
        </div>
    `;
    
    // Parsel detayları
    parselDetails.innerHTML = `
        <div class="detail-item">
            <strong>📍 Parsel No:</strong>
            <span>${props.parselNo || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>🏗️ Ada No:</strong>
            <span>${props.adaNo || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>📏 Alan:</strong>
            <span>${props.alan || 'Belirtilmemiş'} m²</span>
        </div>
        <div class="detail-item">
            <strong>📋 Nitelik:</strong>
            <span>${props.nitelik || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-item">
            <strong>🏢 Zemin Durumu:</strong>
            <span>${props.zeminKmdurum || 'Belirtilmemiş'}</span>
        </div>
    `;
    
    // Geometri bilgileri
    let geometryHtml = '';
    if (basicData.geometry && basicData.geometry.coordinates) {
        const coordinates = basicData.geometry.coordinates[0];
        const area = calculatePolygonArea(coordinates);
        geometryHtml = `
            <div class="detail-item">
                <strong>🔢 Hesaplanan Alan:</strong>
                <span>~${area.toFixed(2)} m²</span>
            </div>
            <div class="coordinates-list">
                <h4>🗺️ Parsel Sınır Koordinatları (${coordinates.length} nokta)</h4>
        `;
        
        coordinates.forEach((coord) => {
            const [lng, lat] = coord;
            geometryHtml += `
                <div class="coordinate-point">
                    ${lat.toFixed(8)}, ${lng.toFixed(8)}
                </div>
            `;
        });
        
        geometryHtml += '</div>';
    } else {
        geometryHtml = '<p>Bu parsel için geometri verisi bulunamadı.</p>';
    }
    geometryDetails.innerHTML = geometryHtml;
    
    // Ham veri (tüm veriler)
    const allData = {
        parselBilgisi: basicData,
        bagimsizBolumler: bagimsizBolumData
    };
    rawJsonData.textContent = JSON.stringify(allData, null, 2);
    
    // Eğer bağımsız bölümler varsa, bunları ayrı bir card'da göster
    if (bagimsizBolumData && bagimsizBolumData.features && bagimsizBolumData.features.length > 0) {
        displayBagimsizBolumler(bagimsizBolumData);
    } else {
        console.log("Görüntülenecek bağımsız bölüm bulunmuyor.");
    }
}

// Bağımsız bölümleri göster
function displayBagimsizBolumler(data) {
    const card = document.createElement('div');
    card.className = 'bagimsiz-bolum-card';
    
    let content = `<h3>🏠 Bağımsız Bölümler (${data.features.length} adet)</h3>`;
    
    if (data.features && data.features.length > 0) {
        content += `
            <table class="bagimsiz-bolum-table">
                <thead>
                    <tr>
                        <th>Blok</th>
                        <th>Kat</th>
                        <th>Bölüm No</th>
                        <th>Nitelik</th>
                        <th>Arsa Payı</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.features.forEach(bolum => {
            const props = bolum.properties;
            content += `
                <tr>
                    <td>${props.blokAdi || '-'}</td>
                    <td>${props.katNo || '-'}</td>
                    <td>${props.bagimsizBolumNo || '-'}</td>
                    <td>${props.nitelik || '-'}</td>
                    <td>${props.arsaPayi || '?'}/${props.arsaPaydasi || '?'}</td>
                </tr>
            `;
        });
        
        content += `
                </tbody>
            </table>
        `;
    } else {
        content += '<p>Bu parsel için bağımsız bölüm bilgisi bulunamadı.</p>';
    }
    
    card.innerHTML = content;
    parselInfo.appendChild(card);
}

// Parsel poligonunu çiz
function drawParselPolygon(data) {
    // Önceki polygon'u kaldır
    if (parselPolygon) {
        parselPolygon.setMap(null);
    }
    
    if (!data.geometry || !data.geometry.coordinates) {
        console.log('Geometri verisi bulunamadı');
        return;
    }
    
    const coordinates = data.geometry.coordinates[0];
    
    // Google Maps koordinat formatına çevir
    const polygonCoords = coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
    }));
    
    // Polygon oluştur
    parselPolygon = new google.maps.Polygon({
        paths: polygonCoords,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: '#FF0000',
        fillOpacity: 0.2,
        editable: false,
        draggable: false
    });
    
    // Haritaya ekle
    parselPolygon.setMap(map);
    
    // Polygon'a zoom yap
    const bounds = new google.maps.LatLngBounds();
    polygonCoords.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);
    
    console.log('Parsel poligonu çizildi');
}

// TKGM hatası göster
function showTkgmError(message) {
    tkgmLoading.style.display = 'none';
    parselInfo.style.display = 'none';
    tkgmError.style.display = 'block';
    tkgmError.innerHTML = `
        <h4>❌ TKGM Verisi Alınamadı</h4>
        <p>${message}</p>
        <small><strong>Çözüm önerileri:</strong>
            <ul>
                <li>Proxy server'ın çalıştığından emin olun</li>
                <li>Internet bağlantınızı kontrol edin</li>
                <li>Farklı bir koordinat deneyin</li>
            </ul>
        </small>
    `;
}

// Polygon alanı hesaplama (Shoelace formula)
function calculatePolygonArea(coordinates) {
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }
    
    area = Math.abs(area) / 2;
    
    // Koordinat sistemini m²'ye çevir (yaklaşık)
    const earthRadius = 6371000; // metre
    const latRad = (selectedCoordinates.lat * Math.PI) / 180;
    const degreeToMeter = earthRadius * Math.PI / 180;
    const areaInSquareMeters = area * degreeToMeter * degreeToMeter * Math.cos(latRad);
    
    return areaInSquareMeters;
}

// Sayfa yüklendiğinde çalışacak
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sayfa yüklendi, Google Maps bekleniyor...');
});

function hideTkgmResults() {
    tkgmResults.style.display = 'none';
    tkgmLoading.style.display = 'none';
    parselInfo.style.display = 'none';
    tkgmError.style.display = 'none';
} 