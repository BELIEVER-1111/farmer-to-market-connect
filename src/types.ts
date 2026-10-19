export type CropSeason = 'Kharif' | 'Rabi' | 'Zaid' | 'Multi-Season' | 'Perennial';
export type CropGroup = 'Major Food Crops' | 'Millets' | 'Pulses' | 'Cash and Commercial' | 'Oilseeds' | 'Seasonal Fruits & Vegetables' | 'Spices';

export interface CropInfo {
  id: string;
  name: string;
  scientificName?: string;
  category: 'Cereals' | 'Pulses' | 'Vegetables' | 'Fruits' | 'Oilseeds' | 'Spices' | 'Commercial';
  cropGroup?: CropGroup;
  season?: CropSeason;
  seasonTiming?: string;
  description?: string;
  primaryStates?: string[];
  benchmarkModalPrice?: number;
  mspPrice?: number;
  dailyTrendPct?: number;
  aliases: string[];
  varieties: string[];
  defaultUnit: 'Quintal' | 'Kg';
  shelfLifeDays: number;
}

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

export interface StateHierarchy {
  state: string;
  districts: {
    district: string;
    markets: MandiMarket[];
  }[];
}

export interface TrendDataPoint {
  date: string;
  dayLabel: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalVolumeTonnes: number;
}

export interface SellWindowRecommendation {
  action: 'SELL_NOW' | 'HOLD_AND_SELL_SOON' | 'STORE_AND_WAIT' | 'DISPATCH_IMMEDIATELY';
  headline: string;
  oneLiner: string;
  confidenceScore: number;
  trend7dPct: number;
  trend30dPct: number;
  arrivalMomentumPct: number;
  urgency: 'high' | 'medium' | 'low';
  optimalDaysWindow: string;
  estimatedPriceSwing: string;
}

export interface NearbyBetterMarket {
  mandiId: string;
  name: string;
  district: string;
  state: string;
  distanceKm: number;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  priceDifference: number;
  estTransportCostPerQtl: number;
  netExtraBenefitPerQtl: number;
  isRecommended: boolean;
}

export interface BuyerOffer {
  id: string;
  buyerName: string;
  buyerType: 'Institutional Buyer' | 'Processor' | 'FPO Aggregator' | 'Direct Exporter';
  verifiedStatus: boolean;
  offeredPrice: number;
  requiredVolumeQuintals: number;
  minQualitySpecs: {
    moistureMaxPct: number;
    grade: string;
    foreignMatterMaxPct: number;
  };
  pickupType: 'Farmgate Pickup' | 'Mandi Delivery' | 'Warehouse Delivery';
  paymentTerms: string;
  postedAgo: string;
}

export interface CropPriceLookupResult {
  commodity: string;
  cropId: string;
  variety: string;
  category: string;
  targetMarket: string;
  targetDistrict: string;
  targetState: string;
  isExactMarket: boolean;
  fallbackReason?: string;
  actualReportingMarket: string;
  actualReportingDistrict: string;
  actualReportingState: string;
  distanceToReportingMarketKm?: number;
  currentPrice: {
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    unit: 'quintal';
    arrivalVolumeTonnes: number;
  };
  freshness: {
    fetchedAtTimestamp: number;
    updatedAgoText: string;
    formattedDate: string;
    sourceTag: string;
    isFromCache: boolean;
  };
  history7d: TrendDataPoint[];
  history30d: TrendDataPoint[];
  sellWindow: SellWindowRecommendation;
  nearbyBetterMarkets: NearbyBetterMarket[];
  buyerOffers: BuyerOffer[];
  hasLivePrice: boolean;
}

export interface TestResultItem {
  id: number;
  cropName: string;
  state: string;
  district: string;
  market: string;
  passed: boolean;
  responseType: 'LIVE_API' | 'CACHED' | 'GRACEFUL_FALLBACK';
  modalPrice: number;
  sourceTag: string;
  sellWindowHeadline: string;
  assertions: {
    hasValidPrice: boolean;
    hasSourceTag: boolean;
    hasTrendData: boolean;
    hasSellWindow: boolean;
    hasValidStructure: boolean;
  };
  durationMs: number;
  error?: string;
}

export interface AcceptanceTestReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  durationMs: number;
  results: TestResultItem[];
}

