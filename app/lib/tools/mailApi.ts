import { gmail_v1, google, people_v1 } from "googleapis";
import { ensureAuthenticated } from "../googleAuth";

export const getGmailClient = async () => {
  const auth = await ensureAuthenticated();
  if (!auth) {
    throw new Error("Authentication failed: Unable to obtain OAuth2Client");
  }
  return google.gmail({ version: "v1", auth });
};

export const getContactsClient = async () => {
  const auth = await ensureAuthenticated();
  if (!auth) {
    throw new Error("Authentication failed: Unable to obtain OAuth2Client");
  }
  return google.people({ version: "v1", auth });
};

export const fetchEmailDetails = async (messageId: string) => {
  try {
    const gmailClient = await getGmailClient();
    const emailData = await gmailClient.users.messages.get({
      userId: "me",
      id: messageId,
    });

    const headers = emailData.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";
    const from = headers.find((h) => h.name === "From")?.value || "Unknown";

    // Extract email body
    let body = "No Content";
    if (emailData.data.payload?.body?.data) {
      body = Buffer.from(emailData.data.payload.body.data, "base64").toString();
    } else if (
      emailData.data.payload?.parts &&
      emailData.data.payload.parts.length > 0
    ) {
      // Try to find the text/plain part if the email is multipart
      const textPart = emailData.data.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    }

    return {
      id: messageId,
      threadId: emailData.data.threadId,
      from,
      subject,
      body,
    };
  } catch (error) {
    console.error(`Error fetching email ${messageId}:`, error);
    return null;
  }
};
type GmailMessage = gmail_v1.Schema$Message;

/**
 * Fetches and processes a list of emails based on a given query.
 * @param {any} messages - The  mail API client's result messages.
 * @returns {Promise<Array>} An array of emails with details like subject, sender, and body.
 */
export const fetchEmailList = async (messages: GmailMessage[] | undefined) => {
  try {
    if (!messages) {
      console.log("No emails found");
      return [];
    }

    // Fetch full details for each email
    const emails = await Promise.all(
      messages.map(async (msg) => fetchEmailDetails(msg.id!))
    );

    // Filter out any null responses (failed fetches)
    return emails.filter((email) => email !== null);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
};

export const normalizeText = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const findMatchingContact = (
  contacts: people_v1.Schema$Person[],
  normalizedSearch: string
): string | null => {
  if (normalizedSearch.includes("@")) {
    return normalizedSearch;
  }

  const nameParts = normalizedSearch.split(/\s+/); // Split by spaces

  let firstName = "";
  let lastName = "";

  if (nameParts.length === 1) {
    // If there's only one word, try matching anywhere in the full name (nickname support)
    lastName = nameParts[0];
  } else {
    // If there are multiple words, assume the last one is the last name
    firstName = nameParts[0];
    lastName = nameParts[nameParts.length - 1];
  }

  // **🔍 Try Matching Last Name (if provided)**
  if (lastName) {
    const lastNameRegex = new RegExp(`\\b${lastName}`, "i"); // Partial match for last name
    const lastNameMatch = contacts.find((contact) =>
      contact.names?.some((n) =>
        lastNameRegex.test(normalizeText(n.displayName ?? ""))
      )
    );

    if (lastNameMatch) {
      const matchedName = normalizeText(
        lastNameMatch.names?.[0]?.displayName ?? ""
      );

      // **If a first name exists, validate it (loosely)**
      if (firstName) {
        const firstNameRegex = new RegExp(
          `\\b${firstName.substring(0, 3)}`,
          "i"
        ); // Allow minor typos
        if (!firstNameRegex.test(matchedName)) {
          console.warn(
            `Partial match on last name, but first name differs: ${matchedName}`
          );
          return null;
        }
      }
      return lastNameMatch.emailAddresses?.[0]?.value || null;
    }
  }

  // **🔍 Try Matching First Name (if last name wasn't provided)**
  if (!lastName && firstName) {
    const firstNameRegex = new RegExp(`\\b${firstName.substring(0, 3)}`, "i"); // Allow partial first name match
    const firstNameMatch = contacts.find((contact) =>
      contact.names?.some((n) =>
        firstNameRegex.test(normalizeText(n.displayName ?? ""))
      )
    );

    if (firstNameMatch) {
      return firstNameMatch.emailAddresses?.[0]?.value || null;
    }
  }

  // **🔍 Try Matching Anywhere (for nicknames / one-word searches)**
  const anyMatch = contacts.find((contact) =>
    contact.names?.some((n) =>
      normalizeText(n.displayName ?? "").includes(normalizedSearch)
    )
  );

  if (anyMatch) {
    return anyMatch.emailAddresses?.[0]?.value || null;
  }

  return null;
};
