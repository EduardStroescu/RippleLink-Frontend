import { User } from "@/types/interfaces";

export function isAuthenticated(): boolean {
  try {
    const authData = window.localStorage.getItem("user");
    if (authData) {
      const parsedData: User = JSON.parse(authData);
      // Check if the parsed data contains the access_token property
      return (
        parsedData &&
        typeof parsedData.access_token === "string" &&
        parsedData.access_token.trim() !== ""
      );
    }
  } catch (error) {
    console.error("Error parsing localStorage item:", error);
  }
  return false;
}
