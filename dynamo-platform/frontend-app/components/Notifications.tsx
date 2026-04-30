"use client";

export default function Notifications({
  notifications,
}: {
  notifications: any[];
}) {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >

      {notifications.map((n, index) => (

        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 10,
          }}
        >

          <h3>{n.template.subject}</h3>

          <p>{n.template.body}</p>

          <small>
            Trigger:
            {" "}
            {n.trigger}
          </small>

        </div>
      ))}

    </div>
  );
}