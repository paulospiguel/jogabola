import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  type InferCtx,
  createSafeActionClient,
} from "next-safe-action";
import { z } from "zod";
import { auth } from "@auth";
import { UserRole } from "@repo/db";

export const ctxSchema = z
  .object({
    userId: z.string(),
    roles: z.array(z.nativeEnum(UserRole)),
    teamId: z.string().optional(),
    canCreateTeam: z.boolean().optional(),
  })
  .optional();

export type SafeCtx = {
  userId: string;
  teamId?: string;
  canCreateTeam?: boolean;
};

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      console.log(e);

      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const actionClientWithMeta = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
      // track: z
      //   .object({
      //     event: z.string(),
      //     channel: z.string(),
      //   })
      //   .optional(),
    });
  },
});

export const authActionClient = actionClientWithMeta.use(
  async ({ next, clientInput, metadata }) => {
    const result = await next<InferCtx<z.infer<typeof ctxSchema>>>({
      ctx: undefined,
    });
    const session = await auth();
    const user = session?.user;

    // //const session = cookies().get("session")?.value;

    // if (!session) {
    // 	throw new Error("Session not found!");
    // }

    // console.log({ session });

    //const { user, canCreateTeam } = (await getUser()) || {};

    if (!user?.id) {
      throw new Error("Logged user is not valid!");
    }

    // if (process.env.NODE_ENV === "development") {
    // 	// logger("Input ->", clientInput);
    // 	// logger("Result ->", result.data);
    // 	// logger("Metadata ->", metadata);

    // 	return result;
    // }

    return next({
      ctx: {
        ...result.ctx,
        userId: user?.id,
      },
    });
  },
);
// .use(async ({ next, metadata }) => {
// 	// const ip = headers().get("x-forwarded-for");

// 	// const { success, remaining } = await ratelimit.limit(
// 	//   `${ip}-${metadata.name}`,
// 	// );

// 	// if (!success) {
// 	//   throw new Error("Too many requests");
// 	// }

// 	return next({
// 		//   ctx: {
// 		//     ratelimit: {
// 		//       remaining,
// 		//     },
// 		//   },
// 	});
// })
// .use(async ({ next, metadata }) => {
// 	const user = await getUser();
// 	// const supabase = createClient();

// 	if (!user) {
// 		throw new Error("Unauthorized");
// 	}

// 	if (metadata) {
// 		// const analytics = await setupAnalytics({
// 		//   userId: user.id,
// 		//   fullName: user.name,
// 		// });
// 		// if (metadata.track) {
// 		//   analytics.track(metadata.track);
// 		// }
// 	}

// 	return next({
// 		ctx: {
// 			user,
// 		},
// 	});

// 	// return Sentry.withServerActionInstrumentation(metadata.name, async () => {
// 	//   return next({
// 	//     ctx: {
// 	//       supabase,
// 	//       user: user.data,
// 	//     },
// 	//   });
// 	// });
// });
