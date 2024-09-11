import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { z } from "zod";
import { getUser } from "./user";
// import { headers } from "next/headers";

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const actionClientWithMeta = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      track: z
        .object({
          event: z.string(),
          channel: z.string(),
        })
        .optional(),
    });
  },
});

export const authActionClient = actionClientWithMeta.use(
  async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: undefined });

    if (process.env.NODE_ENV === "development") {
      // logger("Input ->", clientInput);
      // logger("Result ->", result.data);
      // logger("Metadata ->", metadata);

      return result;
    }

    return result;
  }
).use(async ({ next, metadata }) => {
  // const ip = headers().get("x-forwarded-for");

  // const { success, remaining } = await ratelimit.limit(
  //   `${ip}-${metadata.name}`,
  // );

  // if (!success) {
  //   throw new Error("Too many requests");
  // }

  return next({
    //   ctx: {
    //     ratelimit: {
    //       remaining,
    //     },
    //   },
  });
}).use(async ({ next, metadata }) => {
  const user = await getUser();
  // const supabase = createClient();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (metadata) {
    // const analytics = await setupAnalytics({
    //   userId: user.id,
    //   fullName: user.name,
    // });

    // if (metadata.track) {
    //   analytics.track(metadata.track);
    // }
  }

  return next({
    ctx: {
      user,
    },
  });

  // return Sentry.withServerActionInstrumentation(metadata.name, async () => {
  //   return next({
  //     ctx: {
  //       supabase,
  //       user: user.data,
  //     },
  //   });
  // });
});