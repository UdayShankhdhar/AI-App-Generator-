"use client";

import Papa from "papaparse";

export default function CsvImport({
  dataSource,
}: {
  dataSource: string;
}) {

  async function handleFile(
    e: any
  ) {

    const file = e.target.files[0];

    Papa.parse(file, {

      header: true,

      complete: async (results) => {

        for (const row of results.data as any[]) {

          await fetch(
            `http://localhost:5000/api/${dataSource}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(row),
            }
          );
        }

        alert("CSV Imported!");
      },
    });
  }

  return (
    <div>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />

    </div>
  );
}