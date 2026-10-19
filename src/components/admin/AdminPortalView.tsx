import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Database,
  Gauge,
  Zap,
  RefreshCw,
  LogOut,
  AlertOctagon,
  CheckCircle2,
  FileCheck,
  Building2,
} from 'lucide-react';
import { AdminProfile, AdminMetrics } from '../../types';
import { getRegisteredFarmers } from '../../services/authService';

interface AdminPortalViewProps {
  admin: AdminProfile;
  onLogout: () => void;
  onOpenTestModal: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  admin,
  onLogout,
  onOpenTestModal,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [farmers, setFarmers] = useState(() => getRegisteredFarmers());
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchMsg, setPrefetchMsg] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerPrefetch = async () => {
    setIsPrefetching(true);
    setPrefetchMsg(null);
    try {
      const res = await fetch('/api/admin/prefetch', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPrefetchMsg(`Pre-fetched ${data.prefetchedCount} top crop/mandi records into 6h cache!`);
        fetchMetrics();
      }
    } catch {
      setPrefetchMsg('Prefetch job failed');
    } finally {
      setIsPrefetching(false);
    }
  };

  const totalLookups = (metrics?.cache.hits || 0) + (metrics?.cache.misses || 0);
  const hitRatio = totalLookups > 0 ? Math.round(((metrics?.cache.hits || 0) / totalLookups) * 100) : 100;

  return (
    <div id="admin-portal-container" className="space-y-4">
      {/* Admin Header Bar */}
      <div className="bg-blue-950 text-white rounded-2xl p-5 shadow-sm border border-blue-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {admin.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {admin.accessLevel}
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-0.5">
                Marketplace System Governance · Security Code: {admin.adminCode} · Authorized Mobile: +91 {admin.mobile}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenTestModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-800 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Run 12 Acceptance Tests
            </button>

            <button
              type="button"
              id="admin-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-blue-900/80 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-blue-200 text-[11px] block">Rate Limiter Quota</span>
            <strong className="text-base text-white">
              {metrics?.rateLimiter.availableTokens ?? '--'} / {metrics?.rateLimiter.maxCapacity ?? 20} Tokens
            </strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-blue-200 text-[11px] block">6-Hour Cache Hit Ratio</span>
            <strong className="text-base text-emerald-300">{hitRatio}% Efficient</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-blue-200 text-[11px] block">Registered Farmers</span>
            <strong className="text-base text-white">{farmers.length} Kisans</strong>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-blue-200 text-[11px] block">Monitored Mandis</span>
            <strong className="text-base text-amber-300">{metrics?.mandisCount ?? 46} APMCs</strong>
          </div>
        </div>
      </div>

      {/* Admin Action: Manual Background Prefetch Trigger */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            Scheduled 6-Hour Background Prefetch Engine
          </h4>
          <p className="text-[11px] text-stone-500">
            Pre-fetches and caches top crop/mandi queries every 6 hours so lookups are served immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerPrefetch}
          disabled={isPrefetching}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPrefetching ? 'animate-spin' : ''}`} />
          {isPrefetching ? 'Pre-fetching...' : 'Execute Prefetch Job Now'}
        </button>
      </div>

      {prefetchMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          {prefetchMsg}
        </div>
      )}

      {/* Two Column Layout: Registered Farmers Directory & API Audit Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Registered Farmers (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-emerald-800" />
              Registered Farmers Registry
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              Accounts created via mobile OTP verification
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {farmers.map(f => (
                <div key={f.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-stone-900">{f.name}</strong>
                      <div className="text-[10px] text-stone-500 font-mono">+91 {f.mobile}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {f.landAcres} Acres
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    Village {f.village}, {f.district}, {f.state}
                  </div>
                  <div className="text-[10px] text-stone-500 flex justify-between pt-1 border-t border-stone-200/60">
                    <span>Crops: {f.primaryCrops.join(', ')}</span>
                    <span className="font-mono">{f.kisanId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: API Telemetry and Data Gaps (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 mb-1">
              <AlertOctagon className="w-4 h-4 text-stone-700" />
              External API Call &amp; Data Gap Telemetry
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              Logs every live/cached/fallback request so administrators can identify data gaps.
            </p>

            <div className="overflow-x-auto border border-stone-200 rounded-xl max-h-80 overflow-y-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-2.5">Time</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5">Commodity &amp; Market</th>
                    <th className="py-2 px-2.5 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[10px]">
                  {metrics?.recentLogs && metrics.recentLogs.length > 0 ? (
                    metrics.recentLogs.map(log => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="py-1.5 px-2.5 text-stone-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'FALLBACK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status} ({log.statusCode})
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-stone-800 max-w-[160px] truncate">
                          {log.queryParams.commodity} · {log.queryParams.market}
                        </td>
                        <td className="py-1.5 px-2.5 text-right text-stone-500">{log.latencyMs}ms</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-stone-400 font-sans">
                        No telemetry logs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
