import { Client } from "@notionhq/client";

enum TypeProperty {
  Tester = "Tester",
  Waitlist = "Waitlist",
  Team = "Team",
  Investor = "Investor",
  Developer = "Developer",
}

function getNotionClient() {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) throw new Error("NOTION_API_KEY not set");
  return new Client({ auth: apiKey });
}

function getWaitlistDataSourceId() {
  const id = process.env.NOTION_WAITLIST_DATA_SOURCE_ID;
  if (!id) throw new Error("NOTION_WAITLIST_DATA_SOURCE_ID not set");
  return id;
}

let testerCache: { emails: Set<string>; expiresAt: number } | null = null;

export async function isTesterEmail(email: string): Promise<boolean> {
  const now = Date.now();

  if (!testerCache || now > testerCache.expiresAt) {
    try {
      const notion = getNotionClient();
      const dataSourceId = getWaitlistDataSourceId();
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: {
          or: [
            {
              property: "Type",
              select: { equals: TypeProperty.Tester },
            },
            {
              property: "Type",
              select: { equals: TypeProperty.Developer },
            },
          ],
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
      return process.env.NODE_ENV !== "production";
    }
  }

  return testerCache!.emails.has(email.toLowerCase().trim());
}

export async function addToWaitlist(
  name: string,
  email: string,
): Promise<void> {
  const notion = getNotionClient();
  const dataSourceId = getWaitlistDataSourceId();

  await notion.pages.create({
    parent: {
      data_source_id: dataSourceId,
    },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Email: {
        email: email.toLowerCase().trim(),
      },
      Type: {
        select: { name: TypeProperty.Waitlist },
      },
    },
  });
}
