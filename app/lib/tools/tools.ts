import { FunctionDeclaration, Type } from "@google/genai";

import {
  fetchEmailList,
  findMatchingContact,
  getContactsClient,
  getGmailClient,
  normalizeText,
} from "./mailApi";
import {
  CalendarEvent,
  getAllCalendars,
  getCalendarClient,
  parseDateString,
} from "./calendarApi";

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "getUnreadEmails",
    description: "Fetches all unread emails.",
  },
  {
    name: "getEmailsFromToday",
    description: "Fetches all emails received today.",
  },
  {
    name: "getEmailsFromThisWeek",
    description: "Fetches all emails received this week.",
  },
  {
    name: "searchEmailsByRecipient",
    description: "Fetches emails by a given recipient.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipient: {
          type: Type.STRING,
          description: "The name of the recipient.",
        },
      },
      required: ["recipient"],
    },
  },
  {
    name: "searchEmailsBySubject",
    description: "Searches emails by subject (partial or full).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description: "The term that is being searched ",
        },
      },
      required: ["subject"],
    },
  },
  {
    name: "findEmailByName",
    description: "Fetches emails by a google handle.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "the Google handle that is being searched.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "sendEmail",
    description:
      "Sends an email to the specified recipient with subject and message.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        recipient: {
          type: Type.STRING,
          description: "Recipient's email address",
        },
        subject: { type: Type.STRING, description: "Subject of the email" },
        message: { type: Type.STRING, description: "Body of the email" },
      },
      required: ["recipient", "subject", "message"],
    },
  },
  {
    name: "getTodaysEvents",
    description:
      "Fetches all events from the google calendar that are happening today.",
  },
  {
    name: "getThisWeeksEvents",
    description:
      "Fetches all events from the google calendar that are happening this week.",
  },
  {
    name: "searchEventByName",
    description: "Fetches an event by a ggiven name.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventName: {
          type: Type.STRING,
          description: "The name of the event that should be retrieved.",
        },
      },
      required: ["eventName"],
    },
  },
  {
    name: "searchEventByDate",
    description: "Finds events by a given date in string format.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        dateString: {
          type: Type.STRING,
          description:
            "the date in string format, that will be parsed as a date type.",
        },
      },
      required: ["dateString"],
    },
  },
  {
    name: "moveEvent",
    description: "Moves an existing google event to a new date and time.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventName: {
          type: Type.STRING,
          description: "The title of the event, for example: Team Meeting.",
        },
        oldDate: {
          type: Type.STRING,
          description: "The old date of the meeting for example Tuesday 6PM.",
        },
        newDate: {
          type: Type.STRING,
          description: "The new date of the meeting for example Friday 7PM.",
        },
      },
      required: ["eventName", "oldDate", "newDate"],
    },
  },
  {
    name: "createEvent",
    description:
      "Creates a new calendar event with the provided title and time.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Event title." },
        startDateStr: {
          type: Type.STRING,
          description: "ISO timestamp for the event in string.",
        },
        description: {
          type: Type.STRING,
          description: "Optional description of the event.",
        },
      },
      required: ["title", "startDateStr"],
    },
  },
];

export const getEmailsFromToday1FunctionDeclaration = {
  name: "getEmailsFromToday1",
  description: "SFetches all emails received today.",
};

// 📩 Fetch unread emails
export const getUnreadEmails = async () => {
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    q: "is:unread",
  });

  return response.data.messages || [];
};

// 📅 Fetch emails from today
export const getEmailsFromToday = async () => {
  try {
    const gmail = await getGmailClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day
    const afterDate = Math.floor(today.getTime() / 1000); // Convert to UNIX timestamp

    const response = await gmail.users.messages.list({
      userId: "me",
      q: `after:${afterDate}`,
    });

    return await fetchEmailList(response.data.messages);
  } catch (error) {
    console.error("Error fetching today's emails:", error);
    return [];
  }
};

// 📆 Fetch emails from this week
export const getEmailsFromThisWeek = async () => {
  const gmail = await getGmailClient();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  oneWeekAgo.setHours(0, 0, 0, 0); // Start of the day

  const response = await gmail.users.messages.list({
    userId: "me",
    q: `after:${Math.floor(oneWeekAgo.getTime() / 1000)}`,
  });

  return await fetchEmailList(response.data.messages);
};

// 🔍 Search emails by recipient
export const searchEmailsByRecipient = async (recipient: string) => {
  const recipientEmail = await findEmailByName(recipient);
  if (!recipientEmail) return [];
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.list({
    userId: "me",
    q: `from:${recipientEmail}`,
  });

  return await fetchEmailList(response.data.messages);
};

// 🔍 Search emails by subject (partial or full)
export const searchEmailsBySubject = async (subject: string) => {
  const gmail = await getGmailClient();
  const response = await gmail.users.messages.list({
    userId: "me",
    q: `subject:(${subject})`, // Searches for subject containing the term
  });

  return await fetchEmailList(response.data.messages);
};

export const findEmailByName = async (name: string): Promise<string | null> => {
  try {
    const peopleClient = await getContactsClient();
    const response = await peopleClient.people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses",
      pageSize: 500, // Fetch up to 500 contacts
    });

    const contacts = response.data.connections;
    if (!contacts || contacts.length === 0) {
      console.warn("No contacts found.");
      return null;
    }

    const normalizedSearch = normalizeText(name);

    return findMatchingContact(contacts, normalizedSearch);
  } catch (error) {
    console.error("Error fetching contact email:", error);
    return null;
  }
};

