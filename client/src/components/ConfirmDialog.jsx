import Modal from './Modal';

export default function ConfirmDialog(
    {
        open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false
    }
)
{
    return (
        <Modal open= {open} onClose={onClose} title={title}>
            <p className= "text-sm text-zinc-400">{message}</p>
            <div className = "mt-6 flex justify-end gap-3">
            <button
                onClick={onClose}
                className='rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800'
            >    
            Cancel
            </button>

            <button
            onClick={onConfirm}
            className=
            {
                `rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
                danger ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`
            }
            >
        {confirmLabel}
        </button>
      </div>
    </Modal>
  );

}