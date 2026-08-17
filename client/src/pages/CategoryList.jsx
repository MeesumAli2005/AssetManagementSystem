import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllCategories, createCategory, deleteCategory } from '../api/categories';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const SPEC_TYPES = ['text', 'number', 'boolean', 'dropdown'];

export default function CategoryList() {
  const { user } = useAuth();
  const isAdmin = user.role === 'administrator';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [specs, setSpecs] = useState([]);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [catPendingDelete, setCatPendingDelete] = useState(null);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() 
  {
    setName('');
    setSpecs([]);
    setModalOpen(true);
  }

  function addSpecRow() 
  {
    setSpecs((prev) => [...prev, { spec_name: '', spec_type: 'text', is_required: false }]);
  }

  function updateSpecRow(index, field, value) 
  {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));
  }

  function removeSpecRow(index) 
  {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) 
  {
    event.preventDefault();
    setSaving(true);
    try {
      await createCategory(name, specs);
      toast.success(`"${name}" created`);
      setModalOpen(false);
      await loadCategories();
    } 
    catch (err) 
    {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } 

    finally 
    {
      setSaving(false);
    }
  }

  async function confirmDelete() 
  {
    const cat = catPendingDelete;
    setCatPendingDelete(null);
    setDeletingId(cat.id);
    try 
    {
      await deleteCategory(cat.id);
      toast.success(`"${cat.name}" deleted`);
      await loadCategories();
    }
    
    catch (err) 
    {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } 
    
    finally 
    {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-zinc-100">Categories</h1>
          <p className="mt-1 text-sm text-zinc-500">Asset categories and the specs each one tracks.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            New Category
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-100">{cat.name}</span>
                {isAdmin && (
                  <button
                    onClick={() => setCatPendingDelete(cat)}
                    disabled={deletingId === cat.id}
                    className="text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === cat.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
              {cat.specs.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {cat.specs.map((spec) => (
                    <li key={spec.id} className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                      {spec.spec_name}
                      {spec.is_required ? ' *' : ''}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {categories.length === 0 && (
            <li className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-center text-sm text-zinc-500">
              No categories yet.
            </li>
          )}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Category" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Specs</label>
              <button
                type="button"
                onClick={addSpecRow}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                + Add spec
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Spec name (e.g. RAM)"
                    value={spec.spec_name}
                    onChange={(e) => updateSpecRow(index, 'spec_name', e.target.value)}
                    required
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <select
                    value={spec.spec_type}
                    onChange={(e) => updateSpecRow(index, 'spec_type', e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {SPEC_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={spec.is_required}
                      onChange={(e) => updateSpecRow(index, 'is_required', e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
                    />
                    required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="text-zinc-500 hover:text-red-400"
                    aria-label="Remove spec"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Category'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!catPendingDelete}
        onClose={() => setCatPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete category"
        message={catPendingDelete ? `Delete "${catPendingDelete.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
    