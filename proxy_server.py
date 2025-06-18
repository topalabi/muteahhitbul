from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import random
import json

# Flask uygulamasını oluştur
app = Flask(__name__)
CORS(app)  # CORS'u etkinleştir

# Logging ayarla
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# TKGM API base URL
TKGM_BASE_URL = 'https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel'

# Oxylabs proxy listesini yükle
with open('Endpoints.json', 'r') as f:
    OXYLABS_PROXIES = json.load(f)

# 1. Koordinat ile Parsel Sorgulama
@app.route('/api/parsel/koordinat/<lat>/<lng>', methods=['GET'])
def get_parsel_by_coordinates(lat, lng):
    """Koordinatlardan temel parsel bilgisini alır."""
    url = f"{TKGM_BASE_URL}/{lat}/{lng}/"
    logger.info(f"Koordinat sorgusu yapılıyor: {url}")
    try:
        response = requests.get(url, timeout=20)
        logger.info(f"TKGM yanıtı: {response.text}")  # Yanıtı logla
        response.raise_for_status()  # HTTP 2xx olmayan durumlar için hata fırlat
        try:
            data = response.json()
        except Exception as e:
            logger.error(f'JSON parse hatası: {e}')
            return jsonify({'success': False, 'error': 'TKGM API yanıtı JSON formatında değil.'}), 500
        return jsonify({'success': True, 'data': data})
    except requests.exceptions.HTTPError as errh:
        logger.error(f"HTTP Hatası: {errh}")
        return jsonify({'success': False, 'error': f'TKGM API Hatası: {response.status_code}', 'tkgm_response': response.text}), response.status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"API isteği hatası: {e}")
        return jsonify({'success': False, 'error': 'TKGM API isteği başarısız oldu.'}), 500

# 2. Mahalle ID, Ada, Parsel ile Bağımsız Bölüm Sorgulama
@app.route('/api/parsel/bagimsizbolum/<mahalle_id>/<ada_no>/<parsel_no>', methods=['GET'])
@app.route('/api/parsel/bagimsizbolum/<mahalle_id>/<ada_no>/<parsel_no>/<blok>', methods=['GET'])
def get_parsel_bagimsiz_bolum(mahalle_id, ada_no, parsel_no, blok=None):
    if blok:
        url = f"{TKGM_BASE_URL}/bagimsizbolum/{mahalle_id}/{ada_no}/{parsel_no}/{blok}"
    else:
        url = f"{TKGM_BASE_URL}/bagimsizbolum/{mahalle_id}/{ada_no}/{parsel_no}/0"
    logger.info(f"Bağımsız bölüm sorgusu yapılıyor: {url}")
    try:
        response = requests.get(url, timeout=20)
        if response.status_code == 404:
            return jsonify({'success': False, 'error': 'Bağımsız bölüm bulunamadı.'}), 404
        response.raise_for_status()
        return jsonify({'success': True, 'data': response.json()})
    except Exception as e:
        logger.error(f"API isteği hatası: {e}")
        return jsonify({'success': False, 'error': 'TKGM API isteği başarısız oldu.'}), 500

@app.route('/api/parsel/blok/<int:mahalleId>/<int:adaNo>/<int:parselNo>', methods=['GET'])
def get_blok(mahalleId, adaNo, parselNo):
    url = f"{TKGM_BASE_URL}/blok/{mahalleId}/{adaNo}/{parselNo}"
    logger.info(f'Blok sorgusu yapılıyor: {url}')
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.HTTPError as errh:
        logger.error(f"HTTP Hatası: {errh}")
        return jsonify({'success': False, 'error': f'TKGM API Hatası: {response.status_code}'}), response.status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"API isteği hatası: {e}")
        return jsonify({'success': False, 'error': 'TKGM API isteği başarısız oldu.'}), 500

@app.route('/api/parsel/yapi_geometri/<mahalle_id>/<ada_no>/<parsel_no>', methods=['GET'])
def get_yapi_geometri(mahalle_id, ada_no, parsel_no):
    url = f"https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api/parsel/parselbagligeometriIdariYapi/{mahalle_id}/{ada_no}/{parsel_no}"
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Server sağlık durumu kontrolü."""
    return jsonify({'status': 'healthy', 'message': 'TKGM Proxy Server çalışıyor.'})

if __name__ == '__main__':
    print("🚀 Sadeleştirilmiş TKGM Proxy Server başlatılıyor...")
    print("📡 CORS desteği etkin")
    print("🌐 Server adresi: http://127.0.0.1:5000")
    print("❌ Durdurmak için: Ctrl+C")
    print("-" * 60)
    app.run(debug=True, host='127.0.0.1', port=5000) 