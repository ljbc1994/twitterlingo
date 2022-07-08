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

type LoaderData = {
  translation: Awaited<ReturnType<typeof getTranslation>>;
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

  const { translation } = data;

  const {
    id,
    userId,
    sourceLangCode,
    sourceLangText,
    targetLangCode,
    targetLangText,
  } = translation!;

  const targetLangTextSplitString: string[] = targetLangText.split(" ");

  const [targetLangTextInputArray, setTargetLangTextInputArray] = useState<
    string[]
  >([]);

  const [targetLangTextInput, setTargetLangTextInput] = useState<string>("");

  const isSubmissionEnabled =
    targetLangTextInput.length === targetLangText.length;

  useEffect(() => {
    setTargetLangTextInputArray([]);
    setTargetLangTextInput("");
  }, [actionData]);

  return (
    <Form method="post">
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

      <div className="px-6 pt-4 pb-2">
        <div className="cursor-pointer rounded-md bg-blue-800 p-6 font-semibold hover:bg-blue-700">
          <p className="text-white">{sourceLangText}</p>
        </div>
      </div>

      <div className="px-6 pt-4 pb-2">
        {targetLangTextInputArray.map(function (word, idx) {
          return (
            <span
              key={idx}
              className="mr-2 mb-2 inline-block rounded-full bg-blue-700 px-3 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:bg-blue-500 hover:text-white"
              onClick={function () {
                setTargetLangTextInputArray(function (prevState) {
                  const newArray = [
                    ...prevState.filter(function (item) {
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
              className="mr-2 mb-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 hover:cursor-pointer hover:bg-blue-700 hover:text-white"
              onClick={() => {
                setTargetLangTextInputArray(function (prevState) {
                  if (prevState.includes(word)) {
                    return prevState;
                  }

                  const newArray = [...prevState, word];
                  setTargetLangTextInput(newArray.join(" "));
                  return newArray;
                });
                setTargetLangTextInput(targetLangTextInputArray.join(" "));
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {actionData && (
        <div className="px-6 pt-4 pb-2">
          <div
            className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
            role="alert"
          >
            <strong className="font-bold">That's not correct!</strong>
            <span className="block sm:inline">Please try again.</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <svg
                className="h-6 w-6 fill-current text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
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
          className="diabled:text-gray-700 w-full rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:cursor-pointer hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-700"
          value="Check"
          disabled={!isSubmissionEnabled}
        />
      </div>
    </Form>
  );
}
