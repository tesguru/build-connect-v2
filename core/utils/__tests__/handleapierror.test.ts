import Toast from "react-native-toast-message";
import {
  handleApiError,
  markSessionEnded,
  normalizeApiError,
} from "../handleapierror";

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const showToast = Toast.show as unknown as jest.Mock;

describe("normalizeApiError", () => {
  it("uses the server message when present", () => {
    const error = {
      response: { status: 422, data: { message: "Budget is too low" } },
    };

    const result = normalizeApiError(error, "Create project");

    expect(result.status).toBe(422);
    expect(result.message).toBe("Budget is too low");
  });

  it("flattens field-level validation errors", () => {
    const error = {
      response: {
        status: 400,
        data: { errors: { email: ["is invalid"], password: "is too short" } },
      },
    };

    expect(normalizeApiError(error).message).toBe("is invalid, is too short");
  });

  it("falls back to a readable message per status", () => {
    const error = { response: { status: 401, data: {} } };

    expect(normalizeApiError(error).message).toBe(
      "Your session has expired. Please log in again.",
    );
  });

  it("recognises timeouts", () => {
    const error = {
      code: "ECONNABORTED",
      message: "timeout of 60000ms exceeded",
    };

    const result = normalizeApiError(error);

    expect(result.isTimeout).toBe(true);
    expect(result.title).toBe("Request Timed Out");
  });

  it("recognises offline requests", () => {
    const result = normalizeApiError({ request: {} });

    expect(result.isNetworkError).toBe(true);
    expect(result.message).toContain("internet connection");
  });

  it("never surfaces raw axios transport text", () => {
    const result = normalizeApiError({ message: "Network Error", request: {} });

    expect(result.message).not.toBe("Network Error");
  });
});

describe("handleApiError", () => {
  it("shows one toast for a failed request", () => {
    const error = {
      response: { status: 404, data: { message: "Project not found" } },
    };

    handleApiError(error, "Load project");

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith({
      type: "error",
      text1: "Oops!",
      text2: "Project not found",
    });
  });

  it("does not report the same error object twice", () => {
    const error = {
      response: { status: 500, data: { message: "Server failed quietly" } },
    };

    handleApiError(error);
    handleApiError(error);

    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it("stays silent when the session was already ended", () => {
    const error = { response: { status: 401, data: {} } };
    markSessionEnded(error);

    handleApiError(error);

    expect(showToast).not.toHaveBeenCalled();
  });
});
