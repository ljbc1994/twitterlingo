import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Translation = {
  id: ReturnType<typeof cuid>;
  bookmarkId: string;
  userId: User["id"];
  sourceLangText: string;
  targetLangText: string;
  sourceLangCode: string;
  targetLangCode: string;
  completed: boolean;
};

type TranslationItem = {
  pk: User["id"];
  sk: `translation#${Translation["id"]}`;
};

const skToId = (sk: TranslationItem["sk"]): Translation["id"] => sk.replace(/^translation#/, "");
const idToSk = (id: Translation["id"]): TranslationItem["sk"] => `translation#${id}`;

export async function getTranslation({
  id,
  userId,
}: Pick<Translation, "id" | "userId">): Promise<Translation | null> {
  const db = await arc.tables();

  const result = await db.translation.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      bookmarkId: result.bookmarkId,
      sourceLangText: result.sourceLangText,
      targetLangText: result.targetLangText,
      sourceLangCode: result.sourceLangCode,
      targetLangCode: result.targetLangCode,
      completed: result.completed,
    };
  }

  return null;
}

export async function getTranslationListItems(userId: Translation['userId']): Promise<Array<Translation>> {
  const db = await arc.tables();

  const result = await db.translation.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((item: any) => ({
    id: skToId(item.sk),
    userId: item.pk,
    bookmarkId: item.bookmarkId,
    sourceLangText: item.sourceLangText,
    targetLangText: item.targetLangText,
    sourceLangCode: item.sourceLangCode,
    targetLangCode: item.targetLangCode,
    completed: item.completed,
  }));
}

export async function createTranslation(translation: Omit<Translation, "id">): Promise<Translation> {
  const db = await arc.tables();

  const result = await db.translation.put({
    pk: translation.userId,
    sk: idToSk(cuid()),
    bookmarkId: translation.bookmarkId,
    sourceLangText: translation.sourceLangText,
    targetLangText: translation.targetLangText,
    sourceLangCode: translation.sourceLangCode,
    targetLangCode: translation.targetLangCode,
    completed: translation.completed,
  });

  return {
    id: skToId(result.sk),
    userId: result.pk,
    bookmarkId: result.bookmarkId,
    sourceLangText: result.sourceLangText,
    targetLangText: result.targetLangText,
    sourceLangCode: result.sourceLangCode,
    targetLangCode: result.targetLangCode,
    completed: result.completed,
  };
}

export async function setCompleteTranslation(
  userId: User["id"],
  translationId: Translation['id']
) {
  try {
    const db = await arc.tables();

    await db.translation.put({
      pk: userId,
      sk: idToSk(translationId),
      complete: true,
    });

    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteTranslation({ id, userId }: Pick<Translation, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
