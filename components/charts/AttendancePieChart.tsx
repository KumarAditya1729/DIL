"use client";

type Slice = { label: string; value: number; color: string };

export function AttendancePieChart({ data, percentage }: { data: Slice[]; percentage: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
        <p className="text-sm text-center">No attendance recorded yet.</p>
      </div>
    );
  }

  const cx = 80; const cy = 80; const r = 68; const inner = 46;
  let startAngle = -90;

  const slices = data.map(d => {
    const pct = d.value / total;
    const sweep = pct * 360;
    const endAngle = startAngle + sweep;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const xi1 = cx + inner * Math.cos(toRad(startAngle));
    const yi1 = cy + inner * Math.sin(toRad(startAngle));
    const xi2 = cx + inner * Math.cos(toRad(endAngle));
    const yi2 = cy + inner * Math.sin(toRad(endAngle));
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    const result = { ...d, path, pct };
    startAngle = endAngle;
    return result;
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} className="transition-all duration-500" />
          ))}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight="800" fill="#0f172a">{percentage}%</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#64748b">Attendance</text>
        </svg>
      </div>
      {/* Legend */}
      <div className="w-full space-y-2 mt-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-slate-600 dark:text-slate-400">{s.label}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {s.value} <span className="text-slate-400 font-normal text-xs">({Math.round(s.pct * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
