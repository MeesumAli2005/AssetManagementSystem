const COLOR_MAP = {
  green: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  red: 'bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/25',
  amber: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
  slate: 'bg-zinc-500/15 text-zinc-400 ring-1 ring-inset ring-zinc-500/25',
};

// Usage: <StatusBadge text="Active" color="green" />
export default function StatusBadge({ text, color = 'slate' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium capitalize ${COLOR_MAP[color] || COLOR_MAP.slate}`}
    >
      {text}
    </span>
  );
}
