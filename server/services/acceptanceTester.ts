import { lookupCropPrice, CropPriceLookupResult } from './priceCacheService.js';

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

export const ACCEPTANCE_TEST_CASES = [
  { id: 1, cropName: 'Tomato', state: 'Andhra Pradesh', district: 'Krishna', market: 'Vijayawada Mandi' },
  { id: 2, cropName: 'Onion', state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon Onion Mandi' },
  { id: 3, cropName: 'Potato', state: 'Uttar Pradesh', district: 'Agra', market: 'Agra Fatehabad Road Mandi' },
  { id: 4, cropName: 'Wheat', state: 'Punjab', district: 'Ludhiana', market: 'Khanna Grain Market' },
  { id: 5, cropName: 'Cotton', state: 'Gujarat', district: 'Rajkot', market: 'Rajkot APMC Bedi Yard' },
  { id: 6, cropName: 'Soyabean', state: 'Madhya Pradesh', district: 'Indore', market: 'Indore Chhoithram Mandi' },
  { id: 7, cropName: 'Bengal Gram (Gram/Chana)', state: 'Karnataka', district: 'Dharwad', market: 'Hubballi Amargol APMC' },
  { id: 8, cropName: 'Mustard', state: 'Rajasthan', district: 'Kota', market: 'Kota Bhamashah Mandi' },
  { id: 9, cropName: 'Green Chilli', state: 'Andhra Pradesh', district: 'Guntur', market: 'Guntur Mirchi Yard' },
  { id: 10, cropName: 'Turmeric', state: 'Telangana', district: 'Nizamabad', market: 'Nizamabad APMC Market' },
  { id: 11, cropName: 'Maize', state: 'Karnataka', district: 'Belagavi', market: 'Belagavi APMC' },
  { id: 12, cropName: 'Arhar (Tur/Red Gram)', state: 'Maharashtra', district: 'Nagpur', market: 'Nagpur Kalamna Mandi' },
];

/**
 * Execute the automated acceptance test suite
 */
export async function runAcceptanceTests(): Promise<AcceptanceTestReport> {
  const overallStart = Date.now();
  const results: TestResultItem[] = [];

  for (const testCase of ACCEPTANCE_TEST_CASES) {
    const itemStart = Date.now();
    try {
      const response: CropPriceLookupResult = await lookupCropPrice(
        testCase.cropName,
        testCase.state,
        testCase.district,
        testCase.market
      );

      const itemDuration = Date.now() - itemStart;

      const hasValidPrice =
        typeof response.currentPrice?.modalPrice === 'number' &&
        response.currentPrice.modalPrice > 0 &&
        response.currentPrice.minPrice > 0 &&
        response.currentPrice.maxPrice >= response.currentPrice.minPrice;

      const hasSourceTag =
        typeof response.freshness?.sourceTag === 'string' &&
        response.freshness.sourceTag.includes('₹') &&
        response.freshness.sourceTag.includes('/quintal');

      const hasTrendData =
        Array.isArray(response.history7d) &&
        response.history7d.length >= 7 &&
        Array.isArray(response.history30d) &&
        response.history30d.length >= 25;

      const hasSellWindow =
        Boolean(response.sellWindow) &&
        typeof response.sellWindow.headline === 'string' &&
        typeof response.sellWindow.oneLiner === 'string';

      const hasValidStructure = Boolean(response.commodity && response.actualReportingMarket);

      const passed = hasValidPrice && hasSourceTag && hasTrendData && hasSellWindow && hasValidStructure;

      let responseType: TestResultItem['responseType'] = 'LIVE_API';
      if (response.freshness.isFromCache) {
        responseType = 'CACHED';
      } else if (!response.isExactMarket || response.fallbackReason) {
        responseType = 'GRACEFUL_FALLBACK';
      }

      results.push({
        id: testCase.id,
        cropName: testCase.cropName,
        state: testCase.state,
        district: testCase.district,
        market: testCase.market,
        passed,
        responseType,
        modalPrice: response.currentPrice.modalPrice,
        sourceTag: response.freshness.sourceTag,
        sellWindowHeadline: response.sellWindow.headline,
        assertions: {
          hasValidPrice,
          hasSourceTag,
          hasTrendData,
          hasSellWindow,
          hasValidStructure,
        },
        durationMs: itemDuration,
      });
    } catch (err: any) {
      results.push({
        id: testCase.id,
        cropName: testCase.cropName,
        state: testCase.state,
        district: testCase.district,
        market: testCase.market,
        passed: false,
        responseType: 'GRACEFUL_FALLBACK',
        modalPrice: 0,
        sourceTag: 'Error',
        sellWindowHeadline: 'Failed',
        assertions: {
          hasValidPrice: false,
          hasSourceTag: false,
          hasTrendData: false,
          hasSellWindow: false,
          hasValidStructure: false,
        },
        durationMs: Date.now() - itemStart,
        error: err.message || 'Unknown error during lookup',
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0 && passedCount >= 10,
    durationMs: Date.now() - overallStart,
    results,
  };
}
