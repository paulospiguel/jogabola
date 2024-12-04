import { generateOTP } from "@/utils";
import { db } from "@repo/db";

export const findTwoFactorAuthTokenByEmail = async (email: string) => {
  const token = await db.twoFactorToken.findUnique({
    where: {
      email,
    },
  });
  return token;
};
export const isTwoFactorAutenticationEnabled = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      isTwoFactorAuthEnabled: true,
    },
  });
  return user?.isTwoFactorAuthEnabled;
};

export const deleteTwoFactorAuthTokenById = async (id: string) => {
  const token = await db.twoFactorToken.delete({
    where: {
      id,
    },
  });
  return token;
};

export const findTwoFactorAuthTokeByToken = async (token: string) => {
  const existingToken = await db.twoFactorToken.findUnique({
    where: {
      token,
    },
  });
  return existingToken;
};

export const createTwoFactorAuthToken = async (email: string) => {
  const token = generateOTP(6);
  const expires = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); //two hours

  const existingToken = await findTwoFactorAuthTokenByEmail(email);
  if (existingToken) {
    await deleteTwoFactorAuthTokenById(existingToken.id);
  }

  const twoFactorAuthToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorAuthToken;
};
