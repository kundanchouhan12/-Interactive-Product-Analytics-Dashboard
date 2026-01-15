import API from "./axios";

export const login = async (username, password) => {
  const res = await API.post("/auth/login", { username, password });
  localStorage.setItem("token", res.data.token); // store JWT
  return res.data;
};

export const register = async (username, password, age, gender) => {
  const res = await API.post("/auth/register", { username, password, age, gender });
  return res.data;
};
