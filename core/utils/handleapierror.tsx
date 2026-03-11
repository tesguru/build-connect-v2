import Toast from "react-native-toast-message";

export function handleApiError(error: any, context = "Request") {
  let title = "Oops!";
  let message = `${context} didn't go through. Please try again.`;


  if (error?.response?.data?.message) {

    message = error.response.data.message;
  } 
  else if (error?.response?.data?.error) {

    message = error.response.data.error;
  }
  else if (error?.response?.data?.detail) {

    message = error.response.data.detail;
  }
  else if (error?.response?.data?.errors) {

    if (Array.isArray(error.response.data.errors)) {
      message = error.response.data.errors.join(", ");
    } else if (typeof error.response.data.errors === 'object') {
      message = Object.values(error.response.data.errors).flat().join(", ");
    }
  }
  else if (error?.response) {
 
    const status = error.response.status;

    switch (status) {
      case 400:
        message = error.response.data?.errors 
          ? "Validation failed. Please check your input."
          : "Something seems off. Please check your input.";
        break;
      case 401:
        message = "Your session has expired. Please log in again.";
        break;
      case 403:
        message = "You don't have access to perform this action.";
        break;
      case 404:
        message = "We couldn't find what you were looking for.";
        break;
      case 422:
        if (error.response.data?.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat();
          message = validationErrors.join(", ");
        } else {
          message = "Some fields need attention. Please review and try again.";
        }
        break;
      case 429:
        message = "You're doing that too often. Please wait a bit and try again.";
        break;
      case 500:
        message = "Something went wrong on our side. Please try again later.";
        break;
      default:
        message = `An unexpected error occurred (code ${status}).`;
        break;
    }

  } else if (error?.request) {
    message = "Can't connect right now. Please check your internet connection.";
  } else if (error?.message) {

    message = error.message;
  } else {
    message = "Something went wrong. Please try again.";
  }

 
  if (error?.response?.data?.title) {
    title = error.response.data.title;
  }
Toast.show({
    type: "error",
    text1: title,
    text2:  message
  });
 

  return {
    title,
    message,
    originalError: error,
    status: error?.response?.status,
    data: error?.response?.data
  };
}
