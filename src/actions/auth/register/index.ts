"use server";

import { RegisterSchema } from "@/schemas/auth";
import { createVerificationToken } from "@/services/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "@/lib/db";
import bcryptjs from "bcryptjs";
import type { z } from "zod";
import { sendAccountVerificationEmail } from "../email-verification";
import { RoleValues as Role } from "@/schemas/roles";

/**
 * This method creates the user for Credentials provider
 * @param {z.infer<typeof RegisterSchema>} user - The new user data.
 * @returns {Promise<{error?: string, success?: string}>} The result of the password change request.
 */
export const register = async (user: z.infer<typeof RegisterSchema>) => {
  const valid = await RegisterSchema.safeParse(user);

  if (!valid.success) {
    return {
      error: "Dados inválidos",
    };
  }

  try {
    const { name, email, password } = user;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const createdUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER,
      },
    });
    //Account verification flow with e-mail
    const verificationToken = await createVerificationToken(email);
    await sendAccountVerificationEmail(createdUser, verificationToken.token);
    return {
      success: "E-mail de verificação enviado",
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error: "Já existe uma conta relacionada a este e-mail.",
        };
      }
    }
    // return { error };

    throw error;
  }
};
