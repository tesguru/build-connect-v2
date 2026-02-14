import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export const AuthService = {
  login: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.LOGIN, data),
  createCompleteProfile: (data: any) => axiosInstance.post(ENDPOINTS.CONTRACTORS.CREATE_COMPLETE_PROFILE, data),
  register: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.REGISTER, data),
  verifyOTP: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.VERIFY_OTP, data),
  forgotPassword: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, data),
  resendOtp: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.RESEND_OTP, data),
  resetPassword: (data: any) => axiosInstance.post(ENDPOINTS.AUTH.RESET_PASSWORD, data),
  refreshToken: (refreshToken: string) => axiosInstance.post(ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }),
};