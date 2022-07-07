import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { getUser } from "~/services/session.server";
import { getBookmarksByUser } from "~/services/twitter.server";
import { useUser } from "~/utils";

type LoaderData = {
  bookmarks: Awaited<ReturnType<typeof getBookmarksByUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const bookmarks = await getBookmarksByUser(user!.id, user!.accessToken);
  return json<LoaderData>(bookmarks);
};

export default function BookmarksPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  console.log(JSON.stringify(data))

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Bookmarks</Link>
        </h1>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">hello</div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
