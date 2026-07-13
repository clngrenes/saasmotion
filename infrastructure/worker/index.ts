/**
 * AWS Lambda SQS-Worker für Remotion Lambda.
 *
 * Deployment: Wird als Standard Node.js AWS Lambda deployt und per SQS-Trigger aufgerufen.
 * Aufgabe: Konsumiert die SQS Queue, extrahiert die Video Props und startet `renderMediaOnLambda`.
 * Es leitet den Status über den Webhook an das Next.js Backend zurück.
 */

import { renderMediaOnLambda } from "@remotion/lambda/client";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import type { SqsRenderMessage } from "../../src/types/render-job";

// Region und Name der auf AWS deployten Remotion Lambda Funktion
const REGION = (process.env.REMOTION_AWS_REGION || "eu-central-1") as any;
const FUNCTION_NAME = process.env.REMOTION_FUNCTION_NAME || "remotion-render-4-0-489";
const SERVE_URL = process.env.REMOTION_SERVE_URL || "https://xxx.eu-central-1.amazonaws.com";
const NEXTJS_WEBHOOK_URL = process.env.NEXTJS_WEBHOOK_URL || "https://my-saas.com/api/render/webhook";

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

async function processRecord(record: SQSRecord) {
  try {
    const payload = JSON.parse(record.body) as SqsRenderMessage;
    const { jobId, props } = payload;

    console.log(`[Worker] Starting render for job ${jobId}`);

    // Wir rufen Remotion Lambda asynchron auf. Die Ausführung auf *dieser* Worker-Lambda
    // ist sofort fertig, sobald renderMediaOnLambda() den Job bei AWS gestartet hat.
    // Das tatsächliche Rendern dauert länger; Remotion Lambda ruft am Ende den Webhook auf.
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: REGION,
      functionName: FUNCTION_NAME,
      serveUrl: SERVE_URL,
      composition: "ScreenshotVideo",
      inputProps: props,
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 1,
      privacy: "public", // s3VideoUrl soll public read sein
      webhook: {
        url: NEXTJS_WEBHOOK_URL,
        secret: process.env.WEBHOOK_SECRET || "my-secret",
      },
      // Wir könnten die jobId in customData packen, um sie im Webhook wiederzubekommen:
      // envVariables: { JOB_ID: jobId }
    });

    console.log(`[Worker] Successfully dispatched to Remotion Lambda.`);
    console.log(`[Worker] renderId: ${renderId}, bucketName: ${bucketName}`);

    // Hinweis: In einem echten Setup würde man jetzt die `renderId` direkt
    // in Supabase zum Job updaten, damit wir wissen, welche renderId zu welchem Job gehört.
    await updateSupabaseRenderId(jobId, renderId);

  } catch (error) {
    console.error("[Worker] Error processing record:", error);
    throw error; // Lässt SQS den Request ggf. in eine DLQ schieben
  }
}

async function updateSupabaseRenderId(jobId: string, renderId: string) {
  // In einer echten Lambda-Umgebung würden wir auch hier den `@supabase/supabase-js` Client importieren.
  // Da dieser Code auf AWS läuft, braucht er als Env-Variablen NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY.
  
  /*
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase
    .from('render_jobs')
    .update({ remotion_render_id: renderId, status: 'rendering' })
    .eq('id', jobId);

  if (error) {
    console.error(`[Worker] Failed to update job ${jobId} in Supabase:`, error);
  }
  */
  
  console.log(`[Worker-Mock] Supabase Updated: Job ${jobId} is now 'rendering' with renderId ${renderId}`);
}
