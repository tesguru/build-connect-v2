import { create } from "zustand";

export interface MortgageFormData {
  // Property
  propertyId?: string;

  // Step 1 — Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  emailAddress: string;
  phoneNumber: string;
  currentAddress: string;
  city: string;
  state: string;
  postalCode: string;

  employmentStatusId: string;
  occupation: string;
  employerName: string;
  annualGrossIncome: number;
  savingsAccountBalance: number;
  checkingAccountBalance: number;
  investments: number;
  creditCardDebits: number;
  otherLoans: number;

  // Step 3 — Documents (raw file objects before upload)
  idDocumentFile: any | null;
  proofOfIncomeFile: any | null;
  bankStatementFile: any | null;
}

interface MortgageStoreState {
  formData: Partial<MortgageFormData>;
  setFormData: (data: Partial<MortgageFormData>) => void;
  updateFormField: <K extends keyof MortgageFormData>(
    field: K,
    value: MortgageFormData[K],
  ) => void;
  clearFormData: () => void;
}

const defaultFormData: Partial<MortgageFormData> = {
  propertyId: "",

  // Personal Info
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  emailAddress: "",
  phoneNumber: "",
  currentAddress: "",
  city: "",
  state: "",
  postalCode: "",

  // Employment & Income
  employmentStatusId: "",
  occupation: "",
  employerName: "",
  annualGrossIncome: 0,
  savingsAccountBalance: 0,
  checkingAccountBalance: 0,
  investments: 0,
  creditCardDebits: 0,
  otherLoans: 0,

  // Documents
  idDocumentFile: null,
  proofOfIncomeFile: null,
  bankStatementFile: null,
};

export const useMortgageStore = create<MortgageStoreState>((set) => ({
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
