import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import { UploadService } from "../services/upload/UploadService";



export const getMimeType = (
  uri: string,
  fileName: string,
  fallbackType?: string
): string => {
  if (fallbackType && fallbackType.includes("/")) {
    return fallbackType;
  }

  
  const extension =
    fileName.split(".").pop()?.toLowerCase() ||
    uri.split(".").pop()?.toLowerCase() ||
    "";

  // Map extensions to mime types
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return mimeTypes[extension] || "image/jpeg"; 
};


export const uploadFile = async (
  file: FileUploadResult,
  fileType: string,
  description?: string
) => {
  try {
 
    const mimeType = getMimeType(file.uri, file.name, file.type);

    const prepareData = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: mimeType,
      type: fileType,
      width: file.width || undefined,
      height: file.height || undefined,
      description: description || fileType,
    };

    const prepareResponse = await UploadService.prepareUpload(prepareData);
    const prepareResult = prepareResponse.data;

    if (!prepareResult.success || !prepareResult.data) {
      const errorMessage = prepareResult.message || "Failed to prepare upload";
      throw new Error(errorMessage);
    }

    const { uploadUrl, uploadParams, publicUrl, fileId } = prepareResult.data;

    if (!uploadUrl) {
      throw new Error("Upload URL not received from server");
    }

 
    const formData = new FormData();

   
    formData.append("file", {
      uri: file.uri,
      type: mimeType,
      name: file.name,
    } as any);

 
    if (uploadParams) {
      Object.keys(uploadParams).forEach((key) => {
        formData.append(key, String(uploadParams[key]));
      });
    }

  
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Failed to upload file: ${uploadResponse.statusText} - ${errorText}`
      );
    }
    const cloudinaryPublicId = uploadParams?.public_id;
    const cloudinarySecureUrl = publicUrl;

    if (!cloudinaryPublicId || !cloudinarySecureUrl || !fileId) {
      throw new Error("Missing required information for confirmation");
    }

    const confirmData = {
      cloudinaryPublicId: cloudinaryPublicId,
      cloudinarySecureUrl: cloudinarySecureUrl,
      actualFileSize: file.size,
    };

    const confirmResponse = await UploadService.confirmUpload(
      fileId,
      confirmData
    );

    return {
      success: true,
      data: confirmResponse.data,
      fileId,
    };
  } catch (error: any) {
    console.error(`Error uploading ${fileType}:`, error);

    let errorMessage = "Failed to upload file. Please try again.";

    if (error?.response?.data) {
   
      const apiError = error.response.data;
      errorMessage =
        apiError.message || apiError.data?.message || errorMessage;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};
