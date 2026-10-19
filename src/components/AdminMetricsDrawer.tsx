import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Database, Gauge, AlertOctagon, CheckCircle2, Zap } from 'lucide-react';
import { AdminMetrics } from '../types';

interface AdminMetricsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMetricsDrawer: React.FC<AdminMetricsDrawerProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchMsg, setPrefetchMsg] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data: AdminMetrics = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 6000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    } catch (err) {
      setPrefetchMsg('Prefetch job trigger failed');
    } finally {
      setIsPrefetching(false);
    }
  };

  const totalLookups = (metrics?.cache.hits || 0) + (metrics?.cache.misses || 0);
  const hitRatio = totalLookups > 0 ? Math.round(((metrics?.cache.hits || 0) / totalLookups) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-stone-200">
        {/* Header */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-stone-800 text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Reliability & API Operations Console
              </h3>
              <p className="text-[11px] text-stone-500">
                Outbound Agmarknet rate limiter, 6h cache hit ratio & failure logs
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-admin-metrics-drawer"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 text-sm rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rate Limiter Status */}
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-800" />
                  Rate Limiter Quota
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                  Token Bucket
                </span>
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {metrics?.rateLimiter.availableTokens ?? '--'} / {metrics?.rateLimiter.maxCapacity ?? 20}
              </div>
              <div className="text-[10px] text-stone-500 mt-1">
                Refill rate: {metrics?.rateLimiter.refillRate ?? '2 req/sec'}
              </div>
            </div>

            {/* 6h Cache Hit Ratio */}
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50">
              <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-800" />
                  Cache Efficiency
                </span>
                <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-1.5 py-0.2 rounded">
                  6-Hour TTL
                </span>
              </div>
              <div className="text-xl font-extrabold text-stone-900">
                {hitRatio}% Hit Ratio
              </div>
              <div className="text-[10px] text-stone-500 mt-1 flex justify-between">
                <span>Hits: {metrics?.cache.hits ?? 0}</span>
                <span>Misses: {metrics?.cache.misses ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Scheduled Background Prefetch Section */}
          <div className="border border-stone-200 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Scheduled 6-Hour Background Prefetch
                </h4>
                <p className="text-[11px] text-stone-500">
                  Pre-loads popular crop/mandi pairs to guarantee sub-second responses.
                </p>
              </div>

              <button
                type="button"
                id="manual-prefetch-btn"
                onClick={handleTriggerPrefetch}
                disabled={isPrefetching}
                className="px-2.5 py-1 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isPrefetching ? 'animate-spin' : ''}`} />
                Run Now
              </button>
            </div>

            {prefetchMsg && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-1.5 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                {prefetchMsg}
              </div>
            )}

            <div className="text-[11px] text-stone-500 flex justify-between pt-1 border-t border-stone-100">
              <span>Cumulative Pre-fetches: <strong>{metrics?.cache.prefetches ?? 0}</strong></span>
              <span>
                Last Run:{' '}
                {metrics?.cache.lastPrefetchRun
                  ? new Date(metrics.cache.lastPrefetchRun).toLocaleTimeString()
                  : 'Boot Time'}
              </span>
            </div>
          </div>

          {/* External API Failure & Data Gap Logs */}
          <div className="border border-stone-200 rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-stone-600" />
                External API Call & Data Gap Telemetry
              </h4>
              <span className="text-[10px] text-stone-400 font-mono">
                {metrics?.recentLogs.length ?? 0} events logged
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-2.5">
              Logs every failed, throttled, or fallback call with timestamps & query parameters so data gaps are visible to administrators.
            </p>

            <div className="overflow-x-auto border border-stone-200 rounded-lg max-h-72 overflow-y-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-2.5">Time</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5">Query</th>
                    <th className="py-2 px-2.5">Details</th>
                    <th className="py-2 px-2.5 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[10px]">
                  {metrics?.recentLogs && metrics.recentLogs.length > 0 ? (
                    metrics.recentLogs.map(log => {
                      const timeStr = new Date(log.timestamp).toLocaleTimeString();
                      return (
                        <tr key={log.id} className="hover:bg-stone-50/80">
                          <td className="py-1.5 px-2.5 text-stone-500 whitespace-nowrap">{timeStr}</td>
                          <td className="py-1.5 px-2.5">
                            <span className={`px-1.5 py-0.2 rounded font-semibold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'FALLBACK'
                                ? 'bg-amber-100 text-amber-800'
                                : log.status === 'THROTTLED'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status} ({log.statusCode})
                            </span>
                          </td>
                          <td className="py-1.5 px-2.5 text-stone-800 max-w-[120px] truncate">
                            {log.queryParams.commodity} · {log.queryParams.market}
                          </td>
                          <td className="py-1.5 px-2.5 text-stone-600 max-w-[180px] truncate font-sans" title={log.message}>
                            {log.message}
                          </td>
                          <td className="py-1.5 px-2.5 text-right text-stone-500">{log.latencyMs}ms</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-stone-400 font-sans">
                        No external API telemetry events yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-stone-500">Farmer To Market Connect v1.0.4</span>
          <button
            type="button"
            onClick={fetchMetrics}
            className="text-emerald-800 font-semibold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
