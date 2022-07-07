// app/routes/login.tsx
import type { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

// Normally this will redirect user to twitter auth page
export let action: ActionFunction = async ({ request }) => {
  await authenticator.authenticate("twitter", request, {
    successRedirect: "/bookmarks", // Destination in case the user is already logged in
  });
};

export default function LoginPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <Form method="post" action="/login">
        <button>Login</button>
      </Form>
    </div>
  );
}
