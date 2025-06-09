// Users/hooks/useUsers.ts
import { useState, useEffect } from "react";
import { getUsers } from "../../../../helpers/api/users";
import { UserDetails } from "../types";

export const useGetUsers = () => {
  const [userDetails, setUserDetails] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const rawUsers = await getUsers();
      const formatted = rawUsers.map((user: any) => ({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        created_date: user.created_date,
      }));
      setUserDetails(formatted);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return { userDetails, setUserDetails, loading, fetchAllUsers };
};
