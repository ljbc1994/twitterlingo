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
  status: string;
};

type TranslationItem = {
  pk: User["id"];
  sk: `translation#${Translation["id"]}`;
};

const skToId = (sk: TranslationItem["sk"]): Translation["id"] => sk.replace(/^note#/, "");
const idToSk = (id: Translation["id"]): TranslationItem["sk"] => `translation#${id}`;

export async function getTranslation({
  id,
  userId,
}: Pick<Translation, "id" | "userId">): Promise<Translation | null> {
  const db = await arc.tables();

  const result = await await db.translation.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      bookmarkId: result.bookmarkId,
      sourceLangText: result.sourceLangText,
      targetLangText: result.targetLangText,
      sourceLangCode: result.sourceLangCode,
      targetLangCode: result.targetLangCode,
      status: result.status,
    };
  }
  return null;
}

export async function getTranslationListItems({
  userId,
}: Pick<Translation, "userId">): Promise<Array<Translation>> {
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
    status: item.status,
  }));
}

export async function createTranslation(translation: Exclude<Translation, "id">): Promise<Translation> {
  const db = await arc.tables();

  const result = await db.note.put({
    pk: translation.userId,
    sk: idToSk(cuid()),
    sourceLangText: translation.sourceLangText,
    targetLangText: translation.targetLangText,
    sourceLangCode: translation.sourceLangCode,
    targetLangCode: translation.targetLangCode,
    status: translation.status,
  });

  return {
    id: skToId(result.sk),
    userId: result.pk,
    bookmarkId: result.bookmarkId,
    sourceLangText: translation.sourceLangText,
    targetLangText: translation.targetLangText,
    sourceLangCode: translation.sourceLangCode,
    targetLangCode: translation.targetLangCode,
    status: translation.status,
  };
}

export async function deleteBookmark({ id, userId }: Pick<Translation, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
