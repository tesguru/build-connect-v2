import { create } from 'zustand';
import { FullProfileInput } from '@/core/schemas/authschema';

interface BuilderProfileState {
  formData: Partial<FullProfileInput>;
  setFormData: (data: Partial<FullProfileInput>) => void;
  updateFormField: <K extends keyof FullProfileInput>(field: K, value: FullProfileInput[K]) => void;
  clearFormData: () => void;
}

const defaultFormData: Partial<FullProfileInput> = {
  businessName: "",
  location: "",
  serviceRadius: "",
  yearOfExperience: "",
  profilePhoto: null,
  contractorLicense: null,
  insuranceDocumentation: null,
  additionalInformation: null,
  services: [],
  availableDays: [],
  availableTime: "",
  projectPhoto: null,
  startTime: "",
  endTime: "",
};

export const useBuilderProfileStore = create<BuilderProfileState>((set) => ({
  formData: defaultFormData,

  setFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateFormField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
  },

  clearFormData: () => {
    set({ formData: defaultFormData });
  },
}));

