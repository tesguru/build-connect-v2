import * as FileSystem from "expo-file-system/legacy";
import { UploadService } from "../../services/upload/UploadService";
import { uploadFile } from "../fileUpload";

jest.mock("expo-file-system/legacy", () => ({
  getInfoAsync: jest.fn(),
  uploadAsync: jest.fn(),
  FileSystemUploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
}));

jest.mock("../../services/upload/UploadService", () => ({
  UploadService: {
    prepareUpload: jest.fn(),
    confirmUpload: jest.fn(),
  },
}));

const prepareMock = UploadService.prepareUpload as jest.Mock;
const confirmMock = UploadService.confirmUpload as jest.Mock;
const uploadMock = FileSystem.uploadAsync as jest.Mock;
const getInfoMock = FileSystem.getInfoAsync as jest.Mock;

const file = {
  uri: "file:///tmp/id.jpg",
  name: "id.jpg",
  type: "image/jpeg",
  size: 2048,
};

const putPrepared = {
  fileId: "file_1",
  uploadMethod: "PUT",
  uploadUrl: "https://r2.example.com/put?sig=abc",
  uploadHeaders: { "Content-Type": "image/jpeg" },
  objectKey: "files/user/file_1.jpg",
  publicUrl: "https://cdn.example.com/files/user/file_1.jpg",
};

const postPrepared = {
  fileId: "file_2",
  uploadMethod: "POST",
  uploadUrl: "https://api.cloudinary.com/v1_1/demo/image/upload",
  uploadFields: { api_key: "123", timestamp: "1700000000", signature: "sig" },
  objectKey: "files/user/file_2.jpg",
  publicUrl: "https://res.cloudinary.com/demo/image/upload/file_2.jpg",
};

const prepareEnvelope = (data: unknown) => ({
  data: { success: true, data },
});

const confirmEnvelope = (data: unknown = {}) => ({
  data: { success: true, data },
});

beforeEach(() => {
  prepareMock.mockResolvedValue(prepareEnvelope(putPrepared));
  uploadMock.mockResolvedValue({ status: 200, body: "" });
  confirmMock.mockResolvedValue(confirmEnvelope({ status: "uploaded" }));
  getInfoMock.mockResolvedValue({ exists: true, size: 2048 });
});

describe("uploadFile (prepare -> storage -> confirm)", () => {
  it("uploads with a signed PUT and confirms with the prepared keys", async () => {
    const result = await uploadFile(file, "id_document", "ID Document");

    expect(prepareMock).toHaveBeenCalledWith({
      fileName: "id.jpg",
      fileSize: 2048,
      mimeType: "image/jpeg",
      type: "id_document",
      description: "ID Document",
    });

    expect(uploadMock).toHaveBeenCalledWith(
      putPrepared.uploadUrl,
      file.uri,
      expect.objectContaining({
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: putPrepared.uploadHeaders,
      }),
    );

    const options = uploadMock.mock.calls[0][2];
    expect(options.headers).not.toHaveProperty("Authorization");

    expect(confirmMock).toHaveBeenCalledWith("file_1", {
      objectKey: putPrepared.objectKey,
      publicUrl: putPrepared.publicUrl,
      actualFileSize: 2048,
    });

    expect(result).toMatchObject({
      id: "file_1",
      status: "uploaded",
      publicUrl: putPrepared.publicUrl,
      originalName: "id.jpg",
      mimeType: "image/jpeg",
    });
  });

  it("uploads to Cloudinary with multipart fields and no auth header", async () => {
    prepareMock.mockResolvedValue(prepareEnvelope(postPrepared));

    await uploadFile(file, "work_showcase");

    expect(uploadMock).toHaveBeenCalledWith(
      postPrepared.uploadUrl,
      file.uri,
      expect.objectContaining({
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        mimeType: "image/jpeg",
        parameters: postPrepared.uploadFields,
      }),
    );

    const options = uploadMock.mock.calls[0][2];
    expect(options).not.toHaveProperty("headers");
    expect(options).not.toHaveProperty("Authorization");
  });

  it("reads the real size from disk when the picker reports none", async () => {
    getInfoMock.mockResolvedValue({ exists: true, size: 4096 });

    await uploadFile({ ...file, size: 0 }, "portfolio");

    expect(getInfoMock).toHaveBeenCalledWith(file.uri);
    expect(prepareMock).toHaveBeenCalledWith(
      expect.objectContaining({ fileSize: 4096 }),
    );
    expect(confirmMock).toHaveBeenCalledWith(
      "file_1",
      expect.objectContaining({ actualFileSize: 4096 }),
    );
  });

  it("throws with the storage status and skips confirm when the upload fails", async () => {
    uploadMock.mockResolvedValue({ status: 403, body: "SignatureDoesNotMatch" });

    await expect(uploadFile(file, "id_document")).rejects.toMatchObject({
      response: { status: 403, data: "SignatureDoesNotMatch" },
    });

    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("throws the server message when confirm is rejected", async () => {
    confirmMock.mockResolvedValue({
      data: { success: false, message: "File already confirmed" },
    });

    await expect(uploadFile(file, "id_document")).rejects.toThrow(
      "File already confirmed",
    );
  });

  it("rejects an incomplete prepare response before touching storage", async () => {
    prepareMock.mockResolvedValue(
      prepareEnvelope({ ...putPrepared, uploadUrl: undefined }),
    );

    await expect(uploadFile(file, "id_document")).rejects.toThrow(
      "Upload could not be prepared",
    );

    expect(uploadMock).not.toHaveBeenCalled();
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it("accepts a prepare response without the success envelope", async () => {
    prepareMock.mockResolvedValue({ data: putPrepared });

    const result = await uploadFile(file, "id_document");

    expect(result.id).toBe("file_1");
  });
});
