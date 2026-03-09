
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESEND_OTP: "/auth/resend-verification",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_OTP: "/auth/verify-otp",
    CLIENT_VERIFY_IDENTITY: "/auth/client-verify-identity",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    CHANGE_PROFILE: "/auth/profile",
  },

  UPLOAD: {
    PREPARE_UPLOAD: "/files/prepare-upload",
    CONFIRM_UPLOAD: (fileId: string) => `/files/${fileId}/confirm-upload`,
  },

  LOOKUP: {
    PROJECT_TYPES: "/lookups/lookups/project-types",
    EXPERIENCE_RANGES: "/lookups/lookups/experience-ranges",
    AVAILABILITY_OPTIONS: "/lookups/lookups/availability-options",
    TIMELINES: "/lookups/timelines",
    BUDGET_RANGES: "/lookups/budget-ranges",
    MEETING_TYPES: "/lookups/meeting-platforms",
    MILESTONE_STATUS: "/lookups/milestone-statuses",
  },

  DASHBOARD: {
    GET_PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/update",  
  },

  PROJECTS: {
    GET_PROJECTS: "/projects/",
    CREATE_PROJECT: "/projects/",
      PROJECTS:"/projects",
    MARKETPLACE:"/marketplace"
  },
   CONTRACT: {
    CONTRACT: "/contracts/",
  },
  CONTRACTORS: {
    GET_CONTRACTOR: "/contractors/",
    CREATE_COMPLETE_PROFILE: "/profile/contractor/complete",
        VIEW_PROFILE: "/profile/contractor/complete",
  },
    BID:{
    BIDS:"/bids/"
  },
   MEETINGS:{
    MEETINGS:"/meetings/"
  },
   SUPPORT:{
    TICKETS:"/support/tickets"
  },
    ESCROW:{
    ESCROW:"/escrow/"
  }
};
