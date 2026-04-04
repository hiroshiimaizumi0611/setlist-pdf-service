export type AuthenticatedUserIdentity = {
  displayName: string;
  email: string;
};

export function resolveAuthenticatedUserIdentity(user: {
  email?: string | null;
  name?: string | null;
}): AuthenticatedUserIdentity {
  const email = user.email?.trim();

  if (!email) {
    throw new Error("Authenticated user email is required.");
  }

  const trimmedName = user.name?.trim();

  if (trimmedName) {
    return {
      displayName: trimmedName,
      email,
    };
  }

  const [localPart] = email.split("@");

  return {
    displayName: localPart || email,
    email,
  };
}
