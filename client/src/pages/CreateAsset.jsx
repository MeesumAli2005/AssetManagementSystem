import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createAsset } from '../api/assets';
import { getAllCategories } from '../api/categories';

const CONDITIONS = ['new', 'good', 'fair', 'damaged'];

export default function CreateAsset() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [condition, setCondition] = useState('new');
  const [specValues, setSpecValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
  }, []);

  // Whatever spec inputs were showing for the previously-selected category
  // no longer apply once you pick a different one — clear them out so a
  // stale value from category A can't accidentally get submitted under
  // category B's spec ids.
  useEffect(() => {
    setSpecValues({});
  }, [categoryId]);

  const selectedCategory = categories.find((c) => c.id === Number(categoryId));

  function updateSpecValue(specId, value) {
    setSpecValues((prev) => ({ ...prev, [specId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const specs = selectedCategory?.specs || [];
      const spec_values = specs
        .filter((spec) => spec.spec_type === 'boolean' || (specValues[spec.id] || '').trim() !== '')
        .map((spec) => ({
          category_spec_id: spec.id,
          value: spec.spec_type === 'boolean' ? String(!!specValues[spec.id]) : specValues[spec.id],
        }));

      const created = await createAsset({
        brand,
        category_id: categoryId || undefined,
        purchase_date: purchaseDate || undefined,
        purchase_cost: purchaseCost || undefined,
        condition,
        spec_values,
      });
      toast.success(`"${created.name}" created`);
      navigate(`/assets/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-1 font-serif text-3xl font-bold tracking-tight text-zinc-100">New Asset</h1>
      <p className="mb-6 text-base text-zinc-500">Add an item to inventory.</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <p className="mt-1.5 text-sm text-zinc-500">This is required.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Select a category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Purchase date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Purchase cost</label>
            <input
              type="number"
              step="0.01"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-base font-medium text-zinc-300">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {selectedCategory && selectedCategory.specs.length > 0 && (
          <div>
            <p className="mb-2 text-base font-medium text-zinc-300">Specs</p>
            <div className="space-y-3">
              {selectedCategory.specs.map((spec) => (
                <div key={spec.id}>
                  {spec.spec_type === 'boolean' ? (
                    <label className="flex items-center gap-2 text-base text-zinc-300">
                      <input
                        type="checkbox"
                        checked={!!specValues[spec.id]}
                        onChange={(e) => updateSpecValue(spec.id, e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      {spec.spec_name}
                      {spec.is_required ? ' *' : ''}
                    </label>
                  ) : (
                    <>
                      <label className="mb-1.5 block text-base text-zinc-300">
                        {spec.spec_name}
                        {spec.is_required ? ' *' : ''}
                      </label>
                      <input
                        type={spec.spec_type === 'number' ? 'number' : 'text'}
                        value={specValues[spec.id] || ''}
                        onChange={(e) => updateSpecValue(spec.id, e.target.value)}
                        required={spec.is_required}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create Asset'}
        </button>
      </form>
    </div>
  );
}
