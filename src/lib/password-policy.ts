export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_POLICY_HINT =
  "Use at least 12 characters and include at least 3 of: lowercase letters, uppercase letters, numbers, symbols.";

export function getPasswordPolicyError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  const groups = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (groups < 3) {
    return "Password must include at least 3 of: lowercase letters, uppercase letters, numbers, symbols.";
  }

  return null;
}
