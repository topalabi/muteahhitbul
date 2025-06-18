# 🗺️ Google Maps Yer Arama Uygulaması

Modern ve kullanıcı dostu bir yer arama uygulaması. Google Maps API'lerini kullanarak yerler arayabilir, koordinatlarını görebilir ve haritada konumlarını inceleyebilirsiniz. Daha modern bir görünüm için `index_bootstrap.html` dosyasındaki Bootstrap 5 arayüzünü deneyebilirsiniz.

## ✨ Özellikler

- 🔍 **Akıllı Arama**: Otomatik tamamlama ile hızlı yer arama
- 📍 **Detaylı Bilgiler**: Adres, koordinat, puan, telefon, website bilgileri
- 🗺️ **İnteraktif Harita**: Yakınlaştırma, sokak görünümü, tam ekran
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- 🎨 **Modern UI**: Gradyan arka plan ve görsel ikonlar
- 🆕 **Bootstrap 5 Arayüzü**: `index_bootstrap.html` dosyasında daha modern bir arayüz

## 🚀 Kurulum

### 1. Google Cloud Console Ayarları

Google Cloud Console'da aşağıdaki API'leri etkinleştirin:

- **Google Maps JavaScript API**
- **Google Places API** 
- **Google Geocoding API**

### 2. API Anahtarı Alma

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. "Create Credentials" → "API Key"
3. API anahtarınızı kopyalayın

### 3. Projeyi Yapılandırma

`index.html` dosyasındaki API anahtarını değiştirin:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=SIZIN_API_ANAHTARINIZ&libraries=places&callback=initMap"></script>
```

`YOUR_API_KEY` kısmını kendi API anahtarınızla değiştirin.

### 4. Çalıştırma

Dosyaları bir web sunucusunda barındırın:

```bash
# Python ile basit server
python -m http.server 8000

# Node.js ile
npx http-server

# PHP ile
php -S localhost:8000
```

Tarayıcıda `http://localhost:8000` adresini açın.

## 🎯 Kullanım

1. **Arama**: Üst kısımdaki arama çubuğuna yer adı yazın
2. **Otomatik Tamamlama**: Yazdıkça öneriler görüntülenir
3. **Seçim**: Bir öneriyi tıklayın veya Enter'a basın
4. **Sonuçlar**: Sol panelde yer bilgileri, sağda harita görüntülenir
5. **Harita**: Marker'a tıklayarak ek bilgileri görün

## 📋 API Kullanımı

### Kullanılan Google Maps API'leri:

- **Maps JavaScript API**: Harita görüntüleme
- **Places API**: Yer arama ve detayları
- **Autocomplete Service**: Otomatik tamamlama
- **Geocoding**: Koordinat dönüşümü

### Örnek API Çağrıları:

```javascript
// Yer arama
placesService.textSearch({
    query: 'İstanbul',
    language: 'tr'
}, callback);

// Yer detayları
placesService.getDetails({
    placeId: 'place_id',
    fields: ['name', 'geometry', 'formatted_address']
}, callback);
```

## 🔧 Özelleştirme

### Varsayılan Konum Değiştirme

`script.js` dosyasında:

```javascript
const defaultLocation = { lat: 41.0082, lng: 28.9784 }; // İstanbul
```

### Harita Stilini Değiştirme

Google Maps Styling Wizard kullanarak özel stiller ekleyebilirsiniz.

### Dil Ayarları

API çağrılarında `language: 'tr'` parametresi ile dil ayarlanabilir.

## 📱 Responsive Tasarım

Uygulama farklı ekran boyutlarında optimize edilmiştir:

- **Desktop**: Yan yana panel ve harita
- **Tablet**: Üst üste yerleşim
- **Mobile**: Tek sütun düzen

## 🔒 Güvenlik

- API anahtarınızı gizli tutun
- HTTP referrer kısıtlamaları ekleyin
- Günlük kullanım limitlerini ayarlayın

## 🐛 Sorun Giderme

### API Anahtarı Hatası
```
Google Maps JavaScript API error: InvalidKeyMapError
```
- API anahtarının doğru olduğundan emin olun
- İlgili API'lerin etkin olduğunu kontrol edin

### Yavaş Yükleme
- İnternet bağlantınızı kontrol edin
- API limit aşımını kontrol edin

## 📄 Lisans

Bu proje MIT lisansı altında sunulmaktadır.

## 🤝 Katkı

Pull request'ler ve issue'lar hoş karşılanır! 