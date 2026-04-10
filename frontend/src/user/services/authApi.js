import api from "./Axios";

export async function userRegister(firstname, lastname, email, password) {
  const response = await api.post("/api/user/register", {
    firstname,
    lastname,
    email,
    password,
  });
  return response.data;
}

export async function userLogin(email, password) {
  const response = await api.post("/api/user/login", {
    email,
    password,
  });
  return response.data;
}

export async function userVerify(otp, token) {
  const response = await api.post("/api/user/verify-email", {
    otp,
    token,
  });
  return response.data;
}

export async function getME() {
  const response = await api.get("/api/user/get-me");
  return response.data;
}

export async function userLogOut() {
  const response = await api.post("/api/user/logout");
  return response.data;
}

export async function updateProfile(formData) {
  const response = await api.put("/api/user/updateProfile", formData);
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post("/api/user/forgot-password", { email });
  return response.data;
}

export async function verifyForgotOtp(otp, token) {
  const response = await api.post("/api/user/verify-forgot-otp", {
    otp,
    token,
  });
  return response.data;
}

export async function resetPassword(token, newPassword) {
  const response = await api.post("/api/user/reset-password", {
    token,
    newPassword,
  });
  return response.data;
}

export async function resendOtp(token) {
  const response = await api.post("/api/user/resend-otp", { token });
  return response.data;
}

export async function contactUsApi(formData) {
  const response = await api.post("/api/user/contact", formData);
  return response.data;
}
