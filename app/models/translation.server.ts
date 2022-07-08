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

interface DatabaseTranslationItem extends TranslationItem {
  bookmarkId: string;
  userId: User["id"];
  sourceLangText: string;
  targetLangText: string;
  sourceLangCode: string;
  targetLangCode: string;
  completed: boolean;
}

const skToId = (sk: TranslationItem["sk"]): Translation["id"] =>
  sk.replace(/^translation#/, "");
const idToSk = (id: Translation["id"]): TranslationItem["sk"] =>
  `translation#${id}`;

function mapFromDatabaseToModel(dbModel: DatabaseTranslationItem): Translation {
  return {
    id: skToId(dbModel.sk),
    userId: dbModel.pk,
    bookmarkId: dbModel.bookmarkId,
    sourceLangText: dbModel.sourceLangText,
    targetLangText: dbModel.targetLangText,
    sourceLangCode: dbModel.sourceLangCode,
    targetLangCode: dbModel.targetLangCode,
    completed: dbModel.completed,
  };
}

export async function getTranslation({
  id,
  userId,
}: Pick<Translation, "id" | "userId">): Promise<Translation | null> {
  const db = await arc.tables();

  const result = await db.translation.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return mapFromDatabaseToModel(result);
  }

  return null;
}

export async function getTranslationListItems(
  userId: Translation["userId"]
): Promise<Array<Translation>> {
  const db = await arc.tables();

  const result = await db.translation.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((item: DatabaseTranslationItem) =>
    mapFromDatabaseToModel(item)
  );
}

export async function createTranslation(
  translation: Omit<Translation, "id">
): Promise<Translation> {
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

  return mapFromDatabaseToModel(result);
}

export async function setCompleteTranslation(
  userId: User["id"],
  translationId: Translation["id"]
) {
  try {
    const db = await arc.tables();

    const translation = await getTranslation({
      id: translationId,
      userId,
    });

    if (translation == null) {
      return false;
    }

    await db.translation.put({
      pk: userId,
      sk: idToSk(translationId),
      bookmarkId: translation.bookmarkId,
      sourceLangText: translation.sourceLangText,
      targetLangText: translation.targetLangText,
      sourceLangCode: translation.sourceLangCode,
      targetLangCode: translation.targetLangCode,
      completed: true,
    });

    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteTranslation({
  id,
  userId,
}: Pick<Translation, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
