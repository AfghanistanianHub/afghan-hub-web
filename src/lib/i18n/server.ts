import { cookies, headers } from "next/headers";
import { localeCookie, parseLocale } from "./locale";
export async function getLocale() {
  return parseLocale((await headers()).get("x-afghan-hub-locale")) ?? parseLocale((await cookies()).get(localeCookie)?.value) ?? "en";
}
