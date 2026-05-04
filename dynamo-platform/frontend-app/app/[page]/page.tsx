"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DynamicTable from "@/components/DynamicTable";
import DynamicForm from "@/components/DynamicForm";
import Dashboard from "@/components/Dashboard";
import Notifications from "@/components/Notifications";
import config from "../../../shared/Example.config.json";
import CsvImport from "@/components/CsvImport";
import { useRouter } from "next/navigation";

export default function DynamicPage() {
  const params = useParams();
  const router = useRouter();

  const [pageConfig, setPageConfig] =
    useState<any>(null);

  useEffect(() => {
    if (!params?.page) return;

    const API =
      process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API}/api/config`)
      .then((res) => res.json())
      .then((config) => {
        const currentPage =
          config.pages.find(
            (p: any) =>
              p.id === params.page ||
              p.path === `/${params.page}`
          );

        setPageConfig(currentPage);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [params]);

  if (!pageConfig) {
    return <div>Page not found</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1>{pageConfig.title}</h1>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() =>
              router.push("/products/new")
            }
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Create
          </button>
        </div>
      </div>

      {pageConfig.components.map(
        (
          component: any,
          index: number
        ) => {
          switch (component.type) {
            case "table":
              return (
                <DynamicTable
                  key={index}
                  dataSource={
                    component.dataSource
                  }
                />
              );

            case "form":
              return (
                <DynamicForm
                  key={index}
                  dataSource={
                    component.dataSource
                  }
                />
              );

            case "dashboard":
              return (
                <Dashboard
                  key={index}
                  metrics={
                    component.metrics
                  }
                />
              );

            case "notifications":
              return (
                <Notifications
                  key={index}
                  notifications={
                    config.notifications
                  }
                />
              );

            case "csv-import":
              return (
                <CsvImport
                  key={index}
                  dataSource={
                    component.dataSource
                  }
                />
              );

            default:
              return (
                <div key={index}>
                  Unsupported component
                </div>
              );
          }
        }
      )}
    </div>
  );
}
