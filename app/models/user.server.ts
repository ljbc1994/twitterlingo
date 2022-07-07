import arc from "@architect/functions";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import type { OAuth2Profile } from "~/auth/TwitterOAuth2Strategy";

export type User = {
  id: string;
  email: string;
  sourceLangPreference: string;
};

export interface SessionUser extends User {
  accessToken: string;
  profile: OAuth2Profile;
}

export type Password = { password: string };

export async function getUserById(id: User["id"]): Promise<User | null> {
  const db = await arc.tables();
  const result = await db.user.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": id },
  });

  const [record] = result.Items;
  if (record) {
    return {
      id: record.pk,
      email: record.email,
      sourceLangPreference: record.sourceLangPreference,
    };
  }
  return null;
}

export async function createTwitterUser({
  profile,
}: {
  profile: OAuth2Profile;
}) {
  const db = await arc.tables();

  await db.user.put({
    pk: `id#${profile.id}`,
    email: "",
  });

  const user = await getUserById(`id#${profile.id}`);
  invariant(user, `User not found after being created. This should not happen`);

  return user;
}

export async function findOrCreateFromTwitter({
  profile,
  accessToken,
}: {
  profile: OAuth2Profile;
  accessToken: string;
}) {
  function getUserData(user: User): SessionUser {
    return {
      ...user,
      accessToken,
      profile,
    };
  }

  let user = await getUserById(`id#${profile.id}`);

  if (user) {
    return getUserData(user);
  } else {
    const newUser = await createTwitterUser({
      profile,
    });
    return getUserData(newUser);
  }
}

export async function setSourceLangPreference(
  userId: User["id"],
  sourceLang: string
) {
  const db = await arc.tables();
  let user = await getUserById(`id#${userId}`);

  try {
    if (user) {
      await db.user.put({
        pk: `id#${userId}`,
        sourceLangPreference: sourceLang,
      });
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export async function deleteUser(email: User["email"]) {
  const db = await arc.tables();
  await db.password.delete({ pk: `email#${email}` });
  await db.user.delete({ pk: `email#${email}` });
}