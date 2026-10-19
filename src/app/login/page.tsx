import { LocalizedLoginContent } from "./localized-login-content";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; mode?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, mode } = await searchParams;
  return <LocalizedLoginContent error={error} message={message} mode={mode} />;
}
