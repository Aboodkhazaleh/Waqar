"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import type { SizePair } from "@/types";
import { splitSizesIntoRows } from "@/lib/sizeMapping";

interface SizeMatrixEditorProps {
  /** All sizes assigned to the product (e.g. ["S","M","L","XL","XXL","56","58","60","62"]) */
  sizes: string[];
  /** Current size availability matrix */
  matrix: SizePair[] | undefined;
  /** Called whenever the matrix changes */
  onChange: (next: SizePair[]) => void;
}

/**
 * Lets the admin mark which letter+number combinations are available.
 * Example: S can be in stock for 56 and 60 but sold out for 58.
 *
 * Storage shape: a flat list of {letterSize, numberSize, inStock} tuples.
 * Missing entries default to in-stock so the matrix is opt-in.
 */
export default function SizeMatrixEditor({
  sizes,
  matrix,
  onChange,
}: SizeMatrixEditorProps) {
  const { letterRow, numberRow } = useMemo(
    () => splitSizesIntoRows(sizes),
    [sizes]
  );

  const matrixMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const p of matrix ?? []) {
      m.set(`${p.letterSize}__${p.numberSize}`, p.inStock);
    }
    return m;
  }, [matrix]);

  const isInStock = (letter: string, number: string) => {
    const v = matrixMap.get(`${letter}__${number}`);
    return v === undefined ? true : v; // default = available
  };

  const toggle = (letter: string, number: string) => {
    const current = isInStock(letter, number);
    const next = (matrix ?? []).filter(
      (p) => !(p.letterSize === letter && p.numberSize === number)
    );
    next.push({ letterSize: letter, numberSize: number, inStock: !current });
    onChange(next);
  };

  const setRow = (letter: string, inStock: boolean) => {
    const next = (matrix ?? []).filter((p) => p.letterSize !== letter);
    for (const n of numberRow) {
      next.push({ letterSize: letter, numberSize: n, inStock });
    }
    onChange(next);
  };

  if (letterRow.length === 0 || numberRow.length === 0) {
    return (
      <p className="font-arabic text-xs text-white/40 leading-7 text-center py-6">
        أضف مقاسات أحرف ومقاسات أرقام أولاً من تبويب "المخزون والمقاسات".
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-arabic text-xs text-white/40 leading-7">
        لكل مقاس حرف اختر أي مقاسات الأرقام متوفّرة. الخانات الخضراء = متاحة
        للزبون. الحمراء = نفد المخزون.
      </p>

      <div className="overflow-x-auto bg-[#0E0E0E] border border-[#1C1C1C] rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1C1C1C]">
              <th className="px-3 py-3 text-right font-arabic text-xs text-white/40 font-medium sticky right-0 bg-[#0E0E0E]">
                المقاس
              </th>
              {numberRow.map((n) => (
                <th
                  key={n}
                  className="px-3 py-3 text-center font-arabic text-xs text-white/40 font-medium"
                >
                  {n}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-arabic text-xs text-white/40 font-medium">
                إجراء
              </th>
            </tr>
          </thead>
          <tbody>
            {letterRow.map((letter) => {
              const rowState = numberRow.every((n) => isInStock(letter, n));
              return (
                <tr
                  key={letter}
                  className="border-b border-[#1C1C1C]/40 last:border-b-0"
                >
                  <td className="px-3 py-2 sticky right-0 bg-[#0E0E0E]">
                    <span className="font-arabic text-sm text-white font-semibold">
                      {letter}
                    </span>
                  </td>
                  {numberRow.map((n) => {
                    const ok = isInStock(letter, n);
                    return (
                      <td key={n} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(letter, n)}
                          aria-pressed={ok}
                          className={`inline-flex w-9 h-9 rounded-lg items-center justify-center transition-all ${
                            ok
                              ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                              : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          }`}
                          title={`${letter} مع ${n} ${ok ? "متاح" : "نفد"} — اضغط للتبديل`}
                        >
                          {ok ? <Check size={14} /> : <X size={14} />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setRow(letter, !rowState)}
                      className="font-arabic text-[10px] text-white/40 hover:text-white px-2 py-1 rounded-md hover:bg-[#1C1C1C] transition-all"
                    >
                      {rowState ? "تعطيل الصفّ" : "تفعيل الصفّ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="font-arabic text-[11px] text-white/30 leading-6">
        💡 الخانات الجديدة تعتبر متاحة افتراضياً. استخدم هذا الجدول فقط لتعليم
        مقاسات بأنها "نفد المخزون".
      </p>
    </div>
  );
}
