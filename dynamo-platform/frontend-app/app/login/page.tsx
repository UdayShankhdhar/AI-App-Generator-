"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {

  const [config, setConfig] =
    useState<any>(null);

  useEffect(() => {

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${API}/api/config`)
      .then((res) => res.json())
      .then(setConfig);

  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
      }}
    >

      <h1>
        {config.auth.ui.title}
      </h1>

      <p>
        {config.auth.ui.subtitle}
      </p>

      <input
        placeholder="Email"
      />

      <br />
      <br />

      <input
        placeholder="Password"
        type="password"
      />

      <br />
      <br />

      <button>
        Login
      </button>

    </div>
  );
}
