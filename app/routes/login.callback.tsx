// app/routes/login.callback.tsx
import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

// This will be called after twitter auth page
export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.authenticate("twitter", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login/failure",
  });
};
