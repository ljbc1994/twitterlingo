import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getTranslationForLanguage } from "~/services/translator.server";

type LoaderData = {
  translation: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const translation = await getTranslationForLanguage({
    sourceLangCode: "el",
    targetLangCode: "en",
    text: "Προσοχή Νέμεσις ,από τα τουρκικά στα αγγλικά",
  });
  return json<LoaderData>({ translation: translation ?? "" });
};
