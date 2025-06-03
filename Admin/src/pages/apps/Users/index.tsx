import { useState } from "react";
import { PageBreadcrumb } from "../../../components";
import AddUserModal from "./components/AddUserModal";
import UserTable from "./components/UserTable";
import { useGetUsers } from "./hooks/useUsers";
import { addUser, deleteUser, updateUser } from "../../../helpers/api/users";
import { UserDetails } from "./types";

const ManageUsers = () => {
  const { userDetails, loading, fetchAllUsers } = useGetUsers();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [formUser, setFormUser] = useState<
    Partial<UserDetails> & { password?: string }
  >({});

  const openCreate = () => {
    setMode("create");
    setFormUser({ fullname: "", email: "", password: "" });
    setShowModal(true);
  };

  const openEdit = (user: UserDetails) => {
    setMode("edit");
    setFormUser({ ...user, password: "" });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (mode === "create") {
      await addUser(formUser as any);
    } else {
      await updateUser(formUser.id!, {
        fullname: formUser.fullname,
        email: formUser.email,
        password: formUser.password,
      });
    }
    setShowModal(false);
    fetchAllUsers();
  };

  return (
    <div className="mt-6 card">
      <div className="flex justify-end p-6">
        <button onClick={openCreate} className="btn bg-success/40 text-sm font-medium text-white hover:text-white hover:bg-success">
          Add User
        </button>
      </div>

      <AddUserModal
        show={showModal}
        mode={mode}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        user={formUser as any}
        setUser={setFormUser as any}
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <UserTable
          users={userDetails}
          onDelete={async (userId: string) => {
            await deleteUser(userId);
            fetchAllUsers();
          }}
          onEdit={openEdit}
        />
      )}
    </div>
  );
};

export default ManageUsers;
