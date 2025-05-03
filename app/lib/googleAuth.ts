import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000"; // No callback needed

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

// Store tokens in memory (Replace with DB in production)
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
// const ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;

let cachedAuth: OAuth2Client | null = null;

/**
 * Checks if OAuth credentials exist. If not, return an auth URL.
 */
export const ensureAuthenticated = async (): Promise<OAuth2Client> => {
  if (cachedAuth) {
    return cachedAuth; // Return cached authentication if available
  }
  try {
    // Set refresh token if it's not already set
    if (!oAuth2Client.credentials.refresh_token) {
      oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    }

    // Check if access token exists
    if (!oAuth2Client.credentials.access_token) {
      console.log("🔄 Refreshing access token...");
      const { token } = await oAuth2Client.getAccessToken();

      if (!token) {
        throw new Error("Failed to obtain a new access token.");
      }

      // Update credentials with the new access token
      oAuth2Client.setCredentials({ access_token: token });
      //   oAuth2Client.setCredentials({ access_token: ACCESS_TOKEN });
    }
    cachedAuth = oAuth2Client; // Cache the authenticated client
    console.log("✅ Authentication successful.");
    return oAuth2Client;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Failed to authenticate with Google API.");
  }
};
