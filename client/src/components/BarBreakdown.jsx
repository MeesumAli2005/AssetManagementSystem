const BAR_COLOR_MAP = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  slate: 'bg-zinc-500',
};

// Plain horizontal bar breakdown — no charting library, just divs sized
// by each row's share of the largest value.
// Usage: <BarBreakdown title="Assets by status" rows={[{ label, value, color }]} />
export default function BarBreakdown({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
      <p className="mb-4 text-base font-medium text-zinc-300">{title}</p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm capitalize text-zinc-400">{row.label.replace('_', ' ')}</span>
            <div className="h-2.5 flex-1 rounded-full bg-zinc-800">
              <div
                className={`h-2.5 rounded-full ${BAR_COLOR_MAP[row.color] || BAR_COLOR_MAP.slate}`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm text-zinc-300">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
