"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [config, setConfig] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API}/api/config`)
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  async function handleLogin() {
    const API = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.token) {
      // SAVE TOKEN
      localStorage.setItem("token", data.token);

      // redirect
      router.push("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  }

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
      <h1>{config.auth.ui.title}</h1>

      <p>{config.auth.ui.subtitle}</p>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
