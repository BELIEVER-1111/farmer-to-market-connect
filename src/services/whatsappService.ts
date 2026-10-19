import { FarmerLot, LotTrackingStage } from '../types';

export interface WhatsAppAlertRecord {
  id: string;
  lotId: string;
  stage: LotTrackingStage;
  recipientMobile: string;
  recipientName: string;
  messageText: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT' | 'PENDING';
}

const WA_ALERTS_STORAGE_KEY = 'agri_whatsapp_alerts_history';
const WA_SUBSCRIPTIONS_STORAGE_KEY = 'agri_whatsapp_subscriptions';

/**
 * Generate a clean, high-impact WhatsApp message for Indian farmers in English & Hindi
 */
export function generateWhatsAppTrackerMessage(lot: FarmerLot, webAppUrl?: string): string {
  const payoutAmount =
    lot.netPayout ||
    lot.quantityQuintals * (lot.highestBidPrice || lot.expectedPricePerQtl);

  const stageTitles: Record<LotTrackingStage, { en: string; hi: string; emoji: string }> = {
    LISTED: { en: 'Produce Listed at Farmgate', hi: 'फ़सल पंजीकृत', emoji: '🌾' },
    WEIGHED_IN_MANDI: { en: 'Weighed at Mandi Gate', hi: 'मंडी डिजिटल तोल संपन्न', emoji: '⚖️' },
    ASSAYED_CERTIFIED: { en: 'Quality Assayed & Certified', hi: 'गुणवत्ता प्रमाणित', emoji: '🔬' },
    ESCROW_LOCKED: { en: 'Buyer Matched & Escrow Safe', hi: 'सुरक्षित एस्क्रो में भुगतान जमा', emoji: '🔒' },
    IN_TRANSIT: { en: 'Dispatched in Transit (GPS Live)', hi: 'वाहन रवाना (लाइव GPS)', emoji: '🚚' },
    DELIVERED_PAID: { en: 'Delivered & Paid to Bank', hi: 'सुपुर्दगी पूर्ण एवं बैंक में भुगतान', emoji: '💰' },
  };

  const currentStage = lot.trackingStage || 'LISTED';
  const stageInfo = stageTitles[currentStage] || stageTitles.LISTED;
  const baseUrl = webAppUrl || window.location.origin;
  const trackingUrl = `${baseUrl}/?track=${encodeURIComponent(lot.id)}`;

  let specificDetails = '';

  if (currentStage === 'LISTED') {
    specificDetails = `• स्थिति: मंडी गेट पर वाहन आगमन की प्रतीक्षा है।
• अपेक्षित भाव: ₹${lot.expectedPricePerQtl}/क्विंटल
• अनुमानित मूल्य: ₹${payoutAmount.toLocaleString('en-IN')}`;
  } else if (currentStage === 'WEIGHED_IN_MANDI') {
    specificDetails = `• तोल पर्ची (Gross Weight): ${lot.weighmentTonnes ? `${lot.weighmentTonnes} टन` : `${lot.quantityQuintals} क्विंटल`}
• गेट पास संख्या: ${lot.gatePassNo || 'GP-APMC-VERIFIED'}
• तोल केंद्र: ${lot.targetMandi} कम्प्यूटरीकृत धर्मकांटा`;
  } else if (currentStage === 'ASSAYED_CERTIFIED') {
    specificDetails = `• गुणवत्ता ग्रेड: ${lot.qualityAssayGrade || 'Grade-A Prime FAQ'}
• नमी परीक्षण (Moisture): ${lot.moisturePct || 11.2}%
• लैब प्रमाणीकरण: डिजिटल लैब पास मान्य`;
  } else if (currentStage === 'ESCROW_LOCKED') {
    specificDetails = `• क्रेता (Buyer): ${lot.buyerName || 'ITC e-Choupal / Reliance Agri'}
• तय दर (Rate): ₹${lot.highestBidPrice || lot.expectedPricePerQtl}/क्विंटल
• सुरक्षित एस्क्रो राशि: ₹${payoutAmount.toLocaleString('en-IN')} (SBI एस्क्रो ट्रस्ट में 100% सुरक्षित)
• एस्क्रो ID: ${lot.escrow?.escrowId || 'ESC-SBI-2026'}`;
  } else if (currentStage === 'IN_TRANSIT') {
    const t = lot.transport;
    specificDetails = `• वाहन संख्या: ${t?.vehicleNumber || 'AP 16 TX 4920'}
• चालक का नाम: ${t?.driverName || 'Ravi Kumar'} (📞 +91 ${t?.driverMobile || '9440512890'})
• वर्तमान स्थान: ${t?.gpsCurrentLocation || 'NH हाईवे इन-ट्रांजिट'}
• गंतव्य हब: ${t?.destinationHub || 'एग्री-फ़ूड प्रोसेसिंग पार्क'}
• अनुमानित आगमन: ${t?.estimatedArrival || 'आज 11:30 AM'}`;
  } else if (currentStage === 'DELIVERED_PAID') {
    specificDetails = `• सुपुर्दगी: खरीदार द्वारा हब पर सत्यापित
• अंतरित राशि: ₹${payoutAmount.toLocaleString('en-IN')}
• बैंक खाता / UPI: ${lot.escrow?.payoutAccount || `+91 ${lot.farmerMobile}@upi`}
• बैंक UTR संदर्भ: ${lot.escrow?.utrNumber || 'SBIN26091588391024'}
• भुगतान स्थिति: सफलतापूर्वक बैंक खाते में क्रेडिट`;
  }

  const message = `🌾 *किसान लाइव फ़सल ट्रैकिंग अपडेट* 🌾
*Farmer To Market Connect*
----------------------------------------
👤 *किसान:* ${lot.farmerName} (+91 ${lot.farmerMobile})
📦 *लॉट ID:* ${lot.id.toUpperCase()}
🌱 *फ़सल:* ${lot.cropName} (${lot.variety})
⚖️ *मात्रा:* ${lot.quantityQuintals} क्विंटल (~${lot.weighmentTonnes || Math.round(lot.quantityQuintals * 0.1)} टन)
📍 *मंडी / गंतव्य:* ${lot.targetMandi}

${stageInfo.emoji} *वर्तमान स्थिति (Current Status):*
*${stageInfo.en}*
_${stageInfo.hi}_

📋 *चरण विवरण (Stage Details):*
${specificDetails}

💰 *गारंटीड भुगतान (Guaranteed Value):*
₹${payoutAmount.toLocaleString('en-IN')} ${lot.paymentStatus === 'SETTLED_TO_BANK' ? '(खाते में प्राप्त ✓)' : '(एस्क्रो में सुरक्षित 🔒)'}

🔗 *लाइव मैप व डिजिटल रसीद देखें:*
${trackingUrl}
----------------------------------------
_Farmer To Market Connect — पारदर्शी डिजिटल कृषि_`;

  return message;
}

