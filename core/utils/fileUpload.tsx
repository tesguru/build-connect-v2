import { FileUploadResult } from "@/components/Forms/FileUploadComponent";
import * as FileSystem from "expo-file-system/legacy";
import {
  PrepareUploadResponse,
  UploadService,
} from "../services/upload/UploadService";

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

/** Unwraps the `{ success, data }` envelope while tolerating a bare body. */
const unwrap = <T,>(payload: any): T => (payload?.data ?? payload) as T;

const assertEnvelope = (body: any, fallbackMessage: string) => {
  if (body && typeof body === "object" && body.success === false) {
    throw new Error(body.message ?? fallbackMessage);
  }
};

const resolveFileSize = async (file: FileUploadResult): Promise<number> => {
  if (file.size > 0) return file.size;

  const info = await FileSystem.getInfoAsync(file.uri);
  if (info.exists && typeof info.size === "number") return info.size;

  return 0;
};

const storageError = (status: number, body: string) => {
  const error: any = new Error(`Storage upload failed (${status})`);
  error.response = { status, data: body };
  return error;
};

const uploadToStorage = async (
  prepared: PrepareUploadResponse,
  file: FileUploadResult,
): Promise<void> => {
  const result =
    prepared.uploadMethod === "PUT"
      ? await FileSystem.uploadAsync(prepared.uploadUrl, file.uri, {
          httpMethod: "PUT",
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: prepared.uploadHeaders ?? {},
        })
      : await FileSystem.uploadAsync(prepared.uploadUrl, file.uri, {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          mimeType: file.type,
          parameters: prepared.uploadFields ?? {},
        });

  if (result.status < 200 || result.status >= 300) {
    throw storageError(result.status, result.body);
  }
};

/**
 * Uploads a file with the 3-step flow:
 * prepare-upload → direct upload to storage → confirm-upload.
 *
 * @param file        - FileUploadResult from the picker component
 * @param fileType    - e.g. "profile_picture" | "document" | "portfolio"
 * @param description - optional description string
 */
export const uploadFile = async (
  file: FileUploadResult,
  fileType: string,
  description?: string,
): Promise<UploadedFile> => {
  const actualFileSize = await resolveFileSize(file);

  const prepareResponse = await UploadService.prepareUpload({
    fileName: file.name,
    fileSize: actualFileSize,
    mimeType: file.type,
    type: fileType,
    ...(description ? { description } : {}),
  });

  assertEnvelope(
    prepareResponse.data,
    "Could not prepare the upload. Please try again.",
  );

  const prepared = unwrap<PrepareUploadResponse>(prepareResponse.data);
  if (
    !prepared?.fileId ||
    !prepared?.uploadUrl ||
    !prepared?.objectKey ||
    !prepared?.publicUrl ||
    !prepared?.uploadMethod
  ) {
    throw new Error("Upload could not be prepared. Please try again.");
  }

  await uploadToStorage(prepared, file);

  const confirmResponse = await UploadService.confirmUpload(prepared.fileId, {
    objectKey: prepared.objectKey,
    publicUrl: prepared.publicUrl,
    actualFileSize,
  });

  assertEnvelope(
    confirmResponse.data,
    "Upload could not be confirmed. Please try again.",
  );

  const confirmed = unwrap<Partial<UploadedFile>>(confirmResponse.data);

  return {
    id: prepared.fileId,
    type: confirmed?.type ?? fileType,
    originalName: confirmed?.originalName ?? file.name,
    fileName: confirmed?.fileName ?? file.name,
    fileSize: confirmed?.fileSize ?? actualFileSize,
    mimeType: confirmed?.mimeType ?? file.type,
    description: confirmed?.description ?? description ?? null,
    status: confirmed?.status ?? "uploaded",
    publicUrl: confirmed?.publicUrl ?? prepared.publicUrl,
    projectId: confirmed?.projectId ?? null,
    createdAt: confirmed?.createdAt ?? new Date().toISOString(),
  };
};
