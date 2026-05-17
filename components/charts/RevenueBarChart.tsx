"use client";

type DataPoint = { month: string; amount: number };

export function RevenueBarChart({ data }: { data: DataPoint[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  const chartH = 180;
  const barW = 36;
  const gap = 16;
  const totalW = data.length * (barW + gap) - gap;

  if (data.every(d => d.amount === 0)) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
        <p className="text-sm">No revenue data yet. Charts appear once payments are recorded.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${Math.max(totalW, 400)} ${chartH + 40}`} className="w-full" style={{ minWidth: 300 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = chartH - pct * chartH;
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={Math.max(totalW, 400)} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,4" />
              <text x={0} y={y - 4} fontSize={9} fill="#94a3b8" textAnchor="start">
                {pct > 0 ? `₹${((pct * maxAmount) / 1000).toFixed(1)}k` : ""}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = i * (barW + gap) + 24;
          const barH = Math.max((d.amount / maxAmount) * chartH, d.amount > 0 ? 4 : 0);
          const y = chartH - barH;
          const isHighest = d.amount === maxAmount && d.amount > 0;

          return (
            <g key={i}>
              {/* Bar background */}
              <rect x={x} y={0} width={barW} height={chartH} rx={6} fill="#f8fafc" />
              {/* Bar fill */}
              {d.amount > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={6}
                  fill={isHighest ? "url(#barGradientHighlight)" : "url(#barGradient)"}
                  className="transition-all duration-700"
                />
              )}
              {/* Amount label on top */}
              {d.amount > 0 && (
                <text x={x + barW / 2} y={y - 6} fontSize={9} fontWeight="600" fill="#7c3aed" textAnchor="middle">
                  ₹{d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                </text>
              )}
              {/* Month label */}
              <text x={x + barW / 2} y={chartH + 18} fontSize={10} fill="#94a3b8" textAnchor="middle">{d.month}</text>
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
