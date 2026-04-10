import React, { useContext } from "react";
import { Authcontext } from "../context/authContext.jsx";
import { 
  contactUsApi, 
  resendOtp, 
  resetPassword, 
  verifyForgotOtp, 
  forgotPassword, 
  updateProfile, 
  userLogOut, 
  getME, 
  userVerify, 
  userRegister, 
  userLogin 
} from "../services/authApi";

export const useAuth = () => {
  const context = useContext(Authcontext);

  const { user, loading, setUser, setLoading } = context;

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await userLogin(email, password);
      localStorage.setItem("accessToken", response.accessToken);
      setUser(response.user);
      return response.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (firstname, lastname, email, password) => {
    setLoading(true);
    try {
      const response = await userRegister(firstname, lastname, email, password);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp, token) => {
    setLoading(true);
    try {
      await userVerify(otp, token);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await getME();
      setUser(response.user);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    setLoading(true);
    try {
      await userLogOut();
      localStorage.removeItem("accessToken");
      setUser(null);
    } catch (err) {
      localStorage.removeItem("accessToken");
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    setLoading(true);
    try {
      const response = await updateProfile(formData);
      setUser(response.user);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setLoading(false); // Success case for step 1 of forgot password doesn't redirect yet
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (otp, token) => {
    setLoading(true);
    try {
      const response = await verifyForgotOtp(otp, token);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (token, newPassword) => {
    setLoading(true);
    try {
      const response = await resetPassword(token, newPassword);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (token) => {
    setLoading(true);
    try {
      const response = await resendOtp(token);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (formData) => {
    setLoading(true);
    try {
      const response = await contactUsApi(formData);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleVerify,
    fetchUser,
    handleLogOut,
    handleUpdateProfile,
    handleForgotPassword,
    handleVerifyForgotOtp,
    handleResetPassword,
    handleResendOtp,
    handleContact,
  };
};
