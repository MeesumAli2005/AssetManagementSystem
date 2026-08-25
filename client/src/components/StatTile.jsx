// Usage: <StatTile label="Available" value={12} />
// The label sits in a grid row with a FIXED height (2.5rem, not just a
// minimum) so it's identical for every tile regardless of whether the
// text wraps to one line or two — the value row then starts at the
// exact same y-position across every tile, instead of shifting based
// on label length.
export default function StatTile({ label, value }) {
  return (
    <div className="grid grid-rows-[2.5rem_auto] rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
      <p className="self-start overflow-hidden text-base capitalize leading-5 text-zinc-500">{label}</p>
      <p className="self-start font-serif text-3xl font-bold tracking-tight text-zinc-100">{value}</p>
    </div>
  );
}
