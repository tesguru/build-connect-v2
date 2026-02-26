import { UploadService } from "@/core/services/upload/UploadService";
import { FileUploadResult } from "@/components/Forms/FileUploadComponent";

export const uploadFile = async (
  file: FileUploadResult,
  fileType: string,
  description?: string
) => {
  try {
    // Step 1: Prepare upload (same API call as RN)
    const prepareData = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      type: fileType,
      width: file.width || undefined,
      height: file.height || undefined,
      description: description || fileType,
    };

    const prepareResponse = await UploadService.prepareUpload(prepareData);
    const prepareResult = prepareResponse.data;

    if (!prepareResult.success || !prepareResult.data) {
      throw new Error(prepareResult.message || "Failed to prepare upload");
    }

    const { uploadUrl, uploadParams, publicUrl, fileId } = prepareResult.data;

    if (!uploadUrl) throw new Error("Upload URL not received from server");

    // Step 2: Upload to Cloudinary
    const formData = new FormData();

    // ✅ Web: append the actual File object directly (no uri/type/name hack needed)
    formData.append("file", file.file);

    if (uploadParams) {
      Object.entries(uploadParams).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      // ⚠️ Do NOT set Content-Type header — browser sets it with the correct boundary
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.statusText} - ${errorText}`);
    }

    // Step 3: Confirm upload
    const cloudinaryPublicId = uploadParams?.public_id;
    const cloudinarySecureUrl = publicUrl;

    if (!cloudinaryPublicId || !cloudinarySecureUrl || !fileId) {
      throw new Error("Missing required information for confirmation");
    }

    const confirmResponse = await UploadService.confirmUpload(fileId, {
      cloudinaryPublicId,
      cloudinarySecureUrl,
      actualFileSize: file.size,
    });

    return {
      success: true,
      data: confirmResponse.data,
      fileId,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.data?.message ||
      error?.message ||
      "Failed to upload file. Please try again.";

    throw new Error(errorMessage);
  }
};