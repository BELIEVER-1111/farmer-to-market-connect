import {
  FarmerLot,
  OperatorWeighmentSlip,
  MonthlyHistoryRecord,
  LotTrackingStage,
  LotTrackingEvent,
  TransportDetails,
  EscrowDetails,
} from '../types';

const LOTS_STORAGE_KEY = 'agri_farmer_lots_store';
const SLIPS_STORAGE_KEY = 'agri_operator_slips_store';

export const TRACKING_STAGE_ORDER: LotTrackingStage[] = [
  'LISTED',
  'WEIGHED_IN_MANDI',
  'ASSAYED_CERTIFIED',
  'ESCROW_LOCKED',
  'IN_TRANSIT',
  'DELIVERED_PAID',
];

export const INITIAL_SAMPLE_LOTS: FarmerLot[] = [
  {
    id: 'lot_101',
    farmerId: 'farmer_ramesh_01',
    farmerName: 'Ramesh Patel',
    farmerMobile: '9876543210',
    cropName: 'Tomato',
    variety: 'Hybrid Vaishali',
    quantityQuintals: 45,
    expectedPricePerQtl: 1200,
    targetMandi: 'Vijayawada Mandi',
    harvestDate: '2026-09-16',
    status: 'IN_TRANSIT',
    trackingStage: 'IN_TRANSIT',
    highestBidPrice: 1240,
    buyerName: 'ITC e-Choupal Sourcing Hub',
    buyerLocation: 'Guntur Processing Facility, Hub-4',
    paymentStatus: 'ESCROW_HELD',
    netPayout: 55800,
    weighmentTonnes: 4.5,
    qualityAssayGrade: 'Grade-A Prime (FAQ)',
    moisturePct: 11.2,
    gatePassNo: 'GP-APMC-8821',
    transport: {
      transporterName: 'Kisan Vahan Logistics Network',
      vehicleNumber: 'AP 16 TX 4920',
      driverName: 'Ravi Kumar',
      driverMobile: '9440512890',
      sourceLocation: 'Vijayawada APMC Yard Gate 2',
      destinationHub: 'ITC Agri-Food Park, Guntur NH-16',
      gpsCurrentLocation: 'NH-16 Mangalagiri Bypass (18 km to Destination)',
      dispatchTime: 'Today, 08:30 AM',
      estimatedArrival: 'Today, 11:15 AM (On Schedule)',
      routeDistanceKm: 42,
    },
    escrow: {
      escrowId: 'ESC-SBI-2026-9912',
      escrowBank: 'State Bank of India (Agri-Escrow Trust)',
      amountLocked: 55800,
      lockedAt: '2026-09-16T11:45:00Z',
      releaseStatus: 'LOCKED',
      payoutAccount: 'ramesh.farmer@upi / SBI A/c ...3902',
    },
    createdAt: '2026-09-16T10:30:00Z',
  },
  {
    id: 'lot_102',
    farmerId: 'farmer_ramesh_01',
    farmerName: 'Ramesh Patel',
    farmerMobile: '9876543210',
    cropName: 'Green Chilli',
    variety: 'Guntur Hot Teja',
    quantityQuintals: 20,
    expectedPricePerQtl: 3800,
    targetMandi: 'Guntur Mirchi Yard',
    harvestDate: '2026-09-17',
    status: 'LISTED',
    trackingStage: 'LISTED',
    highestBidPrice: 3850,
    buyerName: 'BigBasket Fresh Agritech',
    paymentStatus: 'PENDING',
    createdAt: '2026-09-17T07:15:00Z',
  },
  {
    id: 'lot_103',
    farmerId: 'farmer_shankar_02',
    farmerName: 'Shankar Goud',
    farmerMobile: '9440112233',
    cropName: 'Cotton',
    variety: 'Bt Cotton Shankar-6',
    quantityQuintals: 60,
    expectedPricePerQtl: 6800,
    targetMandi: 'Warangal Enamamula Mandi',
    harvestDate: '2026-09-15',
    status: 'PAYMENT_RECEIVED',
    trackingStage: 'DELIVERED_PAID',
    highestBidPrice: 6920,
    buyerName: 'Cotton Corporation Sourcing Hub',
    buyerLocation: 'Warangal Spinning Mills Yard',
    paymentStatus: 'SETTLED_TO_BANK',
    netPayout: 415200,
    weighmentTonnes: 6.0,
    qualityAssayGrade: 'Grade-A Prime Export Quality',
    moisturePct: 8.5,
    gatePassNo: 'GP-WGL-3419',
    transport: {
      transporterName: 'Telangana Rythu Cargo Express',
      vehicleNumber: 'TS 03 UB 7712',
      driverName: 'Venkat Reddy',
      driverMobile: '9849123098',
      sourceLocation: 'Warangal Enamamula Mandi Gate 1',
      destinationHub: 'Cotton Corp Depot, Warangal Industrial Area',
      gpsCurrentLocation: 'Delivered at Depot Gate 3',
      dispatchTime: '2026-09-15, 09:45 AM',
      estimatedArrival: 'Delivered on 2026-09-15, 12:30 PM',
      routeDistanceKm: 26,
    },
    escrow: {
      escrowId: 'ESC-SBI-2026-7841',
      escrowBank: 'State Bank of India (Agri-Escrow Trust)',
      amountLocked: 415200,
      lockedAt: '2026-09-15T10:15:00Z',
      releaseStatus: 'RELEASED_TO_FARMER',
      releasedAt: '2026-09-15T13:00:00Z',
      utrNumber: 'SBIN26091588391024',
      payoutAccount: 'shankar.goud@upi / Canara Bank A/c ...8129',
    },
    createdAt: '2026-09-15T09:00:00Z',
  },
];

