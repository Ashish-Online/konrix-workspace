// Users/services/userService.ts
import axios from "axios";

const API = "http://localhost:5000/api/users";

export const getUsers = async () => {
  const res = await axios.get(`${API}`);
  return res.data;
};

export const addUser = async (newUser: {
  fullname: string;
  email: string;
  password: string;
}) => {
  return axios.post(`${API}/adduser`, newUser);
};

export const deleteUser = async (userId: string) => {
  return axios.delete(`${API}/deleteuser/${userId}`);
};

export const updateUser = async (
  userId: string,
  updatedFields: { fullname?: string; email?: string; password?: string }
) => {
  return axios.put(`${API}/updateuser/${userId}`, updatedFields);
};
