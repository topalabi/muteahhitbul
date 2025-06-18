import requests
import random
import time
import pandas as pd
import logging
from typing import List, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Example: Load proxies from a file or define here
try:
    with open('proxies.txt', 'r') as f:
        PROXIES = [line.strip() for line in f if line.strip()]
except FileNotFoundError:
    PROXIES = []  # User can add proxies here if not using a file

# Example User-Agents
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
]

REFERERS = [
    'https://www.hepsiemlak.com/',
    'https://www.hepsiemlak.com/satilik',
    'https://www.hepsiemlak.com/kiralik',
]

API_URL = 'https://www.hepsiemlak.com/api/realty-map'


def get_bounding_box(lat: float, lon: float, box_size: float) -> Tuple[float, float, float, float]:
    """
    Returns (minLat, minLon, maxLat, maxLon) for a square bounding box centered at (lat, lon).
    box_size is in degrees (e.g., 0.01 ~ 1km)
    """
    half = box_size / 2
    return lat - half, lon - half, lat + half, lon + half


def get_random_proxy() -> dict:
    if not PROXIES:
        return None
    proxy = random.choice(PROXIES)
    return {
        'http': proxy,
        'https': proxy,
    }


def fetch_listings(minLat, minLon, maxLat, maxLon, max_retries=5):
    params = {
        'category': '1',  # 1 = Satılık, 2 = Kiralık, etc. (can be parameterized)
        'minLat': minLat,
        'maxLat': maxLat,
        'minLon': minLon,
        'maxLon': maxLon,
        'zoom': 15,  # can be parameterized
    }
    for attempt in range(max_retries):
        headers = {
            'User-Agent': random.choice(USER_AGENTS),
            'Referer': random.choice(REFERERS),
            'Accept': 'application/json, text/plain, */*',
        }
        proxy = get_random_proxy()
        try:
            logging.info(f"Requesting listings (attempt {attempt+1}) with params: {params}")
            resp = requests.get(API_URL, params=params, headers=headers, proxies=proxy, timeout=20)
            if resp.status_code == 200:
                return resp.json()
            else:
                logging.warning(f"Non-200 status code: {resp.status_code}")
        except Exception as e:
            logging.error(f"Error fetching listings: {e}")
        time.sleep(random.uniform(1, 3))
    return None


def parse_listings(json_data) -> List[dict]:
    if not json_data or 'data' not in json_data:
        return []
    results = []
    for item in json_data['data']:
        results.append({
            'id': item.get('id'),
            'title': item.get('title'),
            'price': item.get('price'),
            'location': item.get('location'),
            'url': f"https://www.hepsiemlak.com{item.get('seoUrl', '')}",
            'lat': item.get('latitude'),
            'lon': item.get('longitude'),
        })
    return results


def save_to_excel(listings: List[dict], filename: str):
    if not listings:
        logging.warning("No listings to save.")
        return
    df = pd.DataFrame(listings)
    df.to_excel(filename, index=False)
    logging.info(f"Saved {len(listings)} listings to {filename}")


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Fetch HepsiEmlak listings by coordinate and save to Excel.')
    parser.add_argument('--lat', type=float, required=True, help='Center latitude')
    parser.add_argument('--lon', type=float, required=True, help='Center longitude')
    parser.add_argument('--box', type=float, default=0.01, help='Box size in degrees (default: 0.01)')
    parser.add_argument('--output', type=str, default='listings.xlsx', help='Output Excel filename')
    args = parser.parse_args()

    minLat, minLon, maxLat, maxLon = get_bounding_box(args.lat, args.lon, args.box)
    json_data = fetch_listings(minLat, minLon, maxLat, maxLon)
    listings = parse_listings(json_data)
    save_to_excel(listings, args.output)

if __name__ == '__main__':
    main() 