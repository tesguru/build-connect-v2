import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export interface PrepareUploadData {
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: string;
  width?: number;
  height?: number;
  description?: string;
}

export interface ConfirmUploadData {
  cloudinaryPublicId: string;
  cloudinarySecureUrl: string;
  actualFileSize: number;
}

export const UploadService = {
  prepareUpload: (data: PrepareUploadData) =>
    axiosInstance.post(ENDPOINTS.UPLOAD.PREPARE_UPLOAD, data),
  
  confirmUpload: (fileId: string, data: ConfirmUploadData) =>
    axiosInstance.put(ENDPOINTS.UPLOAD.CONFIRM_UPLOAD(fileId), data),
};

