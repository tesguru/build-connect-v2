import { useAuthStore } from "@/store/Authstore";
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { AuthService } from "../services/auth/AuthService";

import { useRouter } from "expo-router";
import { AuthResponseData } from "../services/auth/authType";

export const useAuth = () => {
  const { setAuthData } = useAuthStore();

const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (res) => {
      const loginData: AuthResponseData = res?.data;
      if (
        (loginData.statusCode === 200 || loginData.statusCode === 201) &&
        loginData.success === true
      ) {
        const { authToken, refreshToken, user } = loginData.data;  

        if (user?.isVerified === false) {
          setAuthData(authToken, refreshToken, user);
          
          Toast.show({
            type: "info",
            text1: "Email Verification Required",
            text2: "Please verify your email to continue",
          });
         router.replace({
  pathname: "/sign_up/verify_email",
  params: {
    email: user.email,
    role: user.role,
    fromLogin: true,
  }
});
        } else {
          setAuthData(authToken, refreshToken, user);
          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: "",
          });
           router.push("/(tab)")
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: loginData?.message || "Invalid credentials. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message || "Invalid credentials. Please try again.";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    },
  });

   const createProfileMutation = useMutation({
     mutationFn: AuthService.createCompleteProfile,
     onSuccess: (res: any) => {
       const profileData = res?.data;
       if (
         (profileData.statusCode === 200 || profileData.statusCode === 201) &&
         profileData.success === true
       ) {
         Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile updated successfully.",
        });
         router.push("/(tab)")
       }
     },
     onError: (error: any) => {
          const errorMessage =
         error?.response?.data?.message ||
         error?.message ||
         "Failed to create Profile.";
       Toast.show({
         type: "error",
         text1: "Submit Failed",
         text2: errorMessage
       });   
     },
   });

  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (res) => {
      const registerData: AuthResponseData = res.data;
      if (
        (registerData.statusCode === 200 || registerData.statusCode === 201) &&
        registerData.success === true
      ) {
     
        const { authToken, refreshToken, user } = registerData.data;
        if (authToken && refreshToken) {
          setAuthData(authToken, refreshToken, user);
        }
        
        Toast.show({
          type: "success",
          text1: "Signup Successful",
          text2: "Please verify your email to continue",
        });

        
       router.push({
  pathname: "/sign_up/verify_email",
  params: {
    email: registerData.data?.user?.email,
    role: registerData.data?.user?.role
  }
});
      } else {
        Toast.show({
          type: "error",
          text1: "Signup Failed",
          text2: registerData.message || "Registration failed. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Signup Failed",
        text2: errorMessage,
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: (res: any) => {
      const forgotPasswordData = res?.data;
      if (
        (forgotPasswordData.statusCode === 200 || forgotPasswordData.statusCode === 201) &&
        forgotPasswordData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Please check your email for the reset password link",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "An error occurred",
        text2: error instanceof Error ? error.message : "Invalid email address",
      });
    },
  });
  
    const changePasswordMutation = useMutation({
    mutationFn: AuthService.changePassword,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Password Change",
          text2: "Password Change Sucessfully",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "An error occurred",
        text2: error instanceof Error ? error.message : "Failed to change password",
      });
    },
  });

  const changeProfileMutation = useMutation({
    mutationFn: AuthService.changeProfile,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (
        (responseData.statusCode === 200 || responseData.statusCode === 201) &&
        responseData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Profile Updated Sucessfully",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "An error occurred",
    text2: error?.response?.data?.message || "Failed to Update Profile",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: { email: string; otp: string; role?: string; fromLogin?: boolean }) => {
      return AuthService.verifyOTP({ email: data.email, otp: data.otp });
    },
    onSuccess: (res: any, variables: { email: string; otp: string; role?: string; fromLogin?: boolean }) => {
      const responseData = res?.data;
      if (res?.status === 200) {
        Toast.show({
          type: "success",
          text1: "Email Verified",
          text2: responseData?.message || "Your email has been verified successfully",
        });
        
        const role = variables?.role;
        const fromLogin = variables?.fromLogin;

        if (role !== undefined || fromLogin !== undefined) {
      
          if (fromLogin) {
            router.replace("/(tab)");
          } else {
       
            if (role === "client") {
              router.replace("/sign_up/client/verify_identity");
            } else {
              router.replace("/(auth)/sign_up/builder/basic_Info_screen");
            }
          }
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: responseData?.data?.message || "Invalid OTP. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Verification failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: AuthService.resendOtp,
    onSuccess: (res: any) => {
      const responseData = res?.data;
      if (res?.status === 200) {
        Toast.show({
          type: "success",
          text1: "OTP Sent",
          text2: responseData.message || "OTP sent successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to send OTP",
          text2: responseData?.message || "Failed to send OTP. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to send OTP",
        text2: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
      });
    },
  });
  
  const ResetPasswordMutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: (res: any) => {
      const resetPasswordData = res?.data;
      if (
        (resetPasswordData.statusCode === 200 || resetPasswordData.statusCode === 201) &&
        resetPasswordData.success === true
      ) {
        Toast.show({
          type: "success",
          text1: "Password Reset Successful",
          text2: resetPasswordData?.message || "Your password has been reset successfully",
        });
        router.replace("/sign_in/signin");
      } else {
        Toast.show({
          type: "error",
          text1: "Reset Failed",
          text2: resetPasswordData?.message || "Failed to reset password. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password. Please try again.";
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: errorMessage,
      });
    },
  });

   const getUserProfile = () => {
    return useQuery({
      queryKey: ['getUserProfile'],
      queryFn: () => AuthService.getProfile(),
    });
  };

  return {
    loginMutation,
    registerMutation,
    forgotPasswordMutation,
    verifyOTPMutation,
    resendOtpMutation,
    ResetPasswordMutation,
    createProfileMutation,
    changePasswordMutation, 
    changeProfileMutation,
    getUserProfile
  };
};
