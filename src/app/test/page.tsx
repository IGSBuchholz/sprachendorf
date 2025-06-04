"use client";

import { useSession } from "next-auth/react";

export default function Page() {
  // Use the client-side hook to get session data
  const { data: session, status } = useSession();

  // While session is loading, you can show a loading state
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // If there's no session, show "Not logged in" in red
  if (!session) {
    return <p style={{ color: "red" }}>Not logged in</p>;
  }

  // If a session exists, display all session data as JSON
  return (
    <div>
      <h1>User Session Data</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}