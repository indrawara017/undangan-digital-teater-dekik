'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function CustomSelect({ value, onChange, options, placeholder = "Pilih...", className = "", icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer hover:bg-neutral-800/80"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          {icon && <span className="text-neutral-500 flex-shrink-0">{icon}</span>}
          <span className="truncate text-left font-medium w-full">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-800 bg-neutral-950 py-1 text-base shadow-xl ring-1 ring-black/5 focus:outline-none sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200" style={{ scrollbarWidth: 'thin' }}>
          {options.length === 0 ? (
            <div className="relative cursor-default select-none px-4 py-2 text-neutral-500 text-center text-sm">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`relative cursor-pointer select-none py-2.5 pl-3 pr-9 hover:bg-neutral-800 transition-colors ${
                  value === opt.value ? 'bg-neutral-800/50 text-white' : 'text-neutral-300'
                }`}
              >
                <span className={`block truncate ${value === opt.value ? 'font-medium' : 'font-normal'}`}>
                  {opt.label}
                </span>
                {value === opt.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
