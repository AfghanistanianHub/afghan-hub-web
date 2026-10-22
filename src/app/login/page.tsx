import { LocalizedLoginContent } from "./localized-login-content";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string; mode?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message, mode, next } = await searchParams;
  return <LocalizedLoginContent error={error} message={message} mode={mode} next={next} />;
}
