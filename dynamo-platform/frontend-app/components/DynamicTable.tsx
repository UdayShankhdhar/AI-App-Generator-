"use client";

import { useEffect, useState } from "react";

export default function DynamicTable({
  dataSource,
}: {
  dataSource: string;
}) {

  const [data, setData] =
    useState<any[]>([]);

  async function loadData() {

    try {

      const res = await fetch(
        `http://localhost:5000/api/${dataSource}`
      );

      const json = await res.json();

      if (Array.isArray(json)) {
        setData(
          json.filter(Boolean)
        );
      } else {
        setData([]);
      }

    } catch (err) {

      console.error(err);

      setData([]);

    }

  }

  useEffect(() => {
    loadData();
  }, []);
async function editRow(
  row: any
) {

  const updatedData: any = {};

  for (const key of columns) {

    if (
      key === "id" ||
      key === "created_at" ||
      key === "updated_at"
    ) {
      continue;
    }

    const value = prompt(
      `Edit ${key}`,
      row[key]
    );

    updatedData[key] = value;
  }

  try {

    await fetch(
      `http://localhost:5000/api/${dataSource}/${row.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          updatedData
        ),
      }
    );

    loadData();

  } catch (err) {

    console.error(err);

  }

}
  async function deleteRow(
    id: string
  ) {

    try {

      await fetch(
        `http://localhost:5000/api/${dataSource}/${id}`,
        {
          method: "DELETE",
        }
      );

      loadData();

    } catch (err) {

      console.error(err);

    }

  }

  // No data
  if (!data || data.length === 0) {

    return (

      <div
        className="
          bg-white
          p-10
          rounded-2xl
          shadow-md
          text-center
        "
      >

        <h2 className="text-2xl font-bold">
          No Data Found
        </h2>

        <p className="text-gray-500 mt-2">
          Create your first record
        </p>

      </div>

    );

  }

  // Find first valid row
  const validRow =
    data.find(Boolean);

  if (!validRow) {

    return (
      <p>No valid data</p>
    );

  }

  const columns =
    Object.keys(validRow);

  return (

    <div
      className="
        bg-white
        rounded-2xl
        shadow-md
        overflow-auto
      "
    >

      <table className="w-full">

        <thead
          className="
            bg-gray-900
            text-white
          "
        >

          <tr>

            {columns.map((col) => (

              <th
                key={col}
                className="
                  text-left
                  p-4
                "
              >
                {col}
              </th>

            ))}

            <th className="p-4">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {data
            .filter(Boolean)
            .map((row) => (

            <tr
              key={row.id}
              className="
                border-b
                hover:bg-gray-50
              "
            >

              {columns.map((col) => (

                <td
                  key={col}
                  className="p-4"
                >
                  {String(
                    row[col]
                  )}
                </td>

              ))}

              <td
                className="
                  p-4
                  flex
                  gap-2
                "
              >

                <button
                      onClick={() =>
                        editRow(row)
                      }
                      className="
                        bg-blue-500
                        text-white
                        px-3
                        py-1
                        rounded-lg
                      "
                    >
                      Edit
                    </button>

                <button
                  onClick={() =>
                    deleteRow(
                      row.id
                    )
                  }
                  className="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded-lg
                  "
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}