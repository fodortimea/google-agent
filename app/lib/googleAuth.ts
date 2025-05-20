import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";

/**
 * Checks if OAuth credentials exist. If not, return an auth URL.
 */
export const ensureAuthenticated = async (): Promise<OAuth2Client> => {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("❌ No access token found in session");
    throw new Error("User is not authenticated with Google.");
  }

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({
    access_token: session.accessToken,
  });

  return oAuth2Client;
};