export function getStoredLots(): FarmerLot[] {
  try {
    const raw = localStorage.getItem(LOTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LOTS));
      return INITIAL_SAMPLE_LOTS;
    }
    const parsed: FarmerLot[] = JSON.parse(raw);
    // Ensure all lots have trackingStage
    return parsed.map(l => ({
      ...l,
      trackingStage: l.trackingStage || (l.status === 'PAYMENT_RECEIVED' ? 'DELIVERED_PAID' : l.status === 'WEIGHED_IN_MANDI' ? 'WEIGHED_IN_MANDI' : 'LISTED'),
    }));
  } catch {
    return INITIAL_SAMPLE_LOTS;
  }
}

export function saveLots(lots: FarmerLot[]): void {
  localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
}

export function getLotById(lotId: string): FarmerLot | null {
  const lots = getStoredLots();
  const clean = lotId.trim().toLowerCase();
  return lots.find(l => l.id.toLowerCase() === clean || l.id.toLowerCase().replace('_', '-') === clean) || null;
}

export function searchLots(query: string): FarmerLot[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];
  const lots = getStoredLots();
  return lots.filter(
    l =>
      l.id.toLowerCase().includes(clean) ||
      l.farmerName.toLowerCase().includes(clean) ||
      l.farmerMobile.includes(clean) ||
      l.cropName.toLowerCase().includes(clean) ||
      (l.transport?.vehicleNumber && l.transport.vehicleNumber.toLowerCase().includes(clean))
  );
}

