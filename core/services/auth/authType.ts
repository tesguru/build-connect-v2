export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponseData {
    code: string;
    success: boolean;
    statusCode: number;
    message: string;
    reqId: string;
    data: { 
        authToken: string;
        refreshToken: string;
        user: User;
    }
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    role: string;
    verificationStatus: string;
    isEmailVerified: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}