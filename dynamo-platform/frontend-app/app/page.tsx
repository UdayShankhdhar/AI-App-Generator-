import Link from "next/link";
import { config } from "../lib/config";

export default function Home() {
  return (
    <div>
      <h1>{config.app.name}</h1>

      <ul>
        {config.pages.map((page) => (
          <li key={page.id}>
            <Link href={`/${page.id}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}