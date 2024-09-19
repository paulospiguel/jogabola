import { DEFAULT_SERVER_ERROR_MESSAGE, type InferCtx, createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { getUser } from "./user";

export const actionClient = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof Error) {
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
			track: z
				.object({
					event: z.string(),
					channel: z.string(),
				})
				.optional(),
		});
	},
});

export const authActionClient = actionClientWithMeta.use(async ({ next, clientInput, metadata }) => {
	const result = await next<InferCtx<{ userId: string }>>({ ctx: undefined });
	// const session = await auth();
	// //const session = cookies().get("session")?.value;

	// if (!session) {
	// 	throw new Error("Session not found!");
	// }

	// console.log({ session });

	const { user } = await getUser();

	if (!user?.id) {
		throw new Error("User is not valid!");
	}

	// if (process.env.NODE_ENV === "development") {
	// 	// logger("Input ->", clientInput);
	// 	// logger("Result ->", result.data);
	// 	// logger("Metadata ->", metadata);

	// 	return result;
	// }

	return {
		...result,
		ctx: {
			...result.ctx,
			userId: user.id,
		},
	};
});
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
