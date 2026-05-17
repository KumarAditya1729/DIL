"use client";

type DataPoint = { month: string; count: number };

export function StudentGrowthChart({ data }: { data: DataPoint[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartH = 140;
  const chartW = 500;
  const padX = 28;
  const padY = 10;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  if (data.every(d => d.count === 0)) {
    return (
      <div className="h-[140px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <p className="text-sm">No enrolment data yet.</p>
      </div>
    );
  }

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1 || 1)) * innerW,
    y: padY + innerH - (d.count / maxCount) * innerH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartH - padY} L ${points[0].x} ${chartH - padY} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} className="w-full" style={{ minWidth: 280 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = padY + (1 - pct) * innerH;
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,4" />
              <text x={0} y={y + 4} fontSize={9} fill="#94a3b8">{Math.round(pct * maxCount)}</text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#7c3aed" strokeWidth={2.5} />
            {p.count > 0 && (
              <text x={p.x} y={p.y - 10} fontSize={10} fontWeight="700" fill="#7c3aed" textAnchor="middle">+{p.count}</text>
            )}
            <text x={p.x} y={chartH + 16} fontSize={9} fill="#94a3b8" textAnchor="middle">{p.month}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
