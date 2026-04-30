"use client";

import { useEffect, useState } from "react";

export default function DynamicForm({
  dataSource,
}: {
  dataSource: string;
}) {

  const [fields, setFields] =
    useState<any[]>([]);

  const [formData, setFormData] =
    useState<any>({});

  useEffect(() => {

    async function loadFields() {

      const res = await fetch(
        "http://localhost:5000/api/config"
      );

      const config = await res.json();

      const table =
        config.database.tables.find(
          (t: any) =>
            t.name === dataSource
        );

      if (table) {
        setFields(table.fields);
      }
    }

    loadFields();

  }, [dataSource]);

  function handleChange(
    name: string,
    value: any
  ) {

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(
    e: any
  ) {

    e.preventDefault();

    try {

      const response = await fetch(
        `http://localhost:5000/api/${dataSource}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formData
          ),
        }
      );

      const result =
        await response.json();

      console.log(result);

      alert(
        "Created successfully"
      );

    } catch (err) {

      console.error(err);

      alert("Failed");

    }
  }

  if (!fields.length) {
    return <p>Loading form...</p>;
  }

  return (

    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 600,
        background: "white",
        padding: 24,
        borderRadius: 16,
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.08)",
        marginTop: 20,
      }}
    >

      {fields.map((field) => (

        <div
          key={field.name}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >

          {field.type === "boolean" ? (

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >

              <input
                type="checkbox"

                onChange={(e) =>
                  handleChange(
                    field.name,
                    e.target.checked
                  )
                }
              />

              {field.label}

            </label>

          ) : (

            <>

              <label>
                {field.label}
              </label>

              <input
                type={
                  field.type === "number"
                    ? "number"
                    : "text"
                }

                placeholder={
                  field.label
                }

                onChange={(e) =>
                  handleChange(
                    field.name,
                    e.target.value
                  )
                }

                style={{
                  padding: 12,
                  border:
                    "1px solid #ccc",
                  borderRadius: 8,
                }}
              />

            </>

          )}

        </div>

      ))}

      <button
        type="submit"
        style={{
          padding: 14,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Create
      </button>

    </form>
  );
}