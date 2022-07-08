import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { useState } from "react";
import { languages } from "~/constants/languages";
import { getUser } from "~/services/session.server";
import { getTranslationsByUser } from "~/services/translation.server";

type LoaderData = {
  translations: Awaited<ReturnType<typeof getTranslationsByUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const translations = await getTranslationsByUser(user!.id, user!.accessToken);

  return json<LoaderData>({ translations });
};

export default function Dashboard() {
  const data = useLoaderData() as LoaderData;
  const { translations } = data;

  const pendingTranslations = translations.filter(function (t) {
    return !t.completed;
  });

  const completedTranslations = translations.filter(function (t) {
    return t.completed;
  });

  console.log("data", translations);

  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  return (
    <div>
      <div>
        <div>
          <button>My Account</button>
        </div>
        <div>
          <select>
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
      <div>
        <div>
          <button onClick={() => setShowCompleted(false)}>To-do</button>
          <button onClick={() => setShowCompleted(true)}>Completed</button>
        </div>
        <hr />
        <div>
          {showCompleted ? (
            <div>
              <p>Here are your completed translations.</p>
              <ul>
                {completedTranslations.map(function () {
                  return <li>t</li>;
                })}
              </ul>
            </div>
          ) : (
            <div>
              <p>Here are your pending translations.</p>{" "}
              <ul>
                {pendingTranslations.map(function ({ sourceLangText }) {
                  return (
                    <li>
                      <p>{sourceLangText}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <div>
          <p>
            You don't have any translations. Bookmark a tweet on from Twitter
            feed to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
