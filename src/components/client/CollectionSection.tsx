'use client';

import React from 'react';
import { CollectionDetails } from '@/types/order';
import { RefreshCw, CheckSquare, Square, AlertCircle, ShieldAlert, MapPin, Hash } from 'lucide-react';

interface CollectionSectionProps {
  collection: CollectionDetails;
  onChange: (details: CollectionDetails) => void;
}

export function CollectionSection({ collection, onChange }: CollectionSectionProps) {
  const toggleCollection = () => {
    const isNowRequested = !collection.collectionRequested;
    onChange({
      ...collection,
      collectionRequested: isNowRequested,
      // Provide smart default values if enabling
      fullContainersCount: isNowRequested ? (collection.fullContainersCount || 5) : 0,
      wasteStream: isNowRequested ? (collection.wasteStream || 'Sharps (Yellow)') : undefined,
      complianceCertified: isNowRequested ? (collection.complianceCertified ?? true) : false,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Primary Collection Checkbox */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={toggleCollection}
            className="mt-0.5 text-emerald-600 hover:text-emerald-700 focus:outline-none transition-colors"
            aria-label="Toggle collection status"
          >
            {collection.collectionRequested ? (
              <CheckSquare className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            ) : (
              <Square className="w-6 h-6 text-slate-400 hover:text-slate-600" />
            )}
          </button>

          <div>
            <label
              onClick={toggleCollection}
              className="text-base font-bold text-slate-900 cursor-pointer select-none flex items-center gap-2"
            >
              <span>Request Collection / Pickup of Full Containers</span>
              {collection.collectionRequested && (
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Collection Active
                </span>
              )}
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Check this box if your facility requires retrieval or exchange of full biohazard/sharps containers during this delivery run.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simultaneous Exchange</span>
        </div>
      </div>

      {/* Expanded Details when Collection is Requested */}
      {collection.collectionRequested && (
        <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Containers Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Estimated Full Containers to Collect</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={collection.fullContainersCount || ''}
                  onChange={(e) =>
                    onChange({
                      ...collection,
                      fullContainersCount: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">units</span>
              </div>
            </div>

            {/* Waste Stream Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                <span>Primary Biohazard Stream</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={collection.wasteStream || 'Sharps (Yellow)'}
                onChange={(e) =>
                  onChange({
                    ...collection,
                    wasteStream: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
              >
                <option value="Sharps (Yellow)">Sharps (Yellow Lid / Sharpsmart)</option>
                <option value="Cytotoxic (Purple)">Cytotoxic & Chemotherapy (Purple Lid)</option>
                <option value="Anatomical (Red)">Anatomical / Pathological (Red Lid)</option>
                <option value="Clinical / Infectious (Orange)">Clinical / Infectious (Orange / 45L/90L)</option>
              </select>
            </div>
          </div>

          {/* Collection Location / Holding Bay */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Staging Bay / Holding Room Location</span>
            </label>
            <input
              type="text"
              value={collection.pickupBayNotes || ''}
              onChange={(e) =>
                onChange({
                  ...collection,
                  pickupBayNotes: e.target.value,
                })
              }
              placeholder="e.g. Ground Floor Biohazard Holding Cage B-04, key with dock supervisor"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Compliance & Safety Certification Checkbox */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-xs text-slate-700">
            <input
              id="complianceCheck"
              type="checkbox"
              checked={collection.complianceCertified ?? true}
              onChange={(e) =>
                onChange({
                  ...collection,
                  complianceCertified: e.target.checked,
                })
              }
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="complianceCheck" className="cursor-pointer select-none">
              <strong className="text-slate-800">Dangerous Goods & Waste Compliance:</strong> I certify that all full sharps and clinical containers are securely locked, sealed, and prepared in accordance with medical waste transport standards.
            </label>
          </div>
        </div>
      )}

      {!collection.collectionRequested && (
        <div className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Status: <strong>Delivery Only</strong> (No container pickup requested for this run).</span>
        </div>
      )}
    </div>
  );
}
