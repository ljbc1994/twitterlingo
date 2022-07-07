import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import { getUser } from "~/services/session.server";
import {
  createTranslationForUser,
  getTranslationsByUser,
} from "~/services/translation.server";

type LoaderData = {
  bookmarks: Awaited<ReturnType<typeof getTranslationsByUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const bookmarks = await getTranslationsByUser(user!.id, user!.accessToken);

  return json<LoaderData>({ bookmarks });
};

export let action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  const form = await request.formData();
  const id = form.get("id") as string;
  const bookmarkId = form.get("bookmarkId") as string;
  const text = form.get("text") as string;
  const sourceLangCode = form.get("sourceLangCode") as string;

  if (id == null || id == '') {
    const result = await createTranslationForUser(user!.id, {
      bookmarkId,
      sourceLangCode: sourceLangCode,
      targetLangCode: user?.sourceLangPreference || "en",
      sourceLangText: text,
    });
    throw new Error(JSON.stringify(result))
  }

  return redirect(`/bookmarks`);
};

export default function BookmarksPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Bookmarks</Link>
        </h1>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          {data.bookmarks.map((bookmark) => {
            return (
              <Form key={bookmark.id} method="post">
                <input type="text" name="id" value={bookmark.id} />
                <input
                  type="text"
                  name="bookmarkId"
                  value={bookmark.bookmarkId}
                />
                <input
                  type="text"
                  name="sourceLangCode"
                  value={bookmark.sourceLangCode}
                />
                <input
                  type="text"
                  name="text"
                  value={bookmark.sourceLangText}
                />
                {bookmark.bookmarkId}
                {bookmark.sourceLangText}
                {bookmark.targetLangCode}
                {bookmark.targetLangText}
                <input type="submit" value="Submit" />
              </Form>
            );
          })}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