// 📨 Send an email
export const sendEmail = async (
  recipient: string,
  subject: string,
  message: string
) => {
  const gmail = await getGmailClient();
  const recipientEmail = await findEmailByName(recipient);
  // ✅ Ensure proper email formatting
  const emailContent = [
    `From: me`,
    `To: ${recipientEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    "",
    message, // ✅ Double newline separates headers from body
  ].join("\n");

  // ✅ Correct Base64 encoding
  const encodedMessage = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // ✅ Remove padding

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  return response.data;
};

export const getTodaysEvents = async () => {
  try {
    const calendar = await getCalendarClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const calendars = await getAllCalendars();

    const allEvents = await Promise.all(
      calendars.map(async (cal) => {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          timeMin: today.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });
        return response.data.items || [];
      })
    );

    return allEvents.flat(); // Combine all events into a single array
  } catch (error) {
    console.error("Error fetching today's events:", error);
    return [];
  }
};

export const getThisWeeksEvents = async () => {
  try {
    const calendar = await getCalendarClient();
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const calendars = await getAllCalendars();

    const allEvents = await Promise.all(
      calendars.map(async (cal) => {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          timeMin: startOfWeek.toISOString(),
          timeMax: endOfWeek.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });
        return response.data.items || [];
      })
    );

    return allEvents.flat(); // Merge all events
  } catch (error) {
    console.error("Error fetching this week's events:", error);
    return [];
  }
};

export const searchEventByName = async (eventName: string) => {
  try {
    const calendar = await getCalendarClient();
    const calendars = await getAllCalendars();

    const allEvents = await Promise.all(
      calendars.map(async (cal) => {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          q: eventName, // ✅ Partial match search
          singleEvents: true,
          orderBy: "startTime",
        });
        return response.data.items || [];
      })
    );

    return allEvents.flat();
  } catch (error) {
    console.error(`Error searching event by name "${eventName}":`, error);
    return [];
  }
};

export const searchEventByDate = async (
  dateString: string
): Promise<CalendarEvent[]> => {
  try {
    const date = parseDateString(dateString);
    if (!date) {
      return [];
    }

    const calendar = await getCalendarClient();
    const calendars = await getAllCalendars();

    const timeMin = new Date(date.setHours(0, 0, 0, 0)).toISOString(); // Start of day
    const timeMax = new Date(date.setHours(23, 59, 59, 999)).toISOString(); // End of day

    const allEvents = await Promise.all(
      calendars.map(async (cal) => {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
        });

        return (response.data.items || []).map((event) => ({
          event,
          calendarId: cal.id ?? "", // Ensure it's always a string
        }));
      })
    );

    return allEvents.flat(); // Flatten to return a single array of CalendarEvent objects
  } catch (error) {
    console.error(`Error searching events on ${dateString}`, error);
    return [];
  }
};

export const moveEvent = async (
  eventName: string, // Example: "Team Meeting"
  oldDate: string, // Example: "Tuesday 6PM"
  newDate: string // Example: "Friday 8PM"
) => {
  try {
    const calendar = await getCalendarClient();

    // 🟢 Parse the old and new dates
    const parsedOldDate = parseDateString(oldDate);
    const parsedNewDate = parseDateString(newDate);

    if (!parsedOldDate || !parsedNewDate) {
      throw new Error("Invalid old or new date format.");
    }

    // 🟢 Step 1: Search for the event by date
    const eventResults = await searchEventByDate(oldDate);

    if (!eventResults || eventResults.length === 0) {
      console.warn(`No events found on ${oldDate}`);
      return null;
    }

    // 🟢 Step 2: Find the specific event by name
    const foundEventResult = eventResults.find(
      (e) => e.event.summary === eventName
    );

    if (!foundEventResult) {
      console.warn(`No event named "${eventName}" found on ${oldDate}`);
      return null;
    }

    const foundEvent = foundEventResult.event;
    const foundCalendarId = foundEventResult.calendarId;

    if (!foundCalendarId) {
      console.warn(`No calendar ID found for event "${eventName}".`);
      return null;
    }

    // 🟢 Step 3: Compute the new time
    const startTimeStr = foundEvent.start?.dateTime;
    const endTimeStr = foundEvent.end?.dateTime;

    if (!startTimeStr || !endTimeStr) {
      console.warn(`Event "${eventName}" has missing start or end time.`);
      return null;
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const durationMs = endTime.getTime() - startTime.getTime();

    if (durationMs <= 0) {
      console.warn(`Event "${eventName}" has invalid duration.`);
      return null;
    }

    // 🔹 Compute new end time by adding the duration
    const newEndTime = new Date(parsedNewDate.getTime() + durationMs);

    console.log(
      `📅 Moving "${foundEvent.summary}" from ${
        foundEvent.start?.dateTime
      } to ${parsedNewDate.toISOString()}`
    );
    console.log("📝 Found event ID:", foundEvent.id);
    console.log("📅 Using calendar ID:", foundCalendarId);
    console.log("🔍 Event details:", foundEvent);

    // 🟢 Step 4: Move the event
    const response = await calendar.events.patch({
      calendarId: foundCalendarId,
      eventId: foundEvent.id!,
      requestBody: {
        start: { dateTime: parsedNewDate.toISOString() },
        end: { dateTime: newEndTime.toISOString() },
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error moving event: ${eventName} on ${oldDate}`, error);
    return null;
  }
};

export const createEvent = async (
  title: string,
  startDateStr: string, // Accepts date as string
  description?: string
) => {
  try {
    const calendar = await getCalendarClient();

    const startDate = parseDateString(startDateStr);

    if (!startDate) {
      throw new Error("Invalid date format provided.");
    }

    const response = await calendar.events.insert({
      calendarId: "primary", // Change to specific calendar if needed
      requestBody: {
        summary: title,
        description: description || "",
        start: {
          dateTime: new Date(startDate).toISOString(),
        },
        end: {
          dateTime: new Date(
            startDate.setHours(startDate.getHours() + 1)
          ).toISOString(),
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
};
