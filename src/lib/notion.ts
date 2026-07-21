import { Client, isFullPage } from "@notionhq/client";

const TypeProperty = {
  Tester: "Tester",
  Waitlist: "Waitlist",
  Team: "Team",
  Investor: "Investor",
  Developer: "Developer",
} as const;

type TypeProperty = (typeof TypeProperty)[keyof typeof TypeProperty];

const TESTER_TYPES: readonly TypeProperty[] = [
  TypeProperty.Tester,
  TypeProperty.Developer,
];

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

export function createTesterChecker(
  fetchTesterEmails: () => Promise<Set<string>>,
  ttlMs = 5 * 60 * 1000,
) {
  let cache: { emails: Set<string>; expiresAt: number } | null = null;
  let refreshing: Promise<void> | null = null;

  function refresh(): Promise<void> {
    if (!refreshing) {
      refreshing = fetchTesterEmails()
        .then(emails => {
          cache = { emails, expiresAt: Date.now() + ttlMs };
        })
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  }

  return async function isTester(email: string): Promise<boolean> {
    const normalized = email.toLowerCase().trim();

    if (!cache) {
      try {
        await refresh();
      } catch (err) {
        console.error("[notion] failed to fetch testers:", err);
        return process.env.NODE_ENV !== "production";
      }
    } else if (Date.now() > cache.expiresAt) {
      // stale-while-revalidate: answer from stale cache, refresh in background
      refresh().catch(err => {
        console.error("[notion] background tester refresh failed:", err);
      });
    }

    return cache?.emails.has(normalized) ?? false;
  };
}

async function fetchTesterEmails(): Promise<Set<string>> {
  const notion = getNotionClient();
  const dataSourceId = getWaitlistDataSourceId();
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      or: TESTER_TYPES.map(type => ({
        property: "Type",
        select: { equals: type },
      })),
    },
  });
  const emails = new Set<string>();
  for (const page of response.results) {
    if (!isFullPage(page)) continue;

    const emailProperty = page.properties.Email;
    if (emailProperty?.type === "email" && emailProperty.email) {
      emails.add(emailProperty.email.toLowerCase().trim());
    }
  }
  return emails;
}

export const isTesterEmail = createTesterChecker(fetchTesterEmails);

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
