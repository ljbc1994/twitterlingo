import type { Translation } from "~/models/translation.server";
import type { SessionUser } from "~/models/user.server";
import {
  createTranslation,
  getTranslationListItems,
} from "~/models/translation.server";
import { getUserById } from "~/models/user.server";
import { getTranslationForLanguage } from "./translator.server";
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

    const [user, translations] = await Promise.all([
      getUserById(userId),
      getTranslationListItems(userId),
    ]);

    if (!Array.isArray(twitterBookmarks)) {
      return [];
    }

    return twitterBookmarks
      .map((item) => {
        const translation = translations.find(
          (trans) => trans.bookmarkId == item.id
        );

        if (!translation) {
          const convert: BookmarkTranslation = {
            id: null as unknown as string,
            bookmarkId: item.id,
            userId: userId,
            sourceLangText: item.text,
            targetLangText: "",
            sourceLangCode: item.lang,
            targetLangCode: user?.sourceLangPreference ?? "en",
            completed: false,
          };

          return convert;
        }

        return translation;
      })
      .filter((item) => item != null);
  } catch (err) {
    throw err;
  }
}

export async function createTranslationForUser(
  userId: SessionUser["id"],
  options: {
    sourceLangText: string;
    sourceLangCode: string;
    targetLangCode: string;
    bookmarkId: string;
  }
) {
  try {
    const targetLangText = await getTranslationForLanguage({
      sourceLangCode: options.sourceLangCode,
      targetLangCode: options.targetLangCode,
      text: options.sourceLangText,
    });

    if (targetLangText != undefined) {
      return await createTranslation({
        sourceLangCode: options.sourceLangCode,
        targetLangCode: options.targetLangCode,
        bookmarkId: options.bookmarkId,
        sourceLangText: options.sourceLangText,
        targetLangText: targetLangText,
        completed: false,
        userId,
      });
    }

    throw new Error("Failed to get target language");
  } catch (err) {
    throw err;
  }
}
