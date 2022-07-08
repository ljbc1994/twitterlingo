import { useState, useEffect } from "react";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import {
  getTranslation,
  setCompleteTranslation,
} from "~/models/translation.server";
import { getUser } from "~/services/session.server";
import TranslationItem from "~/components/dashboard/TranslationItem";
import { SessionUser } from "~/models/user.server";
import { languages } from "~/constants/languages";

type LoaderData = {
  translation: Awaited<ReturnType<typeof getTranslation>>;
  user: SessionUser | null;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const translation = await getTranslation({
    userId: user!.id,
    id: params.translateId!,
  });
  return json<LoaderData>({ translation: translation!, user });
};

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const userId = form.get("userId") as string;
  const translationId = form.get("translationId") as string;
  const targetLangText = form.get("targetLangText") as string;
  const targetLangTextInput = form.get("targetLangTextInput") as string;

  if (targetLangTextInput === targetLangText) {
    return await setCompleteTranslation(userId, translationId).then(
      function () {
        return redirect(`/dashboard`);
      }
    );
  }

  return json(true);
};

export default function Translate() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData();

  const { translation, user } = data;

  const { id, userId, sourceLangCode, targetLangCode, targetLangText } =
    translation!;

  const targetLangTextSplitString: string[] = targetLangText.split(" ");

  const [targetLangTextInputArray, setTargetLangTextInputArray] = useState<
    string[]
  >([]);

  const [targetLangTextInput, setTargetLangTextInput] = useState<string>("");

  function getLanguageNameFromLangCode(langCode: string) {
    const [language] = languages.filter(function (l) {
      return l.langCode === langCode;
    });
    return language.name;
  }

  const sourceLangAlt = getLanguageNameFromLangCode(sourceLangCode);
  const targetLangAlt = getLanguageNameFromLangCode(targetLangCode);

  useEffect(() => {
    setTargetLangTextInputArray([]);
    setTargetLangTextInput("");
  }, [actionData]);

  return (
    <div className="relative min-h-screen bg-blue-900">
      <nav className="container mx-auto flex">
        <div className="flex w-full bg-blue-900 p-4">
          <div className="align-center flex w-full justify-between">
            <div>
              <img
                className="rounded-full"
                src={user?.profile?.photos?.[0].value ?? ""}
                alt="twitter profile"
              />
            </div>
            <div className="flex">
              <div className="mr-3 self-center">
                <img
                  className="rounded-md"
                  src={`/_static/icons/${sourceLangCode}.svg`}
                  alt={sourceLangAlt}
                />
              </div>
              <div className="mr-3 self-center">
                <img
                  className="rounded-md"
                  src={`/_static/icons/${targetLangCode}.svg`}
                  alt={targetLangAlt}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <div className="px-6 pt-4 pb-2">
          <div className="grid gap-3">
            <TranslationItem
              key={id}
              translation={translation!}
              targetLang={targetLangCode}
            />
          </div>
        </div>

        <div className="px-6 pt-4 pb-2">
          {targetLangTextInputArray.map(function (word, idx) {
            return (
              <span
                key={idx}
                className="mr-2 mb-2 inline-block rounded-full rounded-md bg-blue-800  px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-blue-700"
                onClick={function () {
                  setTargetLangTextInputArray(function (prevState) {
                    const newArray = [
                      ...prevState.filter(function (item, _idx) {
                        // return prevState[idx] !== prevState[_idx];
                        return item !== word;
                      }),
                    ];
                    setTargetLangTextInput(newArray.join(" "));
                    return newArray;
                  });
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div className="px-6 pt-4 pb-2">
          {targetLangTextSplitString.map(function (word, idx) {
            return (
              <span
                key={idx}
                className={`${
                  targetLangTextInputArray.includes(word, idx)
                    ? "hidden"
                    : "inline-block"
                } mr-2 mb-2 inline-block rounded-full rounded-md bg-gray-200  px-3 py-1 text-sm text-gray-700 hover:cursor-pointer hover:bg-blue-700 hover:text-white`}
                onClick={() => {
                  setTargetLangTextInputArray(function (prevState) {
                    if (prevState.includes(word, idx)) {
                      return prevState;
                    }

                    const newArray = [...prevState, word];
                    setTargetLangTextInput(newArray.join(" "));
                    return newArray;
                  });
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <Form method="post">
          {actionData && (
            <div className="px-6 pt-4 pb-2">
              <div className="cursor-pointer rounded-md bg-red-800 px-4 py-3 hover:bg-blue-700">
                <div className="flex">
                  <div>
                    <p className="text-white">
                      That's not correct. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pt-4 pb-2">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="translationId" value={id} />
            <input type="hidden" name="targetLangText" value={targetLangText} />
            <input
              type="hidden"
              name="targetLangTextInput"
              value={targetLangTextInput}
            />
            <input
              type="submit"
              className="w-full rounded-full bg-blue-500 py-2 px-4 text-white hover:cursor-pointer hover:bg-blue-700"
              value="Check"
            />
            <Link
              className="mx-auto w-full px-4 text-white hover:underline"
              to="/dashboard"
            >
              Return to dashboard
            </Link>
          </div>
        </Form>
      </main>
    </div>
  );
}
