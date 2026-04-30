"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import DynamicForm from "@/components/DynamicForm";

export default function NewPage() {

  const params = useParams();

  const [fields, setFields] =
    useState<any[]>([]);

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/config"
    )
      .then((res) => res.json())
      .then((config) => {

        const table =
          config.database.tables.find(
            (t: any) =>
              t.name === params.page
          );

        if (table) {
          setFields(table.fields);
        }
      });

  }, [params.page]);

  return (

    <div
      style={{
        padding: 40,
      }}
    >

      <h1>
        Create New {params.page}
      </h1>

      <DynamicForm
        dataSource={String(params.page)}
      />

    </div>
  );
}