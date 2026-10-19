export interface MandiMarket {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  marketType: 'Principal Mandi' | 'Sub-Yard' | 'APMC Market' | 'Private E-Mandi';
  avgDailyVolumeTonnes: number;
  operatingHours: string;
}

export interface StateDistrictHierarchy {
  state: string;
  districts: {
    district: string;
    markets: MandiMarket[];
  }[];
}

export const MASTER_MANDIS: MandiMarket[] = [
  // Andhra Pradesh
  { id: 'ap-vja', name: 'Vijayawada Mandi', district: 'Krishna', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, marketType: 'APMC Market', avgDailyVolumeTonnes: 340, operatingHours: '05:00 - 14:00' },
  { id: 'ap-gnt', name: 'Guntur Mirchi Yard', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 620, operatingHours: '04:00 - 16:00' },
  { id: 'ap-tkk', name: 'Tenali Mandi', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.2435, lng: 80.6400, marketType: 'Sub-Yard', avgDailyVolumeTonnes: 180, operatingHours: '06:00 - 13:00' },
  { id: 'ap-knl', name: 'Kurnool APMC', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 410, operatingHours: '05:00 - 15:00' },
  { id: 'ap-adb', name: 'Adoni Mandi', district: 'Kurnool', state: 'Andhra Pradesh', lat: 15.6322, lng: 77.2728, marketType: 'APMC Market', avgDailyVolumeTonnes: 290, operatingHours: '06:00 - 14:00' },
  { id: 'ap-atp', name: 'Anantapur Market', district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 310, operatingHours: '05:00 - 14:00' },
  { id: 'ap-mdp', name: 'Madanapalle Tomato Market', district: 'Chittoor', state: 'Andhra Pradesh', lat: 13.5560, lng: 78.5010, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 850, operatingHours: '04:00 - 17:00' },

  // Maharashtra
  { id: 'mh-pune', name: 'Pune APMC (Gultekdi)', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 920, operatingHours: '04:00 - 18:00' },
  { id: 'mh-manchar', name: 'Manchar Mandi', district: 'Pune', state: 'Maharashtra', lat: 19.0064, lng: 73.9408, marketType: 'Sub-Yard', avgDailyVolumeTonnes: 210, operatingHours: '06:00 - 13:00' },
  { id: 'mh-lasalgaon', name: 'Lasalgaon Onion Mandi', district: 'Nashik', state: 'Maharashtra', lat: 20.1472, lng: 74.2274, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 1100, operatingHours: '05:00 - 19:00' },
  { id: 'mh-pimpalgaon', name: 'Pimpalgaon Baswant', district: 'Nashik', state: 'Maharashtra', lat: 20.1704, lng: 73.9856, marketType: 'APMC Market', avgDailyVolumeTonnes: 780, operatingHours: '05:00 - 18:00' },
  { id: 'mh-nagpur', name: 'Nagpur Kalamna Mandi', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 640, operatingHours: '05:00 - 16:00' },
  { id: 'mh-vashi', name: 'Navi Mumbai Vashi APMC', district: 'Thane', state: 'Maharashtra', lat: 19.0770, lng: 72.9986, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 1450, operatingHours: '03:00 - 20:00' },
  { id: 'mh-solapur', name: 'Solapur APMC', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064, marketType: 'APMC Market', avgDailyVolumeTonnes: 490, operatingHours: '05:00 - 15:00' },

  // Karnataka
  { id: 'ka-yesh', name: 'Bengaluru Yeshwanthpur APMC', district: 'Bengaluru Urban', state: 'Karnataka', lat: 13.0238, lng: 77.5529, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 1200, operatingHours: '04:00 - 18:00' },
  { id: 'ka-kolar', name: 'Kolar APMC Market Yard', district: 'Kolar', state: 'Karnataka', lat: 13.1362, lng: 78.1291, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 750, operatingHours: '04:00 - 16:00' },
  { id: 'ka-hubballi', name: 'Hubballi Amargol APMC', district: 'Dharwad', state: 'Karnataka', lat: 15.3647, lng: 75.1240, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 480, operatingHours: '05:00 - 15:00' },
  { id: 'ka-belagavi', name: 'Belagavi APMC', district: 'Belagavi', state: 'Karnataka', lat: 15.8497, lng: 74.4977, marketType: 'APMC Market', avgDailyVolumeTonnes: 390, operatingHours: '06:00 - 14:00' },
  { id: 'ka-mysore', name: 'Mysuru Bandipalya APMC', district: 'Mysuru', state: 'Karnataka', lat: 12.2958, lng: 76.6394, marketType: 'APMC Market', avgDailyVolumeTonnes: 360, operatingHours: '05:00 - 15:00' },

  // Madhya Pradesh
  { id: 'mp-indore', name: 'Indore Chhoithram Mandi', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 850, operatingHours: '04:00 - 17:00' },
  { id: 'mp-ujjain', name: 'Ujjain Krishi Upaj Mandi', district: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 540, operatingHours: '05:00 - 16:00' },
  { id: 'mp-bhopal', name: 'Bhopal Karond Mandi', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 620, operatingHours: '05:00 - 16:00' },
  { id: 'mp-sehore', name: 'Sehore Mandi', district: 'Sehore', state: 'Madhya Pradesh', lat: 23.2033, lng: 77.0844, marketType: 'APMC Market', avgDailyVolumeTonnes: 430, operatingHours: '06:00 - 15:00' },
  { id: 'mp-neemuch', name: 'Neemuch Krishi Mandi', district: 'Neemuch', state: 'Madhya Pradesh', lat: 24.4764, lng: 74.8724, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 510, operatingHours: '06:00 - 16:00' },

  // Gujarat
  { id: 'gj-ahmedabad', name: 'Ahmedabad Jamalpur APMC', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 980, operatingHours: '04:00 - 18:00' },
  { id: 'gj-rajkot', name: 'Rajkot APMC Bedi Yard', district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 890, operatingHours: '05:00 - 17:00' },
  { id: 'gj-surat', name: 'Surat APMC Sardar Market', district: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 720, operatingHours: '04:00 - 16:00' },
  { id: 'gj-gondal', name: 'Gondal APMC Market Yard', district: 'Rajkot', state: 'Gujarat', lat: 21.9619, lng: 70.7933, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 940, operatingHours: '05:00 - 18:00' },
  { id: 'gj-unan', name: 'Unjha Spices APMC', district: 'Mehsana', state: 'Gujarat', lat: 23.8035, lng: 72.3927, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 820, operatingHours: '06:00 - 18:00' },

  // Punjab
  { id: 'pb-khanna', name: 'Khanna Grain Market (Asia largest)', district: 'Ludhiana', state: 'Punjab', lat: 30.7071, lng: 76.2166, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 1350, operatingHours: '05:00 - 19:00' },
  { id: 'pb-ludhiana', name: 'Ludhiana Salem Tabri Mandi', district: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573, marketType: 'APMC Market', avgDailyVolumeTonnes: 610, operatingHours: '05:00 - 16:00' },
  { id: 'pb-jalandhar', name: 'Jalandhar Maqsudan Mandi', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 540, operatingHours: '05:00 - 16:00' },
  { id: 'pb-amritsar', name: 'Amritsar Bhagtanwala Mandi', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 580, operatingHours: '06:00 - 16:00' },

  // Uttar Pradesh
  { id: 'up-agra', name: 'Agra Fatehabad Road Mandi', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 730, operatingHours: '04:00 - 17:00' },
  { id: 'up-kanpur', name: 'Kanpur Naubasta Mandi', district: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 890, operatingHours: '04:00 - 18:00' },
  { id: 'up-lucknow', name: 'Lucknow Dubagga Mandi', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 810, operatingHours: '04:00 - 17:00' },
  { id: 'up-varanasi', name: 'Varanasi Pahariya Mandi', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 570, operatingHours: '05:00 - 16:00' },

  // Rajasthan
  { id: 'rj-jaipur', name: 'Jaipur Muhana Mandi', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 910, operatingHours: '04:00 - 18:00' },
  { id: 'rj-kota', name: 'Kota Bhamashah Mandi', district: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 820, operatingHours: '05:00 - 17:00' },
  { id: 'rj-jodhpur', name: 'Jodhpur Basni Mandi', district: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 530, operatingHours: '05:00 - 16:00' },

  // Telangana
  { id: 'tg-bowenpally', name: 'Hyderabad Bowenpally Market', district: 'Hyderabad', state: 'Telangana', lat: 17.4725, lng: 78.4878, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 860, operatingHours: '04:00 - 17:00' },
  { id: 'tg-warangal', name: 'Warangal Enamamula Mandi', district: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 740, operatingHours: '05:00 - 16:00' },
  { id: 'tg-nizamabad', name: 'Nizamabad APMC Market', district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 520, operatingHours: '05:00 - 16:00' },

  // Tamil Nadu
  { id: 'tn-koyambedu', name: 'Chennai Koyambedu Market', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0694, lng: 80.1948, marketType: 'Principal Mandi', avgDailyVolumeTonnes: 1250, operatingHours: '03:00 - 19:00' },
  { id: 'tn-madurai', name: 'Madurai Mattuthavani Mandi', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9391, lng: 78.1578, marketType: 'APMC Market', avgDailyVolumeTonnes: 480, operatingHours: '05:00 - 15:00' },
  { id: 'tn-coimbatore', name: 'Coimbatore MGR Mandi', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, marketType: 'APMC Market', avgDailyVolumeTonnes: 540, operatingHours: '05:00 - 16:00' }
];

