"use client";

import Link from "next/link";

export default function Sidebar({
  pages,
}: {
  pages: any[];
}) {

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">

      <h1 className="text-2xl font-bold mb-8">
        Dynamo CRM
      </h1>

      <div className="flex flex-col gap-3">

        {pages.map((page) => (

          <Link
            key={page.path}
            href={page.path}
            className="
              bg-gray-800
              hover:bg-blue-600
              transition
              p-4
              rounded-xl
              font-medium
            "
          >
            {page.title}
          </Link>

        ))}

      </div>

    </div>
  );
}