import { Client } from "@notionhq/client";

function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) throw new Error("NOTION_API_KEY not set");
  return new Client({ auth: apiKey });
}

function getWaitlistDbId() {
  const id = process.env.NOTION_WAITLIST_DB_ID;
  if (!id) throw new Error("NOTION_WAITLIST_DB_ID not set");
  return id;
}

// Cache tester emails for 5 minutes to avoid hammering Notion on every request
let testerCache: { emails: Set<string>; expiresAt: number } | null = null;

export async function isTesterEmail(email: string): Promise<boolean> {
  const now = Date.now();

  if (!testerCache || now > testerCache.expiresAt) {
    try {
      const notion = getNotionClient();
      const dbId = getWaitlistDbId();

      // SDK v5 removed databases.query — use the raw request method
      const response = await notion.request<{ results: unknown[] }>({
        method: "post",
        path: `databases/${dbId}/query`,
        body: {
          filter: {
            property: "Type",
            select: { equals: "tester" },
          },
          page_size: 100,
        },
      });

      const emails = new Set<string>();
      for (const page of response.results) {
        const props = (page as any)?.properties;
        const emailProp = props?.Email?.email as string | null;
        if (emailProp) emails.add(emailProp.toLowerCase().trim());
      }

      testerCache = { emails, expiresAt: now + 5 * 60 * 1000 };
    } catch (err) {
      console.error("[notion] failed to fetch testers:", err);
      // Fail open in dev, closed in prod
      return process.env.NODE_ENV !== "production";
    }
  }

  return testerCache!.emails.has(email.toLowerCase().trim());
}

export async function addToWaitlist(name: string, email: string): Promise<void> {
  const notion = getNotionClient();
  const dbId = getWaitlistDbId();

  await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Email: {
        email: email.toLowerCase().trim(),
      },
      Type: {
        select: { name: "waitlist" },
      },
    },
  });
}
