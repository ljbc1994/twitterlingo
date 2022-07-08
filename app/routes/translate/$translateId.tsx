import { useState } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
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

  console.log({ targetLangText, targetLangTextInput });
  if (targetLangTextInput === targetLangText) {
    await setCompleteTranslation(userId, translationId).then(function () {
      return redirect(`/dashboard`);
    });
  }
  return redirect(`/translate/${translationId}`);
};

export default function Translate() {
  const data = useLoaderData() as LoaderData;

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

      <div>
        <p>{sourceLangText}</p>
      </div>

      <div>
        {targetLangTextInputArray.map(function (word, idx) {
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
                ...(targetLangTextInputArray.includes(word) && {
                  backgroundColor: "grey",
                  color: "grey",
                  border: "2px solid grey",
                }),
              }}
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

      <div>
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
          value="Check"
          disabled={!isSubmissionEnabled}
          style={{
            margin: "24px",
            fontWeight: "bold",
            color: isSubmissionEnabled ? "green" : "red",
          }}
        />
      </div>
    </Form>
  );
}