export interface AdminMetrics {
  cache: {
    hits: number;
    misses: number;
    prefetches: number;
    lastPrefetchRun: number;
  };
  rateLimiter: {
    availableTokens: number;
    maxCapacity: number;
    refillRate: string;
  };
  recentLogs: {
    id: string;
    timestamp: string;
    endpoint: string;
    queryParams: Record<string, any>;
    status: 'SUCCESS' | 'FAILED' | 'THROTTLED' | 'FALLBACK';
    statusCode: number;
    latencyMs: number;
    message: string;
    errorDetails?: string;
  }[];
  totalLoggedCalls: number;
  mandisCount: number;
  cropsCount: number;
}

export type UserRole = 'farmer' | 'operator' | 'admin';

export interface FarmerProfile {
  id: string;
  name: string;
  mobile: string;
  state: string;
  district: string;
  village: string;
  landAcres: number;
  primaryCrops: string[];
  upiId: string;
  kisanId: string;
  preferredLanguage: 'en' | 'hi' | 'te' | 'mr';
}

export interface OperatorProfile {
  id: string;
  name: string;
  mobile: string;
  employeeId: string;
  mandiId: string;
  mandiName: string;
  mandiDistrict: string;
  department: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  mobile: string;
  adminCode: string;
  accessLevel: 'Super Admin' | 'Market Regulator';
}

export interface UserSession {
  role: UserRole;
  token: string;
  mobile: string;
  name: string;
  farmer?: FarmerProfile;
  operator?: OperatorProfile;
  admin?: AdminProfile;
}

export type LotTrackingStage =
  | 'LISTED'
  | 'WEIGHED_IN_MANDI'
  | 'ASSAYED_CERTIFIED'
  | 'ESCROW_LOCKED'
  | 'IN_TRANSIT'
  | 'DELIVERED_PAID';

export interface TransportDetails {
  transporterName: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  sourceLocation: string;
  destinationHub: string;
  gpsCurrentLocation: string;
  dispatchTime: string;
  estimatedArrival: string;
  routeDistanceKm: number;
}

export interface EscrowDetails {
  escrowId: string;
  escrowBank: string;
  amountLocked: number;
  lockedAt: string;
  releaseStatus: 'PENDING' | 'LOCKED' | 'RELEASED_TO_FARMER';
  releasedAt?: string;
  utrNumber?: string;
  payoutAccount: string;
}

export interface LotTrackingEvent {
  stage: LotTrackingStage;
  title: string;
  titleHi: string;
  description: string;
  timestamp: string;
  location: string;
  verifiedBy?: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  details?: Record<string, any>;
}

export interface FarmerLot {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  expectedPricePerQtl: number;
  targetMandi: string;
  harvestDate: string;
  status: 'LISTED' | 'WEIGHED_IN_MANDI' | 'BID_RECEIVED' | 'SOLD' | 'PAYMENT_RECEIVED' | 'IN_TRANSIT';
  trackingStage: LotTrackingStage;
  highestBidPrice?: number;
  buyerName?: string;
  buyerLocation?: string;
  paymentStatus?: 'PENDING' | 'ESCROW_HELD' | 'SETTLED_TO_BANK';
  netPayout?: number;
  weighmentTonnes?: number;
  qualityAssayGrade?: string;
  moisturePct?: number;
  gatePassNo?: string;
  transport?: TransportDetails;
  escrow?: EscrowDetails;
  trackingTimeline?: LotTrackingEvent[];
  createdAt: string;
}

export interface OperatorWeighmentSlip {
  slipId: string;
  lotId?: string;
  farmerName: string;
  farmerMobile: string;
  commodity: string;
  variety: string;
  grossWeightTonnes: number;
  netWeightQuintals: number;
  moisturePct: number;
  qualityGrade: 'Grade-A' | 'Grade-B' | 'Standard FAQ' | 'Sub-Standard';
  gatePassNo: string;
  timestamp: string;
  verifiedBy: string;
}

export interface MonthlyHistoryRecord {
  month: string;
  year: number;
  avgModalPrice: number;
  minPrice: number;
  maxPrice: number;
  totalArrivalTonnes: number;
  seasonName: 'Kharif' | 'Rabi' | 'Zaid' | 'Off-Season';
}

