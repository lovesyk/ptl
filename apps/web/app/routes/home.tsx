import type { Route } from "./+types/home";
import { Translator } from "../translator";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "pTL" },
    { name: "description", content: "Welcome to pTL!" },
  ];
}

export default function Home() {
  return <Translator />;
}
