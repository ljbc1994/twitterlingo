import { useState, useMemo } from "react";
import { Form, Link, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
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
  jumbledTargetLangText: string[];
};

function shuffle(arr: any[]) {
  var j, x, index;
  for (index = arr.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = arr[index];
    arr[index] = arr[j];
    arr[j] = x;
  }
  return arr;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const translation = await getTranslation({
    userId: user!.id,
    id: params.translateId!,
  });
  return json<LoaderData>({
    translation: translation!,
    user,
    jumbledTargetLangText: shuffle(translation?.targetLangText.split(' ') ?? []),
  });
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
  const submit = useSubmit();

  const [highlightState, setHighlightState] = useState<boolean[]>([])

  const { translation, user } = data;

  const { id, userId, sourceLangCode, targetLangCode, targetLangText } =
    translation!;

  const targetLangTextSplitString = data.jumbledTargetLangText.map((word, idx) => ({ word, idx }))

  const [targetLangTextInputArray, setTargetLangTextInputArray] = useState<
    { word: string, idx: number }[]
  >([]);

  const targetLangTextInput = useMemo(() => {
    return targetLangTextInputArray.join(' ')
  }, [targetLangTextInputArray])

  const filteredTargetLangTextSplitString = useMemo(() => {
    return targetLangTextSplitString.filter(({ idx }) => !targetLangTextInputArray.some((x) => x.idx === idx))
  }, [targetLangTextSplitString, targetLangTextInputArray])

  function getLanguageNameFromLangCode(langCode: string) {
    const [language] = languages.filter(function (l) {
      return l.langCode === langCode;
    });
    return language.name;
  }

  function onCheckAnswer(evt: any) {
    if (targetLangTextInput === targetLangText) {
      submit(evt.currentTarget)
      return
    }
    highlightAnswer()
  }

  function highlightAnswer() {
    const target = translation!.targetLangText.split(' ')
    const highlight = targetLangTextInputArray.map((input, index) => {
      return input.word === target[index]
    })
    setHighlightState(highlight)
    setTimeout(() => {
      setHighlightState([])
    }, 1000);
  }

  function getHighlightClass(index: number) {
    switch (highlightState[index]) {
      case true:
        return "bg-green-800"
      case false:
        return "bg-red-800"
      default:
        return "";
    }
  }

  const sourceLangAlt = getLanguageNameFromLangCode(sourceLangCode);
  const targetLangAlt = getLanguageNameFromLangCode(targetLangCode);

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
          {targetLangTextInputArray.map(function ({ word, idx }, index) {
            return (
              <span
                key={index}
                className={`mr-2 mb-2 inline-block rounded-full rounded-md bg-blue-800  px-3 py-1 text-sm text-white hover:cursor-pointer hover:bg-blue-700 transition-colors ease-in-out duration-500 ${getHighlightClass(index)}`}
                onClick={() => {
                  setTargetLangTextInputArray((prevState) => {
                    return prevState.filter((val) => val.idx !== idx)
                  })
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div className="px-6 pt-4 pb-2">
          {filteredTargetLangTextSplitString.map(function (val, idx) {
            return (
              <span
                key={idx}
                className={`mr-2 mb-2 inline-block rounded-full rounded-md bg-gray-200  px-3 py-1 text-sm text-gray-700 hover:cursor-pointer hover:bg-blue-700 hover:text-white`}
                onClick={() => {
                  setTargetLangTextInputArray((prevState) => {
                    return prevState.concat([val])
                  })
                }}
              >
                {val.word}
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
            <button
              type="button"
              className="w-full rounded-full bg-blue-500 py-2 px-4 text-white hover:cursor-pointer hover:bg-blue-700"
              onClick={onCheckAnswer}
            >
              Check
            </button>
            <div className="flex justify-center mt-5">
              <Link
                className="mx-auto w-full px-4 text-white hover:underline text-center"
                to="/dashboard"
              >
                Return to dashboard
              </Link>
            </div>
          </div>
        </Form>
      </main>
    </div>
  );
}
