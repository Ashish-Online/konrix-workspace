import { APICore } from "./apiCore";

const api = new APICore();

// account
function login(params: { email: string; password: string }) {
  // console.log("Email: ", params);
  const baseUrl = "/auth/login/";
  
  return api.create(`${baseUrl}`, params);
}

function logout() {
  const baseUrl = "/auth/logout/";
  return api.create(`${baseUrl}`, {});
}

function signup(params: { fullname: string; password: string, email: string }) {
  const baseUrl = "/auth/register/";
  return api.create(`${baseUrl}`, params);
}

function forgotPassword(params: { email: string }) {
  const baseUrl = "/forgot-password/";
  return api.create(`${baseUrl}`, params);
}

export { login, logout, signup, forgotPassword };
