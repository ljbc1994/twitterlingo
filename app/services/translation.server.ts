import type { Translation } from "~/models/translation.server";
import { createTranslation } from "~/models/translation.server";
import { getTranslationListItems } from "~/models/translation.server";
import { getUserById, SessionUser } from "~/models/user.server";
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

    const user = await getUserById(userId)
    const translations = await getTranslationListItems(userId);

    if (!Array.isArray(twitterBookmarks)) {
      return [];
    }

    return twitterBookmarks
      .map((item) => {
        const translation = translations.find(
          (trans) => trans.bookmarkId == item.id
        );

        if (!translation) {
          return {
            bookmarkId: item.id,
            userId: userId,
            sourceLangText: item.text,
            targetLangText: '',
            sourceLangCode: item.lang,
            targetLangCode: user?.sourceLangPreference || 'en',
            completed: false,
          };
        }

        return translation;
      })
      .filter(Boolean) as unknown as BookmarkTranslation[];
  } catch (err) {
    throw err;
  }
}

export async function createTranslationForUser(
  userId: SessionUser["id"],
  options: {
    sourceLangText: string,
    sourceLangCode: string,
    targetLangCode: string,
    bookmarkId: string
  }
) {
  try {
    const targetLangText = await getTranslationForLanguage({
      sourceLangCode: options.sourceLangCode,
      targetLangCode: options.targetLangCode,
      text: options.sourceLangText,
    })

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
  
    throw new Error('Failed to get target lang');
  } catch (err) {
    throw err;
  }
}