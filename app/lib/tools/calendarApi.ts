import { calendar_v3, google } from "googleapis";
import { ensureAuthenticated } from "../googleAuth";

export interface CalendarEvent {
  event: calendar_v3.Schema$Event;
  calendarId: string;
}

export const getCalendarClient = async () => {
  const auth = await ensureAuthenticated();
  if (!auth) {
    throw new Error("Authentication failed: Unable to obtain OAuth2Client");
  }
  return google.calendar({ version: "v3", auth });
};

export const getAllCalendars = async () => {
  try {
    const calendar = await getCalendarClient();
    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return [];
  }
};

export const parseDateString = (dateString: string): Date | null => {
  // Attempt to parse the date in standard formats
  const parsedDate = new Date(dateString);

  // Ensure it is a valid date
  if (isNaN(parsedDate.getTime())) {
    console.warn(`Invalid date format: "${dateString}"`);
    return null;
  }

  return parsedDate;
};
