import sys
import json
import random
import requests
import time

# Kullanım: python hepsiemlak.py <lat> <lng> <box_size_metre>
# Örnek: python hepsiemlak.py 41.065 28.995 1500

def get_bbox(lat, lng, box_size=1500):
    import math
    half = box_size / 2
    lat = float(lat)
    lng = float(lng)
    lat_delta = half / 111320
    lng_delta = half / (111320 * abs(math.cos(lat * 3.14159 / 180)))
    top_left = (lat + lat_delta, lng - lng_delta)
    bottom_right = (lat - lat_delta, lng + lng_delta)
    return top_left, bottom_right

# Endpoints.json'dan proxy listesini yükle
with open('Endpoints.json', 'r') as f:
    OXYLABS_PROXIES = json.load(f)

USER_AGENTS = [
    # Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    # Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    # Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80',
]
REFERERS = [
    'https://www.hepsiemlak.com/harita/istanbul-kiralik',
    'https://www.hepsiemlak.com/harita/ankara-kiralik',
    'https://www.hepsiemlak.com/harita/izmir-kiralik',
    'https://www.hepsiemlak.com/harita/',
    'https://www.hepsiemlak.com/',
]
ACCEPT_LANGUAGES = [
    'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'en-US,en;q=0.9,tr;q=0.8',
    'tr,en;q=0.9',
]

def get_random_proxy():
    proxy_str = random.choice(OXYLABS_PROXIES)
    user_pass, host_port = proxy_str.split('@')
    proxy_url = f"http://{user_pass}@{host_port}"
    return {
        'http': proxy_url,
        'https': proxy_url
    }

def fetch_hepsiemlak_api(lat, lng, box_size=1500):
    top_left, bottom_right = get_bbox(lat, lng, box_size)
    url = (
        "https://www.hepsiemlak.com/api/realty-map/?"
        f"mapSize={box_size}&intent=kiralik&mainCategory=konut&buildingAges=0-0,1-5,6-10"
        f"&mapTopLeft={top_left[0]},{top_left[1]}&mapBottomRight={bottom_right[0]},{bottom_right[1]}"
    )
    user_agent = random.choice(USER_AGENTS)
    referer = random.choice(REFERERS)
    accept_language = random.choice(ACCEPT_LANGUAGES)
    headers = {
        'User-Agent': user_agent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': accept_language,
        'Referer': referer,
        'Origin': 'https://www.hepsiemlak.com',
    }
    proxies = get_random_proxy()
    wait_time = random.uniform(1.0, 3.0)
    print(f"[INFO] Rastgele bekleniyor: {wait_time:.2f} sn")
    time.sleep(wait_time)
    print(f"[INFO] API isteği: {url}")
    print(f"[INFO] Proxy: {proxies['http']}")
    print(f"[INFO] User-Agent: {user_agent}")
    print(f"[INFO] Referer: {referer}")
    print(f"[INFO] Accept-Language: {accept_language}")
    try:
        resp = requests.get(url, headers=headers, proxies=proxies, timeout=20)
        print(f"[INFO] Yanıt kodu: {resp.status_code}")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[ERROR] API isteği başarısız: {e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Kullanım: python hepsiemlak.py <lat> <lng> [box_size_metre]")
        sys.exit(1)
    lat = float(sys.argv[1])
    lng = float(sys.argv[2])
    box_size = int(sys.argv[3]) if len(sys.argv) > 3 else 1500
    data = fetch_hepsiemlak_api(lat, lng, box_size)
    if data:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print("[ERROR] Veri alınamadı.") 