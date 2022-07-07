import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Bookmark = {
  id: ReturnType<typeof cuid>;
  userId: User["id"];
  sourceLangText: string;
  targetLangText: string;
  sourceLangCode: string;
  targetLangCode: string;
  status: string;
};

type BookmarkItem = {
  pk: User["id"];
  sk: `bookmark#${Bookmark["id"]}`;
};

const skToId = (sk: BookmarkItem["sk"]): Bookmark["id"] => sk.replace(/^note#/, "");
const idToSk = (id: Bookmark["id"]): BookmarkItem["sk"] => `bookmark#${id}`;

export async function getBookmark({
  id,
  userId,
}: Pick<Bookmark, "id" | "userId">): Promise<Bookmark | null> {
  const db = await arc.tables();

  const result = await await db.bookmark.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      sourceLangText: result.sourceLangText,
      targetLangText: result.targetLangText,
      sourceLangCode: result.sourceLangCode,
      targetLangCode: result.targetLangCode,
      status: result.status,
    };
  }
  return null;
}

export async function getBookmarkListItems({
  userId,
}: Pick<Bookmark, "userId">): Promise<Array<Bookmark>> {
  const db = await arc.tables();

  const result = await db.note.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((item: any) => ({
    id: skToId(item.sk),
    userId: item.pk,
    sourceLangText: item.sourceLangText,
    targetLangText: item.targetLangText,
    sourceLangCode: item.sourceLangCode,
    targetLangCode: item.targetLangCode,
    status: item.status,
  }));
}

export async function createBookmark(bookmark: Exclude<Bookmark, "id">): Promise<Bookmark> {
  const db = await arc.tables();

  const result = await db.note.put({
    pk: bookmark.userId,
    sk: idToSk(cuid()),
    sourceLangText: bookmark.sourceLangText,
    targetLangText: bookmark.targetLangText,
    sourceLangCode: bookmark.sourceLangCode,
    targetLangCode: bookmark.targetLangCode,
    status: bookmark.status,
  });

  return {
    id: skToId(result.sk),
    userId: result.pk,
    sourceLangText: bookmark.sourceLangText,
    targetLangText: bookmark.targetLangText,
    sourceLangCode: bookmark.sourceLangCode,
    targetLangCode: bookmark.targetLangCode,
    status: bookmark.status,
  };
}

export async function deleteBookmark({ id, userId }: Pick<Bookmark, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: userId, sk: idToSk(id) });
}
