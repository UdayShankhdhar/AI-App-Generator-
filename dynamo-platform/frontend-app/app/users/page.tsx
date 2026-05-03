"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL";
    fetch(`${API}/api/config`)
      .then(res => res.json())
      .then(data => {
        console.log("Users:", data);
        setUsers(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>THE SIGNAL USERS</h1>
      {users.length === 0 ? (
        <p>SO MANY...</p>
      ) : (
        users.map((u: any) => (
          <div key={u.id}>
            {u.email} - {u.role}
          </div>
        ))
      )}
    </div>
  );
}
