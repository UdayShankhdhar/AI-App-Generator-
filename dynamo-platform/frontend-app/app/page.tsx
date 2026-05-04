import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f4f4",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "350px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
          }}
        >
          Dynamo Platform
        </h1>

        <p
          style={{
            color: "gray",
            marginBottom: "30px",
          }}
        >
          Config Driven CRM Platform
        </p>

        <Link href="/login">
          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              marginBottom: "15px",
            }}
          >
            Login
          </button>
        </Link>

        <Link href="/signup">
          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#e5e5e5",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Create Account
          </button>
        </Link>
      </div>
    </div>
  );
}