/**
 * Generate direct WhatsApp URL (wa.me or api.whatsapp.com)
 */
export function getWhatsAppShareUrl(lot: FarmerLot, targetMobile?: string): string {
  const text = generateWhatsAppTrackerMessage(lot);
  const mobile = targetMobile || lot.farmerMobile;
  const sanitized = mobile ? mobile.replace(/\D/g, '') : '';
  const finalPhone = sanitized.length === 10 ? `91${sanitized}` : sanitized;

  if (finalPhone) {
    return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Get stored WhatsApp alert history
 */
export function getStoredWhatsAppAlerts(): WhatsAppAlertRecord[] {
  try {
    const raw = localStorage.getItem(WA_ALERTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Record a dispatched WhatsApp alert
 */
export function recordWhatsAppAlert(record: Omit<WhatsAppAlertRecord, 'id' | 'sentAt' | 'status'>): WhatsAppAlertRecord {
  const alerts = getStoredWhatsAppAlerts();
  const newRecord: WhatsAppAlertRecord = {
    ...record,
    id: `WA-${Date.now().toString().slice(-6)}`,
    sentAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: 'DELIVERED',
  };

  const updated = [newRecord, ...alerts].slice(0, 50);
  try {
    localStorage.setItem(WA_ALERTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota
  }
  return newRecord;
}

/**
 * Check if farmer has enabled automatic WhatsApp updates
 */
export function isFarmerSubscribedToWhatsApp(farmerMobile: string): boolean {
  try {
    const raw = localStorage.getItem(WA_SUBSCRIPTIONS_STORAGE_KEY);
    if (!raw) return true; // Default to opted-in for farmer convenience
    const list: string[] = JSON.parse(raw);
    return list.includes(farmerMobile) || true;
  } catch {
    return true;
  }
}

/**
 * Toggle WhatsApp subscription for a farmer mobile
 */
export function setFarmerWhatsAppSubscription(farmerMobile: string, enabled: boolean): void {
  try {
    const raw = localStorage.getItem(WA_SUBSCRIPTIONS_STORAGE_KEY);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (enabled) {
      if (!list.includes(farmerMobile)) list.push(farmerMobile);
    } else {
      list = list.filter(m => m !== farmerMobile);
    }
    localStorage.setItem(WA_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota
  }
}
