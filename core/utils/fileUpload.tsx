import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import axiosInstance from "../services/axios";


export interface UploadedFile {
  id: string;
  type: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  description: string | null;
  status: string;
  publicUrl: string;
  projectId: string | null;
  createdAt: string;
}

export interface UploadResponse {
  code: string;
  data: UploadedFile;
  message: string;
  success: boolean;
  reqId: string;
  statusCode: number;
}

/**
 * Upload any file to the API in a single FormData POST.
 *
 * @param file       - FileUploadResult from the picker component
 * @param fileType   - e.g. "profile_picture" | "document" | "report"
 * @param description - optional description string
 */
export const uploadFile = async (
  file: FileUploadResult,
  fileType: string,
  description?: string
): Promise<UploadedFile> => {
  const formData = new FormData();

  // Attach the binary file
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  // Attach metadata fields expected by the API
  formData.append("type", fileType);
  if (description) formData.append("description", description);
  if (file.size) formData.append("fileSize", String(file.size));

  try {
    const response = await axiosInstance.post<UploadResponse>(
      "/files/upload",          
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message ?? "Upload failed");
    }

    return response.data.data;
  } catch (error: any) {
   
    const message: string =
      error?.response?.data?.message ??
      error?.response?.data?.data?.message ??
      error?.message ??
      "Failed to upload file. Please try again.";

    throw new Error(message);
  }
};