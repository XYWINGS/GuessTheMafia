import { AxiosError } from "axios";

//Extract the error message from common response types
export const getErrorMessage = (error: unknown, defaultErrorMessage: string) => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error_message || defaultErrorMessage;
  }

  if (error instanceof Error) {
    return error.message || defaultErrorMessage;
  }

  return defaultErrorMessage;
};

//Get the user's geo location through browser
export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error.message);
        reject(new Error("Unable to retrieve your location. Permission denied or unavailable."));
      }
    );
  });
};
