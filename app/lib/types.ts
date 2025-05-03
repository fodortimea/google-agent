import { Schema, Type } from "@google/genai";
import { getAllCalendars } from "./tools/calendarApi";
import {
  createEvent,
  findEmailByName,
  getEmailsFromThisWeek,
  getEmailsFromToday,
  getThisWeeksEvents,
  getTodaysEvents,
  moveEvent,
  searchEmailsByRecipient,
  searchEmailsBySubject,
  searchEventByDate,
  searchEventByName,
  sendEmail,
} from "./tools/tools";

type ClarifyPlan = {
  action: "clarify";
  missingInfo: string;
  reasoning: string;
};

type SearchPlan = {
  action: "searchInternet";
  query: string;
  reasoning: string;
};

type FunctionCallPlan = {
  action: ToolName;
  params: ToolArgs[ToolName];
  reasoning: string;
};

export type ToolPlan = ClarifyPlan | SearchPlan | FunctionCallPlan;

export const toolHandlers = {
  sendEmail: ({
    recipient,
    subject,
    message,
  }: {
    recipient: string;
    subject: string;
    message: string;
  }) => sendEmail(recipient, subject, message),

  createEvent: ({
    title,
    startDateStr,
    description,
  }: {
    title: string;
    startDateStr: string;
    description?: string;
  }) => createEvent(title, startDateStr, description),

  moveEvent: ({
    eventName,
    oldDate,
    newDate,
  }: {
    eventName: string;
    oldDate: string;
    newDate: string;
  }) => moveEvent(eventName, oldDate, newDate),

  searchEmailsByRecipient: ({ recipient }: { recipient: string }) =>
    searchEmailsByRecipient(recipient),

  searchEmailsBySubject: ({ subject }: { subject: string }) =>
    searchEmailsBySubject(subject),
  findEmailByName: ({ name }: { name: string }) => findEmailByName(name),
  searchEventByName: ({ eventName }: { eventName: string }) =>
    searchEventByName(eventName),
  searchEventByDate: ({ date }: { date: string }) => searchEventByDate(date),

  getEmailsFromToday: () => getEmailsFromToday(),
  getEmailsFromThisWeek: () => getEmailsFromThisWeek(),
  getAllCalendars: () => getAllCalendars(),
  getTodaysEvents: () => getTodaysEvents(),
  getThisWeeksEvents: () => getThisWeeksEvents(),
} as const;

export type ToolName = keyof typeof toolHandlers; // "sendEmail" | "createEvent" | …
export type HandlerArg<T extends ToolName> = Parameters<
  (typeof toolHandlers)[T]
>[0]; // param type or void
export type ToolReturn<T extends ToolName> = Awaited<
  ReturnType<(typeof toolHandlers)[T]>
>;
export type ToolArgs = {
  [K in ToolName]: Parameters<(typeof toolHandlers)[K]>[0]; // void or object
};

export const TOOL_NAMES: string[] = Object.keys(toolHandlers);

export const ACTION_ENUM = [...TOOL_NAMES, "searchInternet", "clarify"];

export const planSchema: Schema=  {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ACTION_ENUM,
        description: "what action should be taken from the toolset",
        nullable: false,
      },
      params: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description:
          "What parameters are needed in order to take the action",
        nullable: true,
      },
      query: {
        type: Type.STRING,
        description:
          "What you should search for on the internet in order to make the data complete",
        nullable: true,
      },
      missingInfo: {
        type: Type.STRING,
        description:
          "What other information do you need from the user in order to carry out the action",
        nullable: true,
      },

      reasoning: {
        type: Type.STRING,
        description: "What is the reasoning behind your decision?",
        nullable: false,
      },
    },

    required: ["action", "reasoning"],
    propertyOrdering: [
      "action",
      "params",
      "query",
      "missingInfo",
      "reasoning",
    ],
  };
