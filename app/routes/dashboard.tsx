import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { useMemo, useState } from "react";
import TranslationItem from "~/components/dashboard/TranslationItem";
import { languages } from "~/constants/languages";
import { Translation } from "~/models/translation.server";
import { SessionUser } from "~/models/user.server";

import { getUser } from "~/services/session.server";
import {
  createTranslationForUser,
  getTranslationsByUser,
} from "~/services/translation.server";

type LoaderData = {
  translations: Awaited<ReturnType<typeof getTranslationsByUser>>;
  user: SessionUser | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const translations = await getTranslationsByUser(user!.id, user!.accessToken);

  return json<LoaderData>({ translations, user });
};

export let action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  const form = await request.formData();
  const id = form.get("id") as string;
  const bookmarkId = form.get("bookmarkId") as string;
  const text = form.get("text") as string;
  const sourceLangCode = form.get("sourceLangCode") as string;
  const targetLangCode = form.get("targetLangCode") as string;

  if (id == null || id == "") {
    const result = await createTranslationForUser(user!.id, {
      bookmarkId,
      sourceLangCode: sourceLangCode,
      targetLangCode: targetLangCode ?? user?.sourceLangPreference,
      sourceLangText: text,
    });
    return redirect(`/translate/${result.id}`);
  }

  return redirect(`/translate/${id}`);
};

export default function Dashboard() {
  const data = useLoaderData() as LoaderData;

  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [sourceLangPreference, setSourceLangPreference] = useState<string>(
    data.user!.sourceLangPreference
  );

  const translations = useMemo(() => {
    if (showCompleted) {
      return data.translations.filter((translation) => translation.completed);
    }
    return data.translations.filter((translation) => !translation.completed);
  }, [showCompleted]);

  async function onPreferredLanguageChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    try {
      await fetch("/user/preference", {
        method: "POST",
        body: JSON.stringify({ sourceLangPreference: event.target.value }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSourceLangPreference(event.target.value);
    } catch (err) {}
  }

  return (
    <div className="relative min-h-screen bg-blue-900">
      <nav className="flex container mx-auto">
        <div className="flex w-full bg-blue-900 p-4">
          <div className="flex w-full align-center justify-between">
            <div>
              <img className="rounded-full" src={data.user?.profile?.photos?.[0].value ?? ''} alt="twitter profile" />
            </div>
            <div className="flex">
              <div className="self-center mr-3">
                <img className="rounded-md" src={`/_static/icons/${sourceLangPreference.toUpperCase()}.svg`} />
              </div>
              <select
                className="rounded-md border border-blue-400 px-3 py-2 self-center bg-blue-900 text-blue-300"
                name="preferredLanguage"
                defaultValue={sourceLangPreference}
                onChange={onPreferredLanguageChange}
                style={{ width: '125px' }}
              >
                <option>Please select a language...</option>
                {languages.map(function ({ name, langCode }) {
                  return (
                    <option key={langCode} value={langCode}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4">
        <div className="py-4 grid gap-2 grid-cols-2">
          <button className={`text-blue-200 p-2 hover:bg-blue-800 rounded-md ${!showCompleted && 'bg-blue-700'}`} onClick={() => setShowCompleted(false)}>
            Todo 👀
          </button>
          <button className={`text-blue-200 p-2 hover:bg-blue-800 rounded-md ${showCompleted && 'bg-blue-700'}`} onClick={() => setShowCompleted(true)}>
            Done ✅
          </button>
        </div>

        {data.translations.length > 0 ? (
          <div>
            <div className="grid gap-3">
              {translations.map((translation) => (
                <TranslationItem
                  translation={translation}
                  targetLang={sourceLangPreference}
                  key={translation.bookmarkId}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-white text-center">No bookmarks saved. You can bookmark a tweet to see it here.</p>
        )}
      </main>
    </div>
  );
}
