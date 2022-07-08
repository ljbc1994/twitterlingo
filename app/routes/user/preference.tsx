import { ActionFunction, json } from "@remix-run/node";
import { setSourceLangPreference } from "~/models/user.server";
import { getUser } from "~/services/session.server";

export let action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  const requestBody = await request.json();

  const sourceLangPreference = requestBody.sourceLangPreference

  if (sourceLangPreference) {
    const hasSet = await setSourceLangPreference(user!.id.replace('id#', ''), sourceLangPreference)

    if (hasSet) {
      return json(`Preference ${sourceLangPreference} set for ${user!.id.replace('id#', '')}`, { status: 200 })
    }
  }

  return json('Preference not set', { status: 500 })
};
