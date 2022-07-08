<<<<<<< HEAD
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { BookmarkTranslation } from "~/services/translation.server";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { getTranslation } from "~/models/translation.server";

import { getUser } from "~/services/session.server";

type LoaderData = {
  translation: BookmarkTranslation;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const translation = await getTranslation({
    userId: user!.id,
    id: params.translateId!,
  });
  return json<LoaderData>({ translation: translation! });
};

export let action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  return redirect(`/dashboard`);
};

export default function Translate() {
  const data = useLoaderData() as LoaderData;
  const transition = useTransition();
  const actionData = useActionData();
  
=======
import { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/server-runtime";
import { getTranslation } from "~/models/translation.server";
import { getUser } from "~/services/session.server";

// type LoaderData = {
//   translation: Awaited<ReturnType<typeof getTranslation>>;
// };

// export const loader: LoaderFunction = async ({ request }) => {
//   const user = await getUser(request);
//   const translation = await getTranslation(user!.id, user!.accessToken);

//   return json<LoaderData>({ translation });
// };

export default function Translate() {
  // const data = useLoaderData() as LoaderData;
  const data = {
    translation: {
      bookmarkId: "1544768821873020930",
      completed: false,
      id: null,
      sourceLangCode: "en",
      sourceLangText:
        "Votre muscle le plus fort et votre pire ennemi est votre esprit. Entraînez-le bien.",
      targetLangCode: "fr",
      targetLangText:
        "Your strongest muscle and worst enemy is your mind. Train it well.",
      userId: "id#1540354283811610626",
    },
  };

  const { translation } = data;
  const { sourceLangCode, sourceLangText, targetLangCode, targetLangText } =
    translation;

  const targetLangTextSplitString: string[] = targetLangText.split(" ");

  const [target, setTarget] = useState<string[]>([]);

>>>>>>> 26e0763... Update translateId page with word activity logic
  return (
    <Form>
      <div>
        <div>
          {/* <Link to={`/translate:${}`}>Prev</Link> */}
          <div>
            <span>{sourceLangCode}</span>
            <span>&gt;</span>
            <span>{targetLangCode}</span>
          </div>
          {/* <Link to={`/translate:${}`}>Next</Link> */}
        </div>
        <div>
          <Link to="/dashboard">Return to dashboard</Link>
        </div>
      </div>

      <div>
<<<<<<< HEAD
        <p>{data.translation?.sourceLangText}</p>
        <p>{data.translation?.targetLangText}</p>
=======
        <p>{sourceLangText}</p>
>>>>>>> 26e0763... Update translateId page with word activity logic
      </div>

      <div>
        {target.map(function (word, idx) {
          return (
            <span
              key={idx}
              style={{
                margin: "8px",
                padding: "12px",
                backgroundColor: "blue",
                color: "white",
                border: "2px solid blue",
                borderRadius: "4px",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      <div>
        {targetLangTextSplitString.map(function (word, idx) {
          return (
            <span
              key={idx}
              style={{
                margin: "8px",
                padding: "12px",
                border: "2px solid blue",
                borderRadius: "4px",
                ...(target.includes(word) && {
                  backgroundColor: "grey",
                  color: "grey",
                  border: "2px solid grey",
                }),
              }}
              onClick={() =>
                setTarget(function (prevState) {
                  if (prevState.includes(word)) {
                    return prevState;
                  }
                  return [...prevState, word];
                })
              }
            >
              {word}
            </span>
          );
        })}
      </div>

      <div>
        <input type="submit" value="Check" />
      </div>
    </Form>
  );
}
