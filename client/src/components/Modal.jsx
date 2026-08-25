import { useEffect } from 'react';


//   </Modal>
const SIZES = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' })
{
  useEffect(() => 
  {
    if (!open) return;

    function handleKeyDown(event) 
    {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${SIZES[size] || SIZES.md} rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold tracking-tight text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
