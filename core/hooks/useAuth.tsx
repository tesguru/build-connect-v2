import { useAuthStore } from "@/store/Authstore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthService } from "../services/auth/AuthService";
import { handleApiError, showApiErrorToast } from "../utils/handleapierror";

export function useAuth() {
  const setAuthData = useAuthStore().setAuthData;
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        data?.statusCode !== 200 &&
        data?.statusCode !== 201 &&
        data?.success !== true
      ) {
        showApiErrorToast(
          "Login Failed",
          data?.message || "Invalid credentials. Please try again.",
        );
        return;
      }

      const { authToken, refreshToken, user } = data.data;

      if (user?.isVerified === false) {
        setAuthData(authToken, refreshToken, user);
        Toast.show({
          type: "info",
          text1: "Email Verification Required",
          text2: "Please verify your email to continue",
        });
        router.replace({
          pathname: "/sign_up/verify_email",
          params: { email: user.email, role: user.role, fromLogin: "true" },
        });
        return;
      }

      setAuthData(authToken, refreshToken, user);
      Toast.show({ type: "success", text1: "Login Successful", text2: "" });
      router.push("/(tab)");
    },
    onError: (err: any) => {
      handleApiError(err, "Login failed. Please try again.", {
        title: "Login Failed",
        fallbackMessage: "Invalid credentials. Please try again.",
      });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: AuthService.createCompleteProfile,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile updated successfully.",
        });
        router.push("/(tab)");
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Failed to create profile.", {
        title: "Submit Failed",
        fallbackMessage: "Failed to create profile.",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,

    onSuccess: async (response: any) => {
      const data = response?.data;

      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        const { authToken, refreshToken, user } = data.data;

        await setAuthData(authToken, refreshToken, user);

        Toast.show({
          type: "success",
          text1: "Signup Successful",
          text2: "Please verify your email to continue",
        });
      }
    },

    onError: (err: any) => {
      handleApiError(err, "Registration failed. Please try again.", {
        title: "Signup Failed",
        fallbackMessage: "Registration failed. Please try again.",
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Please check your email for the reset password link",
        });
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Invalid email address.", {
        title: "Unable to Send Email",
        fallbackMessage: "Invalid email address.",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: AuthService.changePassword,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Password Change",
          text2: "Password Change Sucessfully", // [sic] typo preserved from bytecode
        });
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Failed to change password.", {
        title: "Password Change Failed",
        fallbackMessage: "Failed to change password.",
      });
    },
  });

  const changeProfileMutation = useMutation({
    mutationFn: AuthService.changeProfile,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Profile Updated Sucessfully", // [sic] typo preserved from bytecode
        });
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Failed to update profile.", {
        title: "Profile Update Failed",
        fallbackMessage: "Failed to update profile.",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (variables: { email: string; otp: string }) =>
      AuthService.verifyOTP({ email: variables.email, otp: variables.otp }),
    onSuccess: (response: any, variables: any) => {
      const data = response?.data;
      const status = response?.status;
      if (status !== 200) {
        showApiErrorToast(
          "Verification Failed",
          data?.message || "Invalid OTP. Please try again.",
        );
        return;
      }

      Toast.show({
        type: "success",
        text1: "Email Verified",
        text2: data?.message || "Your email has been verified successfully",
      });

      const role = variables?.role;
      const fromLogin = variables?.fromLogin;

      if (role === undefined && !fromLogin) {
        return;
      }
      if (fromLogin) {
        router.replace("/(tab)");
      } else if (role === "client") {
        router.replace("/sign_up/client/verify_identity");
      } else {
        router.replace("/(auth)/sign_up/builder/basic_Info_screen");
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Verification failed. Please try again.", {
        title: "Verification Failed",
        fallbackMessage: "Verification failed. Please try again.",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: AuthService.resendOtp,
    onSuccess: (response: any) => {
      const data = response?.data;
      const status = response?.status;
      if (status !== 200) {
        showApiErrorToast(
          "Failed to Send OTP",
          data?.message || "Failed to send OTP. Please try again.",
        );
        return;
      }
      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: data?.message || "OTP sent successfully",
      });
    },
    onError: (err: any) => {
      handleApiError(err, "Failed to send OTP. Please try again.", {
        title: "Failed to Send OTP",
        fallbackMessage: "Failed to send OTP. Please try again.",
      });
    },
  });

  const ResetPasswordMutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        data?.statusCode !== 200 &&
        data?.statusCode !== 201 &&
        data?.success !== true
      ) {
        showApiErrorToast(
          "Reset Failed",
          data?.message || "Failed to reset password. Please try again.",
        );
        return;
      }
      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
        text2: data?.message || "Your password has been reset successfully",
      });
      router.replace("/sign_in/signin");
    },
    onError: (err: any) => {
      handleApiError(err, "Failed to reset password. Please try again.", {
        title: "Reset Failed",
        fallbackMessage: "Failed to reset password. Please try again.",
      });
    },
  });

  const getUserProfile = () =>
    useQuery({
      queryKey: ["getUserProfile"],
      queryFn: () => AuthService.getProfile(),
    });
  const createDeleteMutation = useMutation({
    mutationFn: AuthService.AccountDeletion,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Account Deletion Initiated successfully.",
        });
        router.push("/(tab)");
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Account deletion request failed.", {
        title: "Request Failed",
        fallbackMessage: "Account deletion request failed.",
      });
    },
  });

  const getAccountDeletion = () =>
    useQuery({
      queryKey: ["getAccountDeletion"],
      queryFn: () => AuthService.getAccountDeletion(),
    });
  const cancelProfileDeleteMutation = useMutation({
    mutationFn: AuthService.cancelDeletion,
    onSuccess: (response: any) => {
      const data = response?.data;
      if (
        (data?.statusCode === 200 || data?.statusCode === 201) &&
        data?.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Account Deletion Initiated successfully.",
        });
        router.push("/(tab)");
      }
    },
    onError: (err: any) => {
      handleApiError(err, "Account deletion request failed.", {
        title: "Request Failed",
        fallbackMessage: "Account deletion request failed.",
      });
    },
  });
  return {
    loginMutation,
    createDeleteMutation,
    getAccountDeletion,
    cancelProfileDeleteMutation,
    registerMutation,
    forgotPasswordMutation,
    verifyOTPMutation,
    resendOtpMutation,
    ResetPasswordMutation,
    createProfileMutation,
    changePasswordMutation,
    changeProfileMutation,
    getUserProfile,
  };
}
