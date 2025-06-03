interface Props {
  show: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: () => void;
  user: { fullname: string; email: string; password?: string };
  setUser: (data: { fullname: string; email: string; password?: string }) => void;
}

const AddUserModal = ({ show, mode, onClose, onSubmit, user, setUser }: Props) => {
  if (!show) return null;

  const title = mode === 'create' ? 'Add New User' : 'Edit User';
  const submitLabel = mode === 'create' ? 'Add User' : 'Update User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={user.fullname}
            onChange={(e) => setUser({ ...user, fullname: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={user.password || ''}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <button className="btn bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={onClose}>
              Cancel
            </button>
            <button className="btn bg-success text-white hover:bg-green-700" onClick={onSubmit}>
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;