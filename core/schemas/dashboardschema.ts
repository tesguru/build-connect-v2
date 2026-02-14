import z from "zod";


const fileSchema = z
  .object({
    uri: z.string(),
    name: z.string().optional(),
    type: z.string().optional(),
  })
  .nullable()
  .optional();

export const submitBidSchema = z.object({
  bidAmount: z
    .number()
    .positive("Bid amount must be greater than 0")
    .min(1, "Bid amount is required"),
  
  proposedTimeline: z
    .string()
    .trim()
    .min(1, "Proposed timeline is required"),
  
  proposal: z
    .string()
    .trim()
    .min(10, "Proposal must be at least 50 characters")
    .max(5000, "Proposal cannot exceed 5000 characters"),
  
  milestones: z
    .array(
      z.object({
        milestoneName: z
          .string()
          .trim()
          .min(1, "Milestone name is required"),
        completionDate: z
          .string()
          .min(1, "Completion date is required"),
        paymentAmount: z
          .number()
          .positive("Payment amount must be greater than 0"),
              paymentPercentage: z.number().min(0).max(100).default(100), 
                    description: z.string().optional(), 
      orderIndex: z.number().default(0), 
      })
    )
    .min(1, "At least one milestone is required"),
  
  portfolioReferences: z.any().refine((val) => !!val, {
  message: "Additional information is required",
}),

});

export const addPropertySchema = z.object({
   price: z
          .number()
          .positive("Price must be greater than 0"),
  
  propertyTitle: z
    .string()
    .trim()
    .min(1, "Property Title is required"),

      propertyType: z
    .string()
    .trim()
    .min(1, "Property type is required"),


      location: z
    .string()
    .trim()
    .min(1, "Location is required"),

      bedroom: z
    .string()
    .trim()
    .min(1, "Bedroom is required"),

      bathroom: z
    .string()
    .trim()
    .min(1, "Bathroom is required"),

     description: z
    .string()
    .trim()
    .min(1, "Description is required"),

      keyfeatures: z
    .string()
    .trim()
    .min(1, "Key features is required"),
  
  propertyImage: fileSchema.refine((val) => !!val, {
  message: "Additional information is required",
}),
});

export const addProjectSchema = z.object({
    projectName: z
    .string()
    .trim()
    .min(1, "Project name is required"),

    projectType: z
    .string()
    .trim()
    .min(1, "Proposed type is required"),
       location: z
    .string()
    .trim()
    .min(1, "Location is required"),
  budget: z
    .string()
    .trim()
    .min(1, "Budget is required"),

    startDate: z.string().min(1, "Select start date"),
    endDate: z.string().min(1, "Select end date"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required"),

  milestones: z
    .array(
      z.object({
        milestoneName: z
          .string()
          .trim()
          .min(1, "Milestone name is required"),
        completionDate: z
          .string()
          .min(1, "Completion date is required"),
        paymentAmount: z
          .number()
          .positive("Payment amount must be greater than 0"),
      })
    )
    .min(1, "At least one milestone is required"),
  
  projectMedia: fileSchema.refine((val) => !!val, {
  message: "projectMedia is required",
}),
});
export const ratingSchema = z.object({

  comment: z
    .string()
    .trim()
    .min(1, "Comment is required"),
  
});


export const linkMortgageSchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  amountAllocated: z.string().optional(),
  document: z.any().nullable().optional(),
});

export type LinkMortgageInput = z.infer<typeof linkMortgageSchema>;
export type SubmitBidInput = z.infer<typeof submitBidSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type AddProjectInput = z.infer<typeof addProjectSchema>;
export type AddPropertyInput = z.infer<typeof addPropertySchema>;

