import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(64, "Password cannot exceed 64 characters"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password cannot exceed 64 characters"),

    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password cannot exceed 64 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], 
  });


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .toLowerCase(),
});

export const userSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["builder", "client"]),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  mobileNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => {
        const cleanedNumber = value.replace(/[\s\-\(\)\+]/g, '');
        return /^[0-9]+$/.test(cleanedNumber) && cleanedNumber.length >= 7 && cleanedNumber.length <= 15;
      },
      {
        message: "Please enter a valid phone number (7-15 digits)",
      }
    ),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the Terms and Privacy Policy",
    }),
});

const fileSchema = z
  .object({
    uri: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
  })
  .nullable()
  .optional();

export const fullProfileSchema = z
  .object({
    businessName: z
      .string()
      .max(100, "Business name is too long")
      .optional()
      .or(z.literal("")),
      
    location: z
      .string()
      .min(1, "City, state is required")
      .max(100, "Location is too long"),

    serviceRadius: z.string().optional(),
    yearOfExperience: z.string().min(1, "Years of experience is required"),

  profilePhoto: fileSchema.refine((val) => !!val, {
    message: "Profile photo is required",
  }),

  contractorLicense: fileSchema.refine((val) => !!val, {
  message: "Contractor license is required",
}),
insuranceDocumentation: fileSchema.refine((val) => !!val, {
  message: "Insurance documentation is required",
}),
additionalInformation: fileSchema.refine((val) => !!val, {
  message: "Additional information is required",
}),
services: z.array(z.string()).min(1, "Select at least one project type"),
projectPhoto: fileSchema.refine((val) => !!val, {
    message: "Profile photo is required",
  }),
startTime: z.string().min(1, "Select start date"),
endTime: z.string().min(1, "Select end date"),
  availableDays: z.array(z.string()).min(1, "Select available days"),
  availableTime: z.string().min(1, "Available time is required"),
  })
  .refine((data) => {
    // If location is provided, serviceRadius is required
    if (data.location && data.location.trim().length > 0) {
      return data.serviceRadius && data.serviceRadius.trim().length > 0;
    }
    return true;
  }, {
    message: "Service radius is required when location is provided",
    path: ["serviceRadius"],
  });
  
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type FullProfileInput = z.infer<typeof fullProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof userSchema>;