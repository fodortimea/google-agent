import { NextRequest, NextResponse } from "next/server";
import { ensureAuthenticated } from "@/app/lib/googleAuth";
import { planToolCallWithReasoning } from "@/app/lib/agent/planToolCallWithReasoning";
import { embed } from "@/app/lib/llm/embedding";
import { supabase } from "@/app/lib/db/supabaseClient";
import { runWithFunctionCalling } from "@/app/lib/agent/runWithFunctionCalling";
import { Content, Part } from "@google/genai";
import { reflectPlanWithFeedback } from "@/app/lib/agent/evaluatePlanWithFeedback";
import { describeInlineData } from "@/app/lib/agent/describeInlineData";
import { convertTextToAudio } from "@/app/lib/llm/tts/convertTextToAudio";

export async function POST(request: NextRequest) {
  try {
    const authUrl = await ensureAuthenticated();
    if (!authUrl) {
      return NextResponse.json({
        action: "AUTH_REQUIRED",
        message: "Please authenticate via Google OAuth",
        authUrl,
      });
    }

    const formData = await request.formData();
    const lastUserMessage: Content = JSON.parse(
      (formData.get("message") as string) || "{}"
    );
    const userCommand = await describeInlineData(lastUserMessage.parts);
    const sessionHistory: Content[] = JSON.parse(
      formData.get("history") as string
    );
    const history: Content[] = [...sessionHistory];
    const userContent = {
      role: "user",
      parts: [{ text: userCommand }],
    } as Content;
    history.push(userContent);
    sessionHistory.push(userContent);
    // 1. let the model plan
    const originalPlan = await planToolCallWithReasoning(userCommand, history);
    const { plan, feedbacks } = await reflectPlanWithFeedback(
      userCommand,
      originalPlan
    );
    const requestFeedback: boolean = originalPlan.action !== plan.action;

    history.push({ role: "model", parts: [{ text: JSON.stringify(plan) }] });

    // 2. build a short summary for later semantic search
    const summary = (() => {
      if (plan.action === "clarify") return `Clarify → ${plan.missingInfo}`;
      if (plan.action === "searchInternet") return `Search → ${plan.query}`;
      return `${plan.action} → ${
        plan.reasoning
      } with parameters ${JSON.stringify(plan.params)}…`;
    })();

    // 3. create embedding
    const embedding = await embed(`${userCommand} | ${summary}`);

    // 4. insert into Supabase
    const { data: inserted, error } = await supabase
      .from("interactions")
      .insert({
        command: userCommand,
        action: plan.action,
        reasoning: plan.reasoning,
        summary,
        embedding,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("DB insert failed:", error);
      return NextResponse.json({ error: "db_insert_failed" }, { status: 500 });
    }
    const interactionId = inserted.id;

    // 5. execute the tool if it’s a real action
    history.push({
      role: "user",
      parts: [
        {
          text: "Having all these information come up with the best possble solution.",
        },
      ],
    });
    const result = await runWithFunctionCalling(history, plan, feedbacks);
    const responseChat = { role: "model", parts: [{ text: result }] };
    sessionHistory.push(responseChat);
    const audioMode =
      lastUserMessage?.parts?.some((part) =>
        part.inlineData?.mimeType?.startsWith("audio/")
      ) || false;
    if (audioMode) {
      // If the user sent an audio message, we need to convert the result to audio
      const audioBase64 = await convertTextToAudio(result);
      if (!audioBase64) {
        return NextResponse.json({
          ok: false,
          error: "Failed to convert text to audio",
        });
      }

      return NextResponse.json({
        ok: true,
        result: {
          role: "model",
          parts: [
            {
              inlineData: {
                mimeType: "audio/wav",
                data: audioBase64.toString("base64"),
              },
            } as Part,
          ],
        },
        interactionId,
        requestFeedback,
        sessionHistory,
      });
    }
    console.log("the result is: " + result);
    return NextResponse.json({
      ok: true,
      result: {
        role: "model",
        parts: [{ text: result }],
      },
      interactionId,
      requestFeedback,
      sessionHistory,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