export function createFarmerLot(lot: Omit<FarmerLot, 'id' | 'createdAt' | 'status' | 'trackingStage'>): FarmerLot {
  const lots = getStoredLots();
  const newLot: FarmerLot = {
    ...lot,
    id: `lot_${Date.now().toString().slice(-4)}`,
    status: 'LISTED',
    trackingStage: 'LISTED',
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  lots.unshift(newLot);
  saveLots(lots);
  return newLot;
}

export function updateLotStatus(
  lotId: string,
  status: FarmerLot['status'],
  additional?: Partial<FarmerLot>
): FarmerLot | null {
  const lots = getStoredLots();
  const idx = lots.findIndex(l => l.id === lotId);
  if (idx < 0) return null;

  lots[idx] = {
    ...lots[idx],
    status,
    ...additional,
  };
  saveLots(lots);
  return lots[idx];
}

// Full 6-Stage Tracking Lifecycle Generator
export function getLotTrackingTimeline(lot: FarmerLot): LotTrackingEvent[] {
  const currentStageIndex = TRACKING_STAGE_ORDER.indexOf(lot.trackingStage || 'LISTED');

  const getStatus = (targetStage: LotTrackingStage): 'COMPLETED' | 'ACTIVE' | 'UPCOMING' => {
    const targetIndex = TRACKING_STAGE_ORDER.indexOf(targetStage);
    if (targetIndex < currentStageIndex) return 'COMPLETED';
    if (targetIndex === currentStageIndex) return 'ACTIVE';
    return 'UPCOMING';
  };

  const payoutAmt = lot.netPayout || (lot.quantityQuintals * (lot.highestBidPrice || lot.expectedPricePerQtl));

  return [
    {
      stage: 'LISTED',
      title: 'Produce Harvest Listed',
      titleHi: 'फ़सल सूचीकरण एवं विवरण',
      description: `Farmer ${lot.farmerName} listed ${lot.quantityQuintals} Quintals of ${lot.cropName} (${lot.variety}) at target ${lot.targetMandi}.`,
      timestamp: new Date(lot.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      location: `${lot.targetMandi} Catchment`,
      verifiedBy: 'Farmer Self-Declaration via Mobile OTP',
      status: getStatus('LISTED'),
      details: {
        quantity: `${lot.quantityQuintals} Qtl`,
        expectedRate: `₹${lot.expectedPricePerQtl}/Qtl`,
        farmerMobile: `+91 ${lot.farmerMobile}`,
      },
    },
    {
      stage: 'WEIGHED_IN_MANDI',
      title: 'Mandi Gate Entry & Electronic Weighment',
      titleHi: 'मंडी गेट आवक एवं डिजिटल तोल',
      description: lot.weighmentTonnes
        ? `Weighbridge recorded gross weight of ${lot.weighmentTonnes} Tonnes (~${Math.round(lot.weighmentTonnes * 10)} Qtl net). Gate Pass issued.`
        : `Vehicle arriving at APMC Mandi weighbridge for tare & gross computerized weighment.`,
      timestamp: lot.weighmentTonnes ? 'Verified at Mandi Weighbridge' : 'Awaiting Gate Arrival',
      location: `${lot.targetMandi} Yard Electronic Weighbridge`,
      verifiedBy: 'APMC Certified Weighbridge Operator',
      status: getStatus('WEIGHED_IN_MANDI'),
      details: {
        grossWeight: lot.weighmentTonnes ? `${lot.weighmentTonnes} Tonnes` : 'Pending Weighment',
        gatePass: lot.gatePassNo || 'Pending',
      },
    },
    {
      stage: 'ASSAYED_CERTIFIED',
      title: 'Quality Assaying & Digital Certification',
      titleHi: 'गुणवत्ता परीक्षण एवं डिजिटल प्रमाण-पत्र',
      description: lot.qualityAssayGrade
        ? `Quality certified as ${lot.qualityAssayGrade} with ${lot.moisturePct || 11.2}% moisture content. Digital assay certificate attached.`
        : `Physical sampling and moisture testing pending by Mandi Quality Assayer.`,
      timestamp: lot.qualityAssayGrade ? 'Quality Lab Verified' : 'In Queue for Assay Test',
      location: `${lot.targetMandi} Assaying Lab`,
      verifiedBy: 'Govt. Empaneled Assaying Chemist',
      status: getStatus('ASSAYED_CERTIFIED'),
      details: {
        grade: lot.qualityAssayGrade || 'Pending Lab Test',
        moisture: lot.moisturePct ? `${lot.moisturePct}%` : 'Pending',
      },
    },
    {
      stage: 'ESCROW_LOCKED',
      title: 'Buyer Match & Bank Escrow Deposit',
      titleHi: 'क्रेता सौदा एवं बैंक एस्क्रो में सुरक्षित जमा',
      description: lot.buyerName
        ? `Winning bid of ₹${lot.highestBidPrice || lot.expectedPricePerQtl}/Qtl accepted by ${lot.buyerName}. Total ₹${payoutAmt.toLocaleString('en-IN')} locked safely in SBI Agri-Escrow Trust.`
        : `Auction open for verified institutional buyers and food processors.`,
      timestamp: lot.buyerName ? 'Payment Guarantee Active' : 'Matching Bids',
      location: 'National E-Auction & Escrow Gateway',
      verifiedBy: 'State Bank of India (Escrow Trustee)',
      status: getStatus('ESCROW_LOCKED'),
      details: {
        buyer: lot.buyerName || 'Open for Bids',
        bidRate: `₹${lot.highestBidPrice || lot.expectedPricePerQtl}/Qtl`,
        escrowRef: lot.escrow?.escrowId || 'ESC-SBI-PENDING',
        lockedAmount: `₹${payoutAmt.toLocaleString('en-IN')}`,
        protection: '100% Guaranteed Farmer Payout on Delivery',
      },
    },
    {
      stage: 'IN_TRANSIT',
      title: 'Logistics Dispatch & Live GPS Tracking',
      titleHi: 'वाहन लोडिंग, प्रस्थान एवं लाइव GPS ट्रैकिंग',
      description: lot.transport
        ? `Loaded onto vehicle ${lot.transport.vehicleNumber}. Driver ${lot.transport.driverName} is in transit to ${lot.transport.destinationHub}.`
        : `Transport vehicle assignment in progress. Driver & vehicle will be allocated upon loading.`,
      timestamp: lot.transport?.dispatchTime || 'Awaiting Dispatch',
      location: lot.transport?.gpsCurrentLocation || 'At Mandi Dispatch Bay',
      verifiedBy: 'Rythu Logistics Fleet Controller',
      status: getStatus('IN_TRANSIT'),
      details: {
        vehicle: lot.transport?.vehicleNumber || 'To Be Assigned',
        driver: lot.transport?.driverName ? `${lot.transport.driverName} (+91 ${lot.transport.driverMobile})` : '--',
        currentLocation: lot.transport?.gpsCurrentLocation || 'Mandi Yard',
        eta: lot.transport?.estimatedArrival || 'Estimated 2-4 hours',
        distance: lot.transport?.routeDistanceKm ? `${lot.transport.routeDistanceKm} km` : '--',
      },
    },
    {
      stage: 'DELIVERED_PAID',
      title: 'Delivery Confirmation & Instant Bank Payout',
      titleHi: 'सुपुर्दगी सत्यापित एवं बैंक खाते में तत्काल अंतरण',
      description: lot.paymentStatus === 'SETTLED_TO_BANK'
        ? `Buyer acknowledged delivery at destination hub. Escrow funds ₹${payoutAmt.toLocaleString('en-IN')} directly transferred to Farmer's Account. UTR: ${lot.escrow?.utrNumber || 'SBIN26091588391'}.`
        : `Upon buyer delivery QR scan, the Escrow Trust auto-releases ₹${payoutAmt.toLocaleString('en-IN')} directly into the Farmer's Bank Account/UPI within 60 seconds.`,
      timestamp: lot.paymentStatus === 'SETTLED_TO_BANK' ? 'Payment Settled' : 'Pending Delivery Sign-off',
      location: lot.buyerLocation || 'Buyer Processing Facility',
      verifiedBy: 'Automated Banking Escrow Smart Clearing',
      status: getStatus('DELIVERED_PAID'),
      details: {
        settledAmount: `₹${payoutAmt.toLocaleString('en-IN')}`,
        payoutAccount: lot.escrow?.payoutAccount || `Farmer UPI / Bank Direct`,
        utrNumber: lot.escrow?.utrNumber || (lot.paymentStatus === 'SETTLED_TO_BANK' ? 'SBIN26091588391' : 'Will generate upon delivery'),
      },
    },
  ];
}

// Advance a lot to the next stage in the operational lifecycle
export function advanceLotStage(
  lotId: string,
  targetStage: LotTrackingStage,
  payload?: Partial<FarmerLot>
): FarmerLot | null {
  const lots = getStoredLots();
  const idx = lots.findIndex(l => l.id === lotId);
  if (idx < 0) return null;

  const currentLot = lots[idx];
  const payout = currentLot.netPayout || (currentLot.quantityQuintals * (currentLot.highestBidPrice || currentLot.expectedPricePerQtl));

  const updated: FarmerLot = {
    ...currentLot,
    ...payload,
    trackingStage: targetStage,
  };

  // Auto-enrich based on stage
  if (targetStage === 'WEIGHED_IN_MANDI') {
    updated.status = 'WEIGHED_IN_MANDI';
    if (!updated.weighmentTonnes) updated.weighmentTonnes = Math.round((currentLot.quantityQuintals / 10) * 10) / 10;
    if (!updated.gatePassNo) updated.gatePassNo = `GP-APMC-${Math.floor(1000 + Math.random() * 9000)}`;
  } else if (targetStage === 'ASSAYED_CERTIFIED') {
    updated.status = 'WEIGHED_IN_MANDI';
    if (!updated.qualityAssayGrade) updated.qualityAssayGrade = 'Grade-A Prime (FAQ)';
    if (!updated.moisturePct) updated.moisturePct = 10.8;
  } else if (targetStage === 'ESCROW_LOCKED') {
    updated.status = 'BID_RECEIVED';
    updated.paymentStatus = 'ESCROW_HELD';
    if (!updated.buyerName) updated.buyerName = 'BigBasket Agritech Sourcing Hub';
    if (!updated.highestBidPrice) updated.highestBidPrice = Math.round(currentLot.expectedPricePerQtl * 1.05);
    updated.netPayout = updated.quantityQuintals * (updated.highestBidPrice || currentLot.expectedPricePerQtl);
    updated.escrow = {
      escrowId: `ESC-SBI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      escrowBank: 'State Bank of India (Agri-Escrow Trust)',
      amountLocked: updated.netPayout,
      lockedAt: new Date().toISOString(),
      releaseStatus: 'LOCKED',
      payoutAccount: `+91 ${currentLot.farmerMobile}@upi`,
    };
  } else if (targetStage === 'IN_TRANSIT') {
    updated.status = 'IN_TRANSIT';
    updated.paymentStatus = 'ESCROW_HELD';
    if (!updated.transport) {
      updated.transport = {
        transporterName: 'Kisan Vahan Express Transport',
        vehicleNumber: `AP 16 TX ${Math.floor(1000 + Math.random() * 9000)}`,
        driverName: 'Srinivas Rao',
        driverMobile: '9848099881',
        sourceLocation: `${currentLot.targetMandi} Dispatch Yard`,
        destinationHub: `${updated.buyerName || 'Buyer'} Central Processing Hub`,
        gpsCurrentLocation: 'Departed Mandi, En Route on National Highway (Live GPS Active)',
        dispatchTime: 'Just Now',
        estimatedArrival: 'In 2 hours 30 mins',
        routeDistanceKm: 38,
      };
    }
  } else if (targetStage === 'DELIVERED_PAID') {
    updated.status = 'PAYMENT_RECEIVED';
    updated.paymentStatus = 'SETTLED_TO_BANK';
    updated.netPayout = payout;
    if (!updated.escrow) {
      updated.escrow = {
        escrowId: `ESC-SBI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        escrowBank: 'State Bank of India (Agri-Escrow Trust)',
        amountLocked: payout,
        lockedAt: new Date().toISOString(),
        releaseStatus: 'RELEASED_TO_FARMER',
        releasedAt: new Date().toISOString(),
        utrNumber: `SBIN260919${Math.floor(10000000 + Math.random() * 90000000)}`,
        payoutAccount: `+91 ${currentLot.farmerMobile}@upi`,
      };
    } else {
      updated.escrow = {
        ...updated.escrow,
        releaseStatus: 'RELEASED_TO_FARMER',
        releasedAt: new Date().toISOString(),
        utrNumber: `SBIN260919${Math.floor(10000000 + Math.random() * 90000000)}`,
      };
    }
    if (updated.transport) {
      updated.transport.gpsCurrentLocation = 'Delivered & Accepted at Buyer Facility Dock';
      updated.transport.estimatedArrival = 'Delivered';
    }
  }

  lots[idx] = updated;
  saveLots(lots);
  return updated;
}

// Operator slips store
export function getOperatorSlips(): OperatorWeighmentSlip[] {
  try {
    const raw = localStorage.getItem(SLIPS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addOperatorSlip(slip: OperatorWeighmentSlip): void {
  const slips = getOperatorSlips();
  slips.unshift(slip);
  localStorage.setItem(SLIPS_STORAGE_KEY, JSON.stringify(slips));
}

// 12-Month Market History Generator
export function generateMarketHistory(cropName: string, basePrice: number = 2200): MonthlyHistoryRecord[] {
  const months = [
    { name: 'Oct 2025', season: 'Kharif' as const, factor: 0.92, arrivalFactor: 1.4 },
    { name: 'Nov 2025', season: 'Kharif' as const, factor: 0.88, arrivalFactor: 1.6 },
    { name: 'Dec 2025', season: 'Rabi' as const, factor: 0.95, arrivalFactor: 1.2 },
    { name: 'Jan 2026', season: 'Rabi' as const, factor: 1.02, arrivalFactor: 0.9 },
    { name: 'Feb 2026', season: 'Rabi' as const, factor: 1.08, arrivalFactor: 0.8 },
    { name: 'Mar 2026', season: 'Rabi' as const, factor: 1.15, arrivalFactor: 1.3 },
    { name: 'Apr 2026', season: 'Zaid' as const, factor: 1.12, arrivalFactor: 1.1 },
    { name: 'May 2026', season: 'Zaid' as const, factor: 1.05, arrivalFactor: 0.8 },
    { name: 'Jun 2026', season: 'Off-Season' as const, factor: 1.18, arrivalFactor: 0.5 },
    { name: 'Jul 2026', season: 'Kharif' as const, factor: 1.22, arrivalFactor: 0.6 },
    { name: 'Aug 2026', season: 'Kharif' as const, factor: 1.10, arrivalFactor: 0.9 },
    { name: 'Sep 2026', season: 'Kharif' as const, factor: 1.04, arrivalFactor: 1.2 },
  ];

  return months.map(m => {
    const modal = Math.round(basePrice * m.factor);
    const min = Math.round(modal * 0.88);
    const max = Math.round(modal * 1.14);
    const totalArrival = Math.round(1800 * m.arrivalFactor);

    return {
      month: m.name,
      year: 2026,
      avgModalPrice: modal,
      minPrice: min,
      maxPrice: max,
      totalArrivalTonnes: totalArrival,
      seasonName: m.season,
    };
  });
}
