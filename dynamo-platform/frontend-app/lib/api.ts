const BASE_URL = "http://localhost:3000/api";

export async function fetchData(resource: string) {
  const res = await fetch(`${BASE_URL}/${resource}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}