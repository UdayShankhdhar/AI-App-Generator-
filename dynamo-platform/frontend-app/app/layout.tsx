"use client";

import "./globals.css";

import Link from "next/link";
import { useEffect, useState } from "react";

import ThemeLoader from "@/components/ThemeLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [config, setConfig] =
    useState<any>(null);

  useEffect(() => {

    fetch("http://localhost:5000/api/config")
      .then((res) => res.json())
      .then(setConfig);

  }, []);

  return (
    <html lang="en">
      <body>

        <ThemeLoader
          theme={config?.app?.theme}
        />

        <div
          style={{
            display: "flex",
            minHeight: "100vh",
          }}
        >

          {/* SIDEBAR */}

          <aside
            style={{
              width: 250,
              background: "#111827",
              color: "white",
              padding: 20,
            }}
          >

            <h2>
              {config?.app?.name || "Dynamo CRM"}
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 30,
              }}
            >

              {config?.pages?.map(
                (page: any) => (

                  <Link
                    key={page.id}
                    href={page.path}
                    style={{
                      color: "white",
                      textDecoration: "none",
                      padding: 10,
                      borderRadius: 8,
                      background: "#1f2937",
                    }}
                  >
                    {page.title}
                  </Link>
                )
              )}

            </div>

          </aside>

          {/* MAIN CONTENT */}

          <main
            style={{
              flex: 1,
              padding: 30,
            }}
          >

            {children}

          </main>

        </div>

      </body>
    </html>
  );
}