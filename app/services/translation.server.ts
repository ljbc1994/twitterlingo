import {
  getTranslationListItems,
  Translation,
} from "~/models/translation.server";
import type { SessionUser } from "~/models/user.server";
import { getBookmarksByUser } from "./twitter.server";

export interface BookmarkTranslation extends Translation {}

export async function getTranslationsByUser(
  userId: SessionUser["id"],
  accessToken: string
): Promise<BookmarkTranslation[]> {
  try {
    const { data: twitterBookmarks } = await getBookmarksByUser(
      userId,
      accessToken
    );
    const translations = await getTranslationListItems({ userId });

    return twitterBookmarks
      .map((item) => {
        const bookmark = translations.find(
          (trans) => trans.bookmarkId == item.id
        );

        if (!bookmark) {
          return null;
        }

        return item;
      })
      .filter(Boolean);
  } catch (err) {
    throw err;
  }
}
