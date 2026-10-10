'use client';

import React from 'react';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { ContainerId, OrderQuantities } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertCircle 
} from 'lucide-react';

interface ProductSelectorProps {
  quantities: OrderQuantities;
  onChange: (newQuantities: OrderQuantities) => void;
  onOpenSettings?: () => void;
}

export function ProductSelector({ quantities, onChange, onOpenSettings }: ProductSelectorProps) {
  const { configuredItemIds } = useOrders();

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

  // Only display products that are saved in the client's configured items list
  const activeProducts = CONTAINER_PRODUCTS.filter((p) => configuredItemIds.includes(p.id));

  const totalItemsCount = Object.entries(quantities).reduce((acc, [id, qty]) => {
    if (configuredItemIds.includes(id as ContainerId)) {
      return acc + (qty || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Container & Consumable Quantities
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the required quantities for your scheduled facility replenishment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Configure Item List in Settings
            </button>
          )}

          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Total: </span>
            <strong className="text-slate-900 font-bold">{totalItemsCount} units</strong>
          </div>
        </div>
      </div>

      {/* Active Items Grid (Delete button removed; items are managed in Settings) */}
      {activeProducts.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No items configured in your profile</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please visit Facility Settings & Profile to select the containers and consumables your facility uses.
          </p>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors mt-2"
            >
              Open Profile Settings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProducts.map((product) => {
            const qty = quantities[product.id] || 0;
            const isSelected = qty > 0;

            return (
              <div
                key={product.id}
                className={`relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Product Card Details */}
                <div className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: product.colorHex }}
                      />
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {product.name}
                      </h4>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {product.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-1">
                    Specification: <strong className="text-slate-700">{product.unitSpec}</strong>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Stepper Controls */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 mt-2">
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
                    <span className="text-[10px] text-slate-400">Add:</span>
                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id, 5)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-600 transition-colors"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrement(product.id, 10)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-700 text-slate-600 transition-colors"
                    >
                      +10
                    </button>
                    {qty > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 0)}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