// Haversine formula to calculate distance between two coordinates in Kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Find nearest Mandi given user GPS lat & lng
export function findNearestMandi(userLat: number, userLng: number): MandiMarket & { distanceKm: number } {
  let nearest: MandiMarket = MASTER_MANDIS[0];
  let minDistance = Infinity;

  for (const mandi of MASTER_MANDIS) {
    const dist = calculateDistanceKm(userLat, userLng, mandi.lat, mandi.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = mandi;
    }
  }

  return {
    ...nearest,
    distanceKm: minDistance,
  };
}

// Get hierarchy (States -> Districts -> Mandis)
export function getLocationsHierarchy(): StateDistrictHierarchy[] {
  const statesMap = new Map<string, Map<string, MandiMarket[]>>();

  for (const m of MASTER_MANDIS) {
    if (!statesMap.has(m.state)) {
      statesMap.set(m.state, new Map<string, MandiMarket[]>());
    }
    const districtsMap = statesMap.get(m.state)!;
    if (!districtsMap.has(m.district)) {
      districtsMap.set(m.district, []);
    }
    districtsMap.get(m.district)!.push(m);
  }

  const hierarchy: StateDistrictHierarchy[] = [];
  for (const [state, distMap] of statesMap.entries()) {
    const districts: { district: string; markets: MandiMarket[] }[] = [];
    for (const [district, markets] of distMap.entries()) {
      districts.push({ district, markets });
    }
    districts.sort((a, b) => a.district.localeCompare(b.district));
    hierarchy.push({ state, districts });
  }

  return hierarchy.sort((a, b) => a.state.localeCompare(b.state));
}
