import { LocalizedForgotPasswordContent } from "./localized-forgot-password-content";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error, message } = await searchParams;
  return <LocalizedForgotPasswordContent error={error} message={message} />;
}
