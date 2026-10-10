'use client';

import React from 'react';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { ContainerId, OrderQuantities } from '@/types/order';
import { Package, Plus, Minus, AlertTriangle, ShieldCheck, Box } from 'lucide-react';

interface ProductSelectorProps {
  quantities: OrderQuantities;
  onChange: (newQuantities: OrderQuantities) => void;
}

export function ProductSelector({ quantities, onChange }: ProductSelectorProps) {
  const handleQuantityChange = (id: ContainerId, value: number) => {
    const sanitized = Math.max(0, Math.min(999, Math.floor(value || 0)));
    onChange({
      ...quantities,
      [id]: sanitized,
    });
  };

  const handleIncrement = (id: ContainerId, delta: number) => {
    const current = quantities[id] || 0;
    handleQuantityChange(id, current + delta);
  };

  const totalContainers = Object.values(quantities).reduce((acc, q) => acc + (q || 0), 0);
  const totalLiters = CONTAINER_PRODUCTS.reduce((acc, prod) => {
    return acc + (quantities[prod.id] || 0) * prod.volumeLiters;
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Daniels & Clinical Waste Container Selection
          </h3>
          <p className="text-xs text-slate-500">
            Specify required clean replacement units. Daniels sharps units are certified reusable systems.
          </p>
        </div>

        {/* Live Summary Counter */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs self-start sm:self-auto">
          <div>
            <span className="text-slate-500 font-medium">Total Units: </span>
            <strong className="text-slate-900 font-bold text-sm">{totalContainers}</strong>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 font-medium">Total Capacity: </span>
            <strong className="text-emerald-700 font-bold text-sm">{totalLiters} L</strong>
          </div>
        </div>
      </div>

      {/* Container Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONTAINER_PRODUCTS.map((product) => {
          const qty = quantities[product.id] || 0;
          const isSelected = qty > 0;

          // Distinctive visual tags based on container type
          const isDanielsSharps = product.id === 'daniels-s14' || product.id === 'daniels-s22';
          const isDanielsA32 = product.id === 'daniels-a32-plus';

          return (
            <div
              key={product.id}
              className={`relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-emerald-500/80 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Product Header / Banner */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-xs shrink-0"
                      style={{ backgroundColor: product.colorHex }}
                      title={`Standard color coding: ${product.name}`}
                    />
                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {product.name}
                    </h4>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                      isDanielsSharps
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : isDanielsA32
                        ? 'bg-orange-50 text-orange-800 border-orange-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {product.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-2.5">
                  {product.description}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50/80 px-2 py-1 rounded border border-slate-100">
                  <span className="font-semibold text-slate-700">Recommended:</span>
                  <span className="truncate">{product.usage}</span>
                </div>
              </div>

              {/* Quantity Controls Section */}
              <div className="p-3 bg-slate-50/60 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">Quantity</span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id, -1)}
                      disabled={qty <= 0}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={qty === 0 ? '' : qty}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-14 h-8 text-center font-bold text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-end gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Quick add:</span>
                  <button
                    type="button"
                    onClick={() => handleIncrement(product.id, 5)}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-600 transition-colors"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIncrement(product.id, 10)}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-600 transition-colors"
                  >
                    +10
                  </button>
                  {qty > 0 && (
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product.id, 0)}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors ml-1"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalContainers === 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 text-amber-800 rounded-xl text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Please select at least one container quantity to proceed with your order.</span>
        </div>
      )}
    </div>
  );
}
