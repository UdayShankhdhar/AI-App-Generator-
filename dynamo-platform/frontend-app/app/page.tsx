import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        padding: 40,
      }}
    >
      <h1>Dynamo CRM</h1>

      <Link href="/dashboard">
        Dashboard
      </Link>
    </div>
  );
}
