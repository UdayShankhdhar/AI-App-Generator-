import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
        marginTop: 100,
      }}
    >
      <h1>Dynamo Platform</h1>

      <Link href="/login">
        <button>Login</button>
      </Link>

      <Link href="/signup">
        <button>Signup</button>
      </Link>
    </div>
  );
}
