import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { useMemo, useState } from "react";
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
  user: SessionUser | null
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

  if (id == null || id == "") {
    const result = await createTranslationForUser(user!.id, {
      bookmarkId,
      sourceLangCode: sourceLangCode,
      targetLangCode: user?.sourceLangPreference || "en",
      sourceLangText: text,
    });
    return redirect(`/translate/${result.id}`);
  }

  return redirect(`/translate/${id}`);
};

const TranslationItem = ({ translation }: { translation: Translation }) => {
  return (
    <Form method="post">
      <input type="hidden" name="id" value={translation.id} />
      <input type="hidden" name="bookmarkId" value={translation.bookmarkId} />
      <input
        type="hidden"
        name="sourceLangCode"
        value={translation.sourceLangCode}
      />
      <input type="hidden" name="text" value={translation.sourceLangText} />
      {translation.sourceLangText}
      <input type="submit" value="Submit" />
    </Form>
  );
};

export default function Dashboard() {
  const data = useLoaderData() as LoaderData;
  
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [sourceLangPreference, setSourceLangPreference] = useState<string>(data.user!.sourceLangPreference)

  const translations = useMemo(() => {
    if (showCompleted) {
      return data.translations.filter((translation) => translation.completed);
    }
    return data.translations.filter((translation) => !translation.completed);
  }, [showCompleted]);

  async function onPreferredLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    try {
      await fetch('/user/preference', { 
        method: 'POST', 
        body: JSON.stringify({ sourceLangPreference: event.target.value }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      setSourceLangPreference(event.target.value)
    } catch (err) {
      
    }
  }

  return (
    <div>
      <div>
        <div>
          <button>My Account</button>
        </div>
        <select className="p-2 border rounded-md" name="preferredLanguage" defaultValue={sourceLangPreference} onChange={onPreferredLanguageChange}>
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


      <div>
        <button onClick={() => setShowCompleted(false)}>To-do</button>
        <button onClick={() => setShowCompleted(true)}>Completed</button>
      </div>
      {data.translations.length > 0 ? (
        <div>
          <hr />
          <div>
            {translations.map((translation) => (
              <TranslationItem
                translation={translation}
                key={translation.bookmarkId}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>No bookmarks saved. You can bookmark a tweet to see it here.</div>
      )}
    </div>
  );
}
