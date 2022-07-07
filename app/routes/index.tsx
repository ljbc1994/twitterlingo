import { Form } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-blue-900 sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/** Main */}
          <div className="relative sm:overflow-hidden">
            <div className="relative px-5 py-8 flex flex-col align-center">
              <div className="text-center mb-6">
                <h1 className="font-bold text-white text-3xl md:text-5xl">
                  Bookmark, Translate, Learn
                </h1>
              </div>
              <div className="mb-8 md:max-w-2xl max-w-md" style={{ alignSelf: 'center' }}>
                <p className="text-blue-200 text-center md:text-xl">
                  We accelerate your language learning by <strong>translating your bookmarked 
                  tweets</strong> and seeing if you can translate the tweets!
                </p>
              </div>
              <div className="mx-auto max-w-sm sm:flex sm:max-w-none justify-center">
                {user ? (
                  <div>logged in</div>
                ) : (
                  <Form method="post" action="/login">
                    <button className="uppercase flex items-center justify-center rounded-md border border-none bg-green-600 px-4 py-3 text-sm md:text-lg font-bold text-white shadow-sm hover:bg-green-700 sm:px-8">
                      Login with Twitter
                    </button>
                  </Form>
                )}
              </div>
            </div>
          </div>
          {/** End Main */}
        </div>
      </div>
    </main>
  );
}
