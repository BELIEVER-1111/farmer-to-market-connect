import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { AcceptanceTestReport } from '../types';

interface AcceptanceTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcceptanceTestModal: React.FC<AcceptanceTestModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<AcceptanceTestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    setReport(null);
    setActiveStepIndex(0);

    try {
      const res = await fetch('/api/test/acceptance');
      if (res.ok) {
        const data: AcceptanceTestReport = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setIsRunning(false);
      setActiveStepIndex(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Automated Acceptance Test Suite
              </h3>
              <p className="text-xs text-stone-500">
                Tests 10+ real crop names across 3 Indian states asserting valid live/cached/fallback responses
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-acceptance-test-modal"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Action / Trigger Bar */}
        <div className="p-4 border-b border-stone-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-stone-700 block">
              Requirement Acceptance Criteria
            </span>
            <span className="text-[11px] text-stone-500">
              Asserts: Modal price &gt; 0, Source Freshness Tag, 7/30d Trend Cache, and Sell Window logic.
            </span>
          </div>

          <button
            type="button"
            id="run-acceptance-tests-btn"
            onClick={handleRunTests}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Executing Real API Tests...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run 12 Automated Crop Tests
              </>
            )}
          </button>
        </div>

        {/* Content Body: Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {report ? (
            <div>
              {/* Summary Scorecard */}
              <div className={`p-3.5 rounded-xl border mb-4 flex items-center justify-between ${
                report.allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2.5">
                  {report.allPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-amber-700 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">
                      {report.allPassed ? 'Acceptance Criteria Passed (100% Verified)' : 'Some Test Cases Flagged'}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {report.passedCount} of {report.totalTests} crop/mandi queries returned fully validated responses in {report.durationMs}ms.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-stone-200 shadow-2xs">
                  {report.passedCount} / {report.totalTests} PASSED
                </span>
              </div>

              {/* Table of results */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Crop Name</th>
                      <th className="py-2.5 px-3">Location (State & Mandi)</th>
                      <th className="py-2.5 px-3">Response Mode</th>
                      <th className="py-2.5 px-3">Modal Price</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {report.results.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-2.5 px-3 font-mono text-stone-400 text-[11px]">{item.id}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">{item.cropName}</td>
                        <td className="py-2.5 px-3 text-stone-700">
                          <div>{item.market}</div>
                          <div className="text-[10px] text-stone-400">{item.state}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.responseType === 'CACHED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.responseType === 'LIVE_API'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {item.responseType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          ₹{item.modalPrice.toLocaleString('en-IN')}/qtl
                        </td>
                        <td className="py-2.5 px-3">
                          {item.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                              <XCircle className="w-3.5 h-3.5" /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isRunning ? (
            <div className="text-center py-16">
              <span className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
              <h4 className="text-sm font-bold text-stone-800">
                Running Verification Pipeline Across 12 Indian Mandis...
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Testing rate limiting, 6-hour cache responses, fallback handling, and trend generation for each crop.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">
              <FileCheck className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-medium text-stone-700">Acceptance Test Ready to Run</p>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                Click &quot;Run 12 Automated Crop Tests&quot; above to execute live searches for Tomato, Onion, Wheat, Cotton, Soyabean, Mustard, Chana, and more across Andhra Pradesh, Maharashtra, Punjab, and Gujarat.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
