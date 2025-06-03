// Users/components/UserTable.tsx
import { UserDetails } from "../types";

interface Props {
  users: UserDetails[];
  onDelete: (userId: string) => void;
  onEdit: (user: UserDetails) => void;
}

const UserTable = ({ users, onDelete, onEdit }: Props) => {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-slate-300 bg-opacity-20 border-t dark:bg-slate-800 divide-gray-300 dark:border-gray-700">
          <tr>
            <th className="py-3.5 ps-4 pe-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">ID</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Username</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Email ID</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Created Date</th>
            <th className="flex justify-center px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user, idx) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap py-4 ps-4 pe-3 text-sm font-medium text-gray-900 dark:text-gray-200"><b>{idx + 1}</b></td>
              <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-200 ms-4">{user.fullname}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-200">{user.email}</td>
              <td className="whitespace-nowrap px-3 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-200">{user.created_date}</td>
              <td className="flex justify-center gap-1 whitespace-nowrap px-3 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-200 hover:cursor-pointer">
                <button
                  className="btn bg-danger/20 text-sm font-medium text-danger hover:text-white hover:bg-danger"
                  onClick={() => onDelete(user.id)}
                >
                  <i className="mgc_delete_2_fill"></i>
                </button>
                <button
                  className="btn bg-blue-500/40 text-sm font-medium text-blue hover:text-white hover:bg-blue-500"
                  onClick={() => onEdit(user)} 
                >
                  <i className="mgc_edit_line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
