import { ENDPOINTS } from "@/constants/endpoints";
import axiosInstance from "../axios";

export type UploadMethod = "PUT" | "POST";

export interface PrepareUploadData {
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: string;
  projectId?: string;
  width?: number;
  height?: number;
  description?: string;
}

export interface PrepareUploadResponse {
  fileId: string;
  uploadMethod: UploadMethod;
  uploadUrl: string;
  uploadHeaders?: Record<string, string>;
  uploadFields?: Record<string, string>;
  objectKey: string;
  publicUrl: string;
  expiresAt?: string;
}

export interface ConfirmUploadData {
  objectKey: string;
  publicUrl: string;
  actualFileSize: number;
}

export const UploadService = {
  prepareUpload: (data: PrepareUploadData) =>
    axiosInstance.post(ENDPOINTS.UPLOAD.PREPARE_UPLOAD, data),

  confirmUpload: (fileId: string, data: ConfirmUploadData) =>
    axiosInstance.put(ENDPOINTS.UPLOAD.CONFIRM_UPLOAD(fileId), data),
};
