import React from 'react';
import { formatIranianPlate } from '../utils/persian';

interface IranianPlateBadgeProps {
  plate: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  isCommercial?: boolean; // Yellow for commercial/trucks (letter 'ع')
}

export const IranianPlateBadge: React.FC<IranianPlateBadgeProps> = ({
  plate,
  size = 'md',
  isCommercial = true,
}) => {
  const { part1, letter, part2, cityCode, raw } = formatIranianPlate(plate);

  if (!raw) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 font-mono">
        پلاک ثبت‌نشده
      </span>
    );
  }

  // Authentic Iranian commercial license plate colors: Yellow background (#fcd34d) with black text
  const sizeClasses = {
    sm: 'text-xs h-6 px-1.5 gap-1',
    md: 'text-sm h-8 px-2 gap-1.5',
    lg: 'text-base h-10 px-3 gap-2',
  }[size];

  return (
    <div
      id={`plate-badge-${cityCode}-${part1}`}
      className={`inline-flex items-center font-bold tracking-tight rounded-md border-2 border-slate-900 shadow-xs select-none ${
        isCommercial ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-950'
      } ${sizeClasses}`}
      dir="ltr"
      title={`پلاک انتظامی ایران: ${raw}`}
    >
      {/* Left blue strip with I.R. IRAN and Flag */}
      <div className="flex flex-col items-center justify-center bg-blue-700 text-white px-1 -ml-1 h-full rounded-l-xs text-[9px] font-sans">
        <span className="text-[7px] leading-none font-bold">I.R.</span>
        <span className="text-[7px] leading-none">IRAN</span>
      </div>

      {/* Part 1 (2 digits) */}
      <span className="font-mono text-slate-900 tracking-wider font-extrabold">{part2}</span>

      {/* Persian letter e.g. ع (commercial freight) */}
      <span className="px-1 text-red-700 font-black text-center text-[1.1em]">{letter || 'ع'}</span>

      {/* Part 2 (3 digits) */}
      <span className="font-mono text-slate-900 tracking-wider font-extrabold">{part1}</span>

      {/* Iran City Code divider */}
      <div className="flex flex-col items-center border-l-2 border-slate-900 pl-1 ml-0.5 text-center leading-tight">
        <span className="text-[8px] font-medium text-slate-800 -mb-0.5">ایران</span>
        <span className="font-mono text-[11px] font-black text-slate-950">{cityCode}</span>
      </div>
    </div>
  );
};
