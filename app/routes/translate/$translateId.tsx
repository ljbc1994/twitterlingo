import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import type { BookmarkTranslation } from "~/services/translation.server";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";
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
  const transition = useTransition();
  const actionData = useActionData();
  
  return (
    <div>
      <div>
        <div>
          <button>Back</button>
          <div>
            <span>Source Lang</span>
            <span>Target Lang</span>
          </div>
          <button>Back</button>
        </div>
        <div>
          <button>Return to dashboard</button>
        </div>
      </div>

      <div>
        <p></p>
      </div>

      <div></div>

      <div></div>

      <div>
        <button>Check</button>
      </div>
    </div>
  );
}
