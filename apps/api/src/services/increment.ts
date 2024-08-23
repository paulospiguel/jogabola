"use server"

import * as z from "zod"
import { createServerAction } from "zsa"

export const incrementNumberAction = createServerAction()
  .input(z.object({
    number: z.number()
  }))
  .handler(async ({ input }) => {
    // Sleep for .5 seconds
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(input.number + 1)
    // Increment the input number by 1
    return {
      counter: input.number + 1
    }
  });