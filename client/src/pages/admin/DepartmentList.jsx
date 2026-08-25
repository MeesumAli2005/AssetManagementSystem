import { useEffect, useState } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';


export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal is shared between "create new" and "edit existing" — editingDept
  // is null for create, or the department object being edited.
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deptPendingDelete, setDeptPendingDelete] = useState(null);

  async function loadDepartments() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreateModal() {
    setEditingDept(null);
    setFormName('');
    setFormActive(true);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(dept) {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormActive(!!dept.is_active);
    setFormError('');
    setModalOpen(true);
  }

  function requestDelete(dept) 
  {
    setDeptPendingDelete(dept);
  }

  async function confirmDelete()
  {
    const dept = deptPendingDelete;
    setDeptPendingDelete(null);
    setDeletingId(dept.id);
    
    try 
    {
      await deleteDepartment(dept.id);
      toast.success(`"${dept.name}" deleted`);
      await loadDepartments();
    } 
  
    catch (err) 
    {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    } 
    
    finally 
    {
      setDeletingId(null);
    }
  
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, { name: formName, is_active: formActive });
        toast.success(`"${formName}" updated`);
      } else {
        await createDepartment(formName);
        toast.success(`"${formName}" created`);
      }
      setModalOpen(false);
      await loadDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-100">Departments</h1>
          <p className="mt-1 text-base text-zinc-500">Manage the departments your employees belong to.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
        >
          New Department
        </button>
      </div>

      {loading && <p className="text-base text-zinc-500">Loading…</p>}
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm">
          {departments.map((dept) => (
            <li key={dept.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-base font-medium text-zinc-100">{dept.name}</span>
                <StatusBadge
                  text={dept.is_active ? 'Active' : 'Inactive'}
                  color={dept.is_active ? 'green' : 'red'}
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => openEditModal(dept)}
                  className="text-base font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => requestDelete(dept)}
                  disabled={deletingId === dept.id}
                  className="text-base font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === dept.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
          {departments.length === 0 && (
            <li className="px-4 py-6 text-center text-base text-zinc-500">No departments yet.</li>
          )}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-base font-medium text-zinc-300">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base text-zinc-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {editingDept && (
            <label className="flex items-center gap-2 text-base text-zinc-300">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(event) => setFormActive(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/30"
              />
              Active
            </label>
          )}

          {formError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-base text-red-400">{formError}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deptPendingDelete}
        onClose={() => setDeptPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete department"
        message={deptPendingDelete ? `Delete "${deptPendingDelete.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
