'use client';

import React, { useState } from 'react';
import { CONTAINER_PRODUCTS } from '@/lib/constants';
import { ContainerId, OrderQuantities } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { 
  Package, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  Trash2, 
  Check, 
  PlusCircle, 
  AlertCircle, 
  Sparkles, 
  Layers,
  RotateCcw
} from 'lucide-react';

interface ProductSelectorProps {
  quantities: OrderQuantities;
  onChange: (newQuantities: OrderQuantities) => void;
}

export function ProductSelector({ quantities, onChange }: ProductSelectorProps) {
  const { configuredItemIds, addItemToProfile, removeItemFromProfile, resetConfiguredItems } = useOrders();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  const handleRemoveItem = (id: ContainerId) => {
    // Zero out quantity and remove from active profile
    handleQuantityChange(id, 0);
    removeItemFromProfile(id);
  };

  // Only display products that are in client's configured items list
  const activeProducts = CONTAINER_PRODUCTS.filter((p) => configuredItemIds.includes(p.id));
  const availableToAdd = CONTAINER_PRODUCTS.filter((p) => !configuredItemIds.includes(p.id));

  const totalItemsCount = Object.entries(quantities).reduce((acc, [id, qty]) => {
    if (configuredItemIds.includes(id as ContainerId)) {
      return acc + (qty || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header with Title and Catalog Settings Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Container & Consumable Quantities
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select quantities for your facility. You can add or remove items to customize your active order list.
          </p>
        </div>

        {/* Catalog Settings and Add Item Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Customize Item List ({configuredItemIds.length})</span>
          </button>

          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Total Selected: </span>
            <strong className="text-slate-900 font-bold">{totalItemsCount} units</strong>
          </div>
        </div>
      </div>

      {/* Active Items Grid */}
      {activeProducts.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Your order list is currently empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click customize or add items to pick the Daniels containers (S14, S22, S32 Plus), 45 L, 90 L, plastics, or 20cm cable ties you use.
          </p>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Add Items to Order List
          </button>
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
                {/* Product Card Top */}
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

                    {/* Remove from active list button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(product.id)}
                      title="Remove this product from my ordering list"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {product.badge}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {product.unitSpec}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Controls */}
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

      {/* Quick Add Available Items Bar if any are hidden */}
      {availableToAdd.length > 0 && (
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            + Add other items to your list:
          </span>
          {availableToAdd.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => addItemToProfile(item.id)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Modal: Customize My Item List / Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Customize My Order Items Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-600">
                Choose the products your facility uses. Only checked items will show on your main ordering screen so you can quickly enter quantities.
              </p>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => resetConfiguredItems(['daniels-s14', 'daniels-s22', 'daniels-s32-plus', 'container-45l', 'container-90l', 'plastic-liners', 'cable-ties-20cm'])}
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => resetConfiguredItems(['container-90l', 'plastic-liners', 'cable-ties-20cm'])}
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  90 L Bulk Only
                </button>
                <button
                  type="button"
                  onClick={() => resetConfiguredItems(['daniels-s14', 'daniels-s32-plus', 'plastic-liners', 'cable-ties-20cm'])}
                  className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Sharps & Plastics Only
                </button>
              </div>

              {/* Products List Checklist */}
              <div className="space-y-2">
                {CONTAINER_PRODUCTS.map((prod) => {
                  const isChecked = configuredItemIds.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/40 border-emerald-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              handleRemoveItem(prod.id);
                            } else {
                              addItemToProfile(prod.id);
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">
                            {prod.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {prod.unitSpec} • {prod.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className="w-3 h-3 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: prod.colorHex }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors"
              >
                Apply & Return to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
