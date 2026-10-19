export type CropSeason = 'Kharif' | 'Rabi' | 'Zaid' | 'Multi-Season' | 'Perennial';
export type CropGroup = 'Major Food Crops' | 'Millets' | 'Pulses' | 'Cash and Commercial' | 'Oilseeds' | 'Seasonal Fruits & Vegetables' | 'Spices';

export interface CropInfo {
  id: string;
  name: string; // Canonical English name
  scientificName?: string;
  category: 'Cereals' | 'Pulses' | 'Vegetables' | 'Fruits' | 'Oilseeds' | 'Spices' | 'Commercial';
  cropGroup?: CropGroup;
  season?: CropSeason;
  seasonTiming?: string; // e.g. "Monsoon / June–October", "Winter / November–April", "Summer / March–June"
  description?: string;
  primaryStates?: string[];
  benchmarkModalPrice?: number; // ₹/Quintal
  mspPrice?: number; // Minimum Support Price in ₹/Quintal
  dailyTrendPct?: number;
  aliases: string[]; // Multilingual names: Hindi, Telugu, Tamil, Marathi, Punjabi, Bengali, Gujarati
  varieties: string[];
  defaultUnit: 'Quintal' | 'Kg';
  shelfLifeDays: number;
}

export const MASTER_CROPS: CropInfo[] = [
  // ==========================================
  // 1. MAJOR FOOD CROPS - CEREALS & GRAINS
  // ==========================================
  {
    id: 'paddy_dhan',
    name: 'Rice (Paddy/Dhan)',
    scientificName: 'Oryza sativa',
    category: 'Cereals',
    cropGroup: 'Major Food Crops',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'A primary staple food grown mostly in the rainy monsoon season in eastern and southern states.',
    primaryStates: ['West Bengal', 'Uttar Pradesh', 'Punjab', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Odisha', 'Bihar'],
    benchmarkModalPrice: 2480,
    mspPrice: 2300,
    dailyTrendPct: 1.4,
    aliases: ['Rice', 'Dhan', 'Chawal', 'धान', 'వరి', 'நெல்', 'ধান', 'ચોખા', 'ಭತ್ತ', 'dhaan', 'chawal', 'paddy', 'basmati', 'rice grain'],
    varieties: ['Basmati 1121', 'Pusa Basmati', 'Common/IR64', 'Sona Masoori', 'BPT 5204', 'Grade-A'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 365,
  },
  {
    id: 'wheat',
    name: 'Wheat (Gehun)',
    scientificName: 'Triticum aestivum',
    category: 'Cereals',
    cropGroup: 'Major Food Crops',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'A major cool-season food grain grown widely across northern and northwestern regions.',
    primaryStates: ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Rajasthan', 'Bihar'],
    benchmarkModalPrice: 2520,
    mspPrice: 2275,
    dailyTrendPct: 0.8,
    aliases: ['Gehun', 'Kanak', 'गेहूं', 'కਣਕ', 'గోధుమలు', 'கோதுமை', 'গম', 'ઘઉં', 'ಗೋಧಿ', 'gehu', 'gandum', 'kanak', 'wheat'],
    varieties: ['Sharbati', 'Lok-1', 'Kalyan Sona', 'PBW-343', 'Mill Quality', 'HD-2967'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 365,
  },
  {
    id: 'maize',
    name: 'Maize (Corn/Makka)',
    scientificName: 'Zea mays',
    category: 'Cereals',
    cropGroup: 'Major Food Crops',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October & Summer',
    description: 'A versatile cereal used for food and animal feed, grown in both summer and monsoon periods.',
    primaryStates: ['Karnataka', 'Madhya Pradesh', 'Bihar', 'Maharashtra', 'Telangana', 'Rajasthan', 'Andhra Pradesh'],
    benchmarkModalPrice: 2180,
    mspPrice: 2090,
    dailyTrendPct: -0.6,
    aliases: ['Makka', 'Corn', 'मक्का', 'మొక్కజొన్న', 'மக்காச்சோளம்', 'ভুট্টা', 'મકાઈ', 'ಮೆಕ್ಕೆಜೋಳ', 'makai', 'makka', 'maize', 'sweet corn'],
    varieties: ['Yellow Maize', 'White Maize', 'Sweet Corn', 'Feed Grade', 'Bio-9681'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 300,
  },
  {
    id: 'barley',
    name: 'Barley (Jau)',
    scientificName: 'Hordeum vulgare',
    category: 'Cereals',
    cropGroup: 'Major Food Crops',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'A major cool-season food grain grown widely across northern plains for food, malting, and nutrient fodder.',
    primaryStates: ['Rajasthan', 'Uttar Pradesh', 'Haryana', 'Madhya Pradesh', 'Punjab'],
    benchmarkModalPrice: 2120,
    mspPrice: 1850,
    dailyTrendPct: 1.1,
    aliases: ['Jau', 'Barley', 'जौ', 'జావలు', 'பார்லி', 'যব', 'જવ', 'ಬಾರ್ಲಿ', 'jow', 'jav', 'barley grain'],
    varieties: ['Malt Grade', 'Feed Grade', 'RD-2035', 'BH-902', 'DWRB-123'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 300,
  },

  // ==========================================
  // 2. MAJOR FOOD CROPS - MILLETS
  // ==========================================
  {
    id: 'jowar',
    name: 'Jowar (Sorghum)',
    scientificName: 'Sorghum bicolor',
    category: 'Cereals',
    cropGroup: 'Millets',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Drought-tolerant grains like jowar (sorghum) grown in dry regions for staple nutrition and dairy fodder.',
    primaryStates: ['Maharashtra', 'Karnataka', 'Rajasthan', 'Tamil Nadu', 'Andhra Pradesh', 'Madhya Pradesh'],
    benchmarkModalPrice: 3250,
    mspPrice: 3180,
    dailyTrendPct: 2.1,
    aliases: ['Jowar', 'Sorghum', 'ज्वार', 'జొన్నలు', 'சோளம்', 'জ্বোয়ার', 'જુવાર', 'ಜೋಳ', 'jowari', 'sorgham', 'great millet'],
    varieties: ['Maldandi (M-35-1)', 'Hybrid CSH-9', 'White Jowar', 'Yellow Jowar', 'Phule Yashoda'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 300,
  },
  {
    id: 'bajra',
    name: 'Bajra (Pearl Millet)',
    scientificName: 'Pennisetum glaucum',
    category: 'Cereals',
    cropGroup: 'Millets',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Drought-tolerant grains like bajra (pearl millet) grown in dry regions with hot sandy soils, rich in iron and zinc.',
    primaryStates: ['Rajasthan', 'Uttar Pradesh', 'Gujarat', 'Haryana', 'Maharashtra'],
    benchmarkModalPrice: 2520,
    mspPrice: 2500,
    dailyTrendPct: 0.5,
    aliases: ['Bajra', 'Pearl Millet', 'बाजरा', 'సజ్జలు', 'கம்பு', 'বাজরা', 'બાજરી', 'ಸಜ್ಜೆ', 'bajri', 'millet', 'sajje'],
    varieties: ['Desi Bajra', 'Hybrid Pioneer', 'GHB-558', 'HHB-67', 'MPMH-17'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 270,
  },
  {
    id: 'ragi',
    name: 'Ragi (Finger Millet)',
    scientificName: 'Eleusine coracana',
    category: 'Cereals',
    cropGroup: 'Millets',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Drought-tolerant grains like ragi (finger millet) grown in dry regions, packed with calcium, iron, and slow-release carbs.',
    primaryStates: ['Karnataka', 'Tamil Nadu', 'Uttarakhand', 'Andhra Pradesh', 'Odisha', 'Maharashtra'],
    benchmarkModalPrice: 4350,
    mspPrice: 4290,
    dailyTrendPct: 1.8,
    aliases: ['Ragi', 'Finger Millet', 'Mandua', 'रागी', 'మండవ', 'రాగులు', 'கேழ்வரகு', 'મંડવા', 'ರಾಗಿ', 'nachni', 'mandua', 'finger millet'],
    varieties: ['GPU-28', 'ML-365', 'Brown Ragi', 'Indaf-9', 'KMR-301'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 365,
  },

  // ==========================================
  // 3. MAJOR FOOD CROPS - PULSES (LENTILS & LEGUMES)
  // ==========================================
  {
    id: 'gram_chana',
    name: 'Bengal Gram (Gram/Chana)',
    scientificName: 'Cicer arietinum',
    category: 'Pulses',
    cropGroup: 'Pulses',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'Protein-rich lentils and legumes like chana (gram) grown during cool winter Rabi season for flour (besan) and whole dal.',
    primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Uttar Pradesh', 'Karnataka'],
    benchmarkModalPrice: 5950,
    mspPrice: 5440,
    dailyTrendPct: 1.3,
    aliases: ['Chana', 'Gram', 'Chickpea', 'चना', 'శనగలు', 'கொண்டைக்கடலை', 'ছোলা', 'ચણા', 'ಕಡಲೆ', 'chanha', 'channa', 'chickpeas', 'desi chana', 'kabuli chana'],
    varieties: ['Desi Chana', 'Kabuli Chana (Dollar)', 'JG-11', 'Annigeri', 'Vishal', 'JAKI 9218'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },
  {
    id: 'tur_arhar',
    name: 'Arhar (Tur/Pigeon Pea)',
    scientificName: 'Cajanus cajan',
    category: 'Pulses',
    cropGroup: 'Pulses',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Protein-rich lentils and legumes like arhar (pigeon pea) vital for India’s staple toor dal soup, grown in monsoon Kharif.',
    primaryStates: ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Telangana'],
    benchmarkModalPrice: 10400,
    mspPrice: 7550,
    dailyTrendPct: 2.7,
    aliases: ['Tur', 'Arhar', 'Toor Dal', 'Pigeon Pea', 'अरहर', 'तूर', 'కందులు', 'துவரம் பருப்பு', 'অড়হর', 'તુવેર', 'ತೊಗರಿ', 'toor', 'arhar dal', 'pigeonpea'],
    varieties: ['Maruti (ICP-8863)', 'Asha (ICPL-87119)', 'White Tur', 'Red Tur', 'BDN-711'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },
  {
    id: 'moong',
    name: 'Moong (Green Gram)',
    scientificName: 'Vigna radiata',
    category: 'Pulses',
    cropGroup: 'Pulses',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October & Summer (Zaid)',
    description: 'Protein-rich lentils and legumes like moong with short growth cycle, cultivated across monsoon and early summer periods.',
    primaryStates: ['Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Bihar', 'Gujarat', 'Andhra Pradesh'],
    benchmarkModalPrice: 8850,
    mspPrice: 8558,
    dailyTrendPct: 0.9,
    aliases: ['Moong', 'Mung', 'Green Gram', 'मूंग', 'పెసలు', 'பாசிப்பயறு', 'মুগ', 'મગ', 'ಹೆಸರು ಕಾಳು', 'moong dal', 'mung bean', 'green moong'],
    varieties: ['Shiny Green', 'Pusa Vishal', 'IPM 205-7 (Virat)', 'Desi Moong', 'Samrat (PDM-139)'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 210,
  },
  {
    id: 'masoor',
    name: 'Masoor (Red Lentil)',
    scientificName: 'Lens culinaris',
    category: 'Pulses',
    cropGroup: 'Pulses',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'Protein-rich lentils and legumes like masoor grown in cool winter Rabi season, highly popular as whole and split orange dal.',
    primaryStates: ['Madhya Pradesh', 'Uttar Pradesh', 'West Bengal', 'Bihar', 'Rajasthan'],
    benchmarkModalPrice: 6850,
    mspPrice: 6425,
    dailyTrendPct: 1.5,
    aliases: ['Masoor', 'Red Lentil', 'Lentil', 'मसूर', 'ఎర్ర కందిపప్పు', 'மசூர் பருப்பு', 'মসুর', 'મસૂર', 'ಮಸೂರ', 'masur', 'red lentil', 'masoor dal'],
    varieties: ['Small Seeded (Desi)', 'Bold Seeded', 'Pusa Ageti', 'K-75', 'HUL-57'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },
  {
    id: 'urad',
    name: 'Urad (Black Gram)',
    scientificName: 'Vigna mungo',
    category: 'Pulses',
    cropGroup: 'Pulses',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Protein-rich lentils and legumes like urad essential for savory preparations, dal makhani, idli-dosa batter, and papad.',
    primaryStates: ['Madhya Pradesh', 'Uttar Pradesh', 'Andhra Pradesh', 'Maharashtra', 'Tamil Nadu'],
    benchmarkModalPrice: 8150,
    mspPrice: 7400,
    dailyTrendPct: -0.4,
    aliases: ['Urad', 'Black Gram', 'Mash', 'उडद', 'మినుములు', 'உளுந்து', 'মাষকলাই', 'અડદ', 'ಉದ್ದು', 'urad dal', 'black matpe'],
    varieties: ['T-9', 'Pant U-31', 'Black Bold', 'Mash-114', 'PU-19'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },

  // ==========================================
  // 4. CASH AND COMMERCIAL CROPS
  // ==========================================
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ganna)',
    scientificName: 'Saccharum officinarum',
    category: 'Commercial',
    cropGroup: 'Cash and Commercial',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October & Perennial',
    description: 'A tall grass cultivated for making sugar, jaggery (gur), and ethanol, supporting millions of farm households.',
    primaryStates: ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Bihar', 'Gujarat', 'Haryana'],
    benchmarkModalPrice: 365,
    mspPrice: 340, // Fair and Remunerative Price (FRP) per quintal cane
    dailyTrendPct: 0.2,
    aliases: ['Sugarcane', 'Ganna', 'Serumbu', 'गन्ना', 'చెరకు', 'கரும்பு', 'আখ', 'શેરડી', 'ಕಬ್ಬು', 'ganna', 'sugar cane', 'gur cane'],
    varieties: ['Co-0238', 'Co-86032', 'Early Cane', 'General Cane', 'Jaggery Gur Cane', 'CoM 0265'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 14,
  },
  {
    id: 'cotton',
    name: 'Cotton (Kapas)',
    scientificName: 'Gossypium hirsutum',
    category: 'Commercial',
    cropGroup: 'Cash and Commercial',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'A major fiber crop used by the local and global textile industries, known as "White Gold".',
    primaryStates: ['Gujarat', 'Maharashtra', 'Telangana', 'Rajasthan', 'Karnataka', 'Haryana', 'Andhra Pradesh', 'Madhya Pradesh'],
    benchmarkModalPrice: 7650,
    mspPrice: 7121,
    dailyTrendPct: 1.6,
    aliases: ['Kapas', 'Rui', 'Cotton', 'कपास', 'పత్తి', 'பருத்தி', 'തുണി', 'કાપસ', 'ಹತ್ತಿ', 'kapaas', 'rui', 'kapas', 'raw cotton'],
    varieties: ['Medium Staple', 'Long Staple (Bt)', 'DCH-32', 'Shankar-6', 'Desi Cotton', 'Bollgard II'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 180,
  },
  {
    id: 'jute',
    name: 'Jute (Patsan/Golden Fiber)',
    scientificName: 'Corchorus olitorius',
    category: 'Commercial',
    cropGroup: 'Cash and Commercial',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'A natural fiber plant grown largely in eastern wet floodplains for sacks, biodegradable packaging, and export twines.',
    primaryStates: ['West Bengal', 'Bihar', 'Assam', 'Odisha', 'Meghalaya'],
    benchmarkModalPrice: 5680,
    mspPrice: 5335,
    dailyTrendPct: 0.7,
    aliases: ['Jute', 'Pat', 'Patsan', 'जूट', 'पटसन', 'జనపనార', 'சணல்', 'পাট', 'શણ', 'ಸೆಣಬು', 'pat', 'patsan', 'golden fiber', 'raw jute'],
    varieties: ['TD-5 (Tossa)', 'White Jute (W-5)', 'JRO-524 (Navin)', 'Botany Tossa', 'Mesta'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },

  // ==========================================
  // 5. OILSEEDS (CROPS TO PRODUCE COOKING OILS)
  // ==========================================
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut/Moongphali)',
    scientificName: 'Arachis hypogaea',
    category: 'Oilseeds',
    cropGroup: 'Oilseeds',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October & Summer',
    description: 'Crops like groundnut, mustard, soybean, and sunflower grown to produce cooking oils, rich in protein and fatty acids.',
    primaryStates: ['Gujarat', 'Rajasthan', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Maharashtra'],
    benchmarkModalPrice: 6780,
    mspPrice: 6783,
    dailyTrendPct: 1.2,
    aliases: ['Moongphali', 'Shengdana', 'Groundnut', 'Peanut', 'मूंगफली', 'వేరుశెనగ', 'வேர்க்கடலை', 'বাদাম', 'મગફળી', 'ಕಡಲೆಕಾಯಿ', 'mungfali', 'peanut', 'ground nut'],
    varieties: ['Pod with Shell', 'Bold Kernel', 'JL-24', 'TMV-2', 'TAG-24', 'Kadir-6'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 180,
  },
  {
    id: 'mustard',
    name: 'Mustard (Sarson/Rai)',
    scientificName: 'Brassica nigra / juncea',
    category: 'Oilseeds',
    cropGroup: 'Oilseeds',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'Crops like groundnut, mustard, soybean, and sunflower grown to produce cooking oils (aromatic kachi ghani mustard oil).',
    primaryStates: ['Rajasthan', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Gujarat'],
    benchmarkModalPrice: 5850,
    mspPrice: 5650,
    dailyTrendPct: 1.0,
    aliases: ['Sarson', 'Rai', 'Mustard', 'सरसों', 'ఆవాలు', 'கடுகு', 'সরিষা', 'રાઈ', 'ಸಾಸಿವೆ', 'sarso', 'sarson', 'rai', 'toria'],
    varieties: ['Pusa Bold', 'Varuna (T-59)', 'Black Mustard', 'Yellow Sarson', 'RH-749', 'Giriraj'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 240,
  },
  {
    id: 'soyabean',
    name: 'Soybean (Soyabean)',
    scientificName: 'Glycine max',
    category: 'Oilseeds',
    cropGroup: 'Oilseeds',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October',
    description: 'Crops like groundnut, mustard, soybean, and sunflower grown to produce cooking oils and high-protein defatted soy cake.',
    primaryStates: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka', 'Telangana'],
    benchmarkModalPrice: 4720,
    mspPrice: 4892,
    dailyTrendPct: -0.8,
    aliases: ['Soybean', 'Soyabean', 'सोयाबीन', 'సోయాబీన్', 'சோயாபீன்', 'সোয়াবিন', 'સોયાબીન', 'ಸೋಯಾಬೀನ್', 'soya', 'soya bean', 'soyabean yellow'],
    varieties: ['JS-335', 'JS-9560', 'Yellow Soya', 'NRC-37', 'MACS-1407', 'Black Soya'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 180,
  },
  {
    id: 'sunflower',
    name: 'Sunflower (Surajmukhi)',
    scientificName: 'Helianthus annuus',
    category: 'Oilseeds',
    cropGroup: 'Oilseeds',
    season: 'Kharif',
    seasonTiming: 'Monsoon / June–October & Summer (Zaid)',
    description: 'Crops like groundnut, mustard, soybean, and sunflower grown to produce cooking oils (premium polyunsaturated edible oil).',
    primaryStates: ['Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Telangana', 'Bihar', 'Odisha'],
    benchmarkModalPrice: 6650,
    mspPrice: 7280,
    dailyTrendPct: 1.9,
    aliases: ['Sunflower', 'Surajmukhi', 'सूरजमुखी', 'పొద్దుతిరుగుడు', 'சூரியகாந்தி', 'সূর্যমুখী', 'સૂર્યમુખી', 'ಸೂರ್ಯಕಾಂತಿ', 'surajmukhi', 'sunflower seed'],
    varieties: ['KBSH-1', 'DRSH-1', 'Hybrid Surajmukhi', 'Modern', 'PAC-36'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 180,
  },

  // ==========================================
  // 6. SEASONAL CROPS - ZAID SEASON & ESSENTIAL VEGETABLES
  // ==========================================
  {
    id: 'watermelon',
    name: 'Watermelon (Tarbooz)',
    scientificName: 'Citrullus lanatus',
    category: 'Fruits',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Zaid',
    seasonTiming: 'Summer / March–June',
    description: 'Zaid Season (Summer / March–June): Watermelon, cucumber, and short-term vegetables grown along warm river basins.',
    primaryStates: ['Uttar Pradesh', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Maharashtra', 'Haryana', 'Madhya Pradesh'],
    benchmarkModalPrice: 1350,
    dailyTrendPct: 2.4,
    aliases: ['Watermelon', 'Tarbooz', 'Kalingad', 'तरबूज', 'పుచ్చకాయ', 'தர்பூசணி', 'তরমুজ', 'તરબૂચ', 'ಕಲ್ಲಂಗಡಿ', 'tarbuj', 'kalingada', 'water melon'],
    varieties: ['Sugar Baby', 'Kiran (Black Beauty)', 'Namdhari NS 295', 'Desi Tarbooz', 'Icebox'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 14,
  },
  {
    id: 'cucumber',
    name: 'Cucumber (Kheera)',
    scientificName: 'Cucumis sativus',
    category: 'Vegetables',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Zaid',
    seasonTiming: 'Summer / March–June',
    description: 'Zaid Season (Summer / March–June): Watermelon, cucumber, and short-term vegetables prized for rapid maturity and hydration.',
    primaryStates: ['Haryana', 'Uttar Pradesh', 'Punjab', 'Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Bihar'],
    benchmarkModalPrice: 1680,
    dailyTrendPct: 3.1,
    aliases: ['Cucumber', 'Kheera', 'Kakdi', 'खीरा', 'దోసకాయ', 'வெள்ளரிக்காய்', 'শসা', 'કાકડી', 'ಸೌತೆಕಾಯಿ', 'khira', 'kakadi', 'cucumbers'],
    varieties: ['Pusa Sanyog', 'Green Salad', 'Desi Kheera', 'English/Polyhouse Cucumber', 'Malini'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 8,
  },
  {
    id: 'tomato',
    name: 'Tomato (Tamatar)',
    scientificName: 'Solanum lycopersicum',
    category: 'Vegetables',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Multi-Season',
    seasonTiming: 'Year-round / Kharif, Rabi & Zaid',
    description: 'High-demand perishable vegetable grown across Kharif, Rabi, and irrigated summer seasons with active daily trading.',
    primaryStates: ['Andhra Pradesh', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Odisha', 'Maharashtra'],
    benchmarkModalPrice: 1650,
    dailyTrendPct: -1.2,
    aliases: ['Tamatar', 'टमाटर', 'టమోటా', 'தக்காளி', 'टोमॅटो', 'টমেটো', 'ટામેટા', 'ಟೊಮೆಟೊ', 'tomatto', 'tomata', 'tamata', 'tomato'],
    varieties: ['Hybrid', 'Desi', 'Vaishali', 'Roma', 'Local', 'Abhinav'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 7,
  },
  {
    id: 'onion',
    name: 'Onion (Pyaz)',
    scientificName: 'Allium cepa',
    category: 'Vegetables',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Rabi',
    seasonTiming: 'Rabi Winter & Late Kharif',
    description: 'Essential kitchen bulb crop harvested in Kharif, Late Kharif, and Rabi seasons with active wholesale auctioning.',
    primaryStates: ['Maharashtra', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Rajasthan', 'Bihar'],
    benchmarkModalPrice: 2150,
    dailyTrendPct: 2.8,
    aliases: ['Pyaz', 'Kanda', 'प्याज', 'कांदा', 'ఉల్లిపాయ', 'வெங்காயம்', 'পিঁয়াজ', 'ડુંગળી', 'ಈರುಳ್ಳಿ', 'peyaj', 'pyajh', 'piyaj', 'onion'],
    varieties: ['Red Nasik', 'White Onion', 'Garlic/Small', 'Pusa Red', 'Local Red', 'Garwa (Rabi)'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 45,
  },
  {
    id: 'potato',
    name: 'Potato (Aloo)',
    scientificName: 'Solanum tuberosum',
    category: 'Vegetables',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Rabi',
    seasonTiming: 'Winter / November–April',
    description: 'Rabi Season (Winter / November–April): Major winter tuber vegetable sustaining household nutrition and cold storages.',
    primaryStates: ['Uttar Pradesh', 'West Bengal', 'Bihar', 'Gujarat', 'Madhya Pradesh', 'Punjab'],
    benchmarkModalPrice: 1380,
    dailyTrendPct: 0.4,
    aliases: ['Aloo', 'Batata', 'आलू', 'बटाटा', 'బంగాళాదుంప', 'உருளைக்கிழங்கு', 'আলু', 'બટાકા', 'ಆಲೂಗಡ್ಡೆ', 'potatos', 'aaloo', 'alu', 'potato'],
    varieties: ['Jyoti', 'Kufri Bahar', 'Lauvkar', 'Chandramukhi', 'Desi Aloo', 'Kufri Pukhraj'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 60,
  },
  {
    id: 'green_chilli',
    name: 'Green Chilli (Hari Mirch)',
    scientificName: 'Capsicum annuum',
    category: 'Vegetables',
    cropGroup: 'Seasonal Fruits & Vegetables',
    season: 'Kharif',
    seasonTiming: 'Monsoon & Summer',
    description: 'High-value pungent spice and vegetable crop cultivated in warm seasons for fresh consumption and processing.',
    primaryStates: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Madhya Pradesh', 'Gujarat'],
    benchmarkModalPrice: 4100,
    dailyTrendPct: 1.7,
    aliases: ['Hari Mirch', 'Mirchi', 'Green Chilli', 'हरी मिर्च', 'పచ్చి మిరపకాయ', 'பச்சை மிளகாய்', 'লঙ্কা', 'લીલા મરચાં', 'ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ', 'mirch', 'mirchi', 'chilli'],
    varieties: ['G-4', 'Jwala', 'Teja', 'Indam-5', 'Byadagi Green'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 10,
  },
  {
    id: 'turmeric',
    name: 'Turmeric (Haldi)',
    scientificName: 'Curcuma longa',
    category: 'Spices',
    cropGroup: 'Spices',
    season: 'Perennial',
    seasonTiming: 'Year-round rhizome',
    description: 'Golden spice rhizome celebrated worldwide for curcumin potency, culinary color, and therapeutic benefits.',
    primaryStates: ['Telangana', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha'],
    benchmarkModalPrice: 14200,
    dailyTrendPct: 3.5,
    aliases: ['Haldi', 'हल्दी', 'పసుపు', 'மஞ்சள்', 'হলুদ', 'હળદર', 'ಅರಿಶಿನ', 'haldi', 'pasupu', 'turmeric'],
    varieties: ['Salem', 'Rajapore', 'Nizamabad', 'Finger Bulb', 'Prathibha'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 365,
  },
  {
    id: 'ginger',
    name: 'Ginger (Adrak)',
    scientificName: 'Zingiber officinale',
    category: 'Spices',
    cropGroup: 'Spices',
    season: 'Perennial',
    seasonTiming: 'Year-round rhizome',
    description: 'Fresh pungent aromatic rhizome widely traded in major spices and vegetable mandis.',
    primaryStates: ['Kerala', 'Assam', 'Himachal Pradesh', 'Karnataka', 'Odisha', 'Maharashtra'],
    benchmarkModalPrice: 6200,
    dailyTrendPct: -1.0,
    aliases: ['Adrak', 'अदरक', 'అల్లం', 'இஞ்சி', 'আদা', 'આદું', 'ಶುಂಠಿ', 'adrak', 'allam', 'ginger'],
    varieties: ['Fresh Green', 'Dry (Sonth)', 'Himachal Local', 'Rio de Janeiro', 'Maran'],
    defaultUnit: 'Quintal',
    shelfLifeDays: 25,
  }
];

// Levenshtein distance calculation for fuzzy search
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

// Fuzzy match algorithm
export function searchCrops(query: string): { crop: CropInfo; score: number; matchedAlias?: string }[] {
  if (!query || query.trim().length === 0) {
    return MASTER_CROPS.slice(0, 10).map(c => ({ crop: c, score: 1 }));
  }

  const cleanQuery = query.trim().toLowerCase();
  const results: { crop: CropInfo; score: number; matchedAlias?: string }[] = [];

  for (const crop of MASTER_CROPS) {
    let bestScore = 0;
    let matchedAlias: string | undefined = undefined;

    // Check exact name prefix or inclusion
    const lowerName = crop.name.toLowerCase();
    if (lowerName === cleanQuery) {
      bestScore = 1.0;
    } else if (lowerName.startsWith(cleanQuery)) {
      bestScore = 0.95;
    } else if (lowerName.includes(cleanQuery)) {
      bestScore = 0.85;
    }

    // Check aliases
    for (const alias of crop.aliases) {
      const lowerAlias = alias.toLowerCase();
      if (lowerAlias === cleanQuery) {
        if (bestScore < 0.98) {
          bestScore = 0.98;
          matchedAlias = alias;
        }
      } else if (lowerAlias.startsWith(cleanQuery)) {
        if (bestScore < 0.9) {
          bestScore = 0.9;
          matchedAlias = alias;
        }
      } else if (lowerAlias.includes(cleanQuery)) {
        if (bestScore < 0.8) {
          bestScore = 0.8;
          matchedAlias = alias;
        }
      } else {
        // Fuzzy distance check
        const dist = levenshteinDistance(cleanQuery, lowerAlias);
        const maxLen = Math.max(cleanQuery.length, lowerAlias.length);
        const similarity = 1 - dist / maxLen;
        // Allow typo tolerance if similarity is above 0.65
        if (similarity > 0.65 && similarity > bestScore) {
          bestScore = similarity * 0.88;
          matchedAlias = alias;
        }
      }
    }

    // Fuzzy check on main name as well
    const mainDist = levenshteinDistance(cleanQuery, lowerName);
    const mainMaxLen = Math.max(cleanQuery.length, lowerName.length);
    const mainSim = 1 - mainDist / mainMaxLen;
    if (mainSim > 0.65 && mainSim > bestScore) {
      bestScore = mainSim * 0.88;
    }

    // Also match category or season or cropGroup
    if (crop.season && crop.season.toLowerCase().startsWith(cleanQuery)) {
      if (bestScore < 0.82) bestScore = 0.82;
    }
    if (crop.cropGroup && crop.cropGroup.toLowerCase().includes(cleanQuery)) {
      if (bestScore < 0.8) bestScore = 0.8;
    }

    if (bestScore > 0.5) {
      results.push({ crop, score: bestScore, matchedAlias });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}
