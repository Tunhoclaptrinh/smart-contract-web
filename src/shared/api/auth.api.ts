import type { AuthResult, Role } from "@codecash/contracts";
import { ApiError as HttpError } from "@codecash/api-client";
import { ACCESS_TOKEN_KEY, platform } from "./platform";

const RESTORE_RETRIES = 4;
import type { User } from "./types";

/** Keeps the access token only; the refresh token stays in its httpOnly cookie. */
function storeSession(result: AuthResult): User {
  localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken ?? result.token);
  return result.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  return storeSession(await platform.login(email, password));
}

export interface DemoAccount {
  email: string;
  displayName: string;
  role: Role;
  organization: string;
  organizationId: string;
  partyId: string | null;
  /** Contract codes the account's organisation is a party to. */
  contracts: string[];
}

export interface DemoDirectory {
  enabled: boolean;
  /** Accounts of the demo buyer and supplier, plus the two controllers. */
  featured: DemoAccount[];
  /** Every other seeded account, by Data Pack organisation. */
  organizations: { id: string; name: string; accounts: DemoAccount[] }[];
}

/** Sample accounts offered on the sign-in page; empty when the API has demo sign-in off. */
export async function listDemoAccounts(): Promise<DemoDirectory> {
  const result = await platform.get<{
    enabled: boolean;
    accounts: DemoAccount[];
    organizations: DemoDirectory["organizations"];
  }>("/auth/demo-accounts");
  return {
    enabled: result.enabled,
    featured: result.enabled ? result.accounts : [],
    organizations: result.enabled ? (result.organizations ?? []) : [],
  };
}

/** Archives the current demo data, audit log included, and restarts from the initial data. */
export async function resetDemoData(): Promise<{ archive: string }> {
  return platform.post<{ archive: string }>("/auth/reset-demo", {});
}

export async function signInDemo(email: string): Promise<User> {
  return storeSession(
    await platform.post<AuthResult>("/auth/demo-login", { email }),
  );
}

/**
 * Restores the stored session. Only the API saying the token is no longer valid (401) ends it; a
 * gateway error or a dropped connection while the server restarts is retried, so a busy or restarting
 * server does not sign the user out.
 */
export async function getUser(_userId: string): Promise<User | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await platform.get<User>("/auth/me");
    } catch (error) {
      const signedOut = error instanceof HttpError && error.status === 401;
      if (signedOut || attempt >= RESTORE_RETRIES) return null;
      await new Promise((done) => setTimeout(done, 1000 * 2 ** attempt));
    }
  }
}

/** What a company enters to sign up: the company and its account administrator. */
export interface SignUpInput {
  organization: {
    name: string;
    code: string;
    kind: "BUYER" | "SUPPLIER";
    email?: string;
    taxCode?: string;
  };
  admin: { displayName: string; email: string; password: string };
}

/** Creates the company and its administrator account, then signs in as that administrator. */
export async function signUp(input: SignUpInput): Promise<User> {
  return storeSession(await platform.post<AuthResult>("/auth/register", input));
}

/** Starts a password reset; the answer never says whether the email has an account. */
export async function requestPasswordReset(email: string): Promise<void> {
  await platform.post("/auth/forgot-password", { email: email.trim() });
}

/** Sets a new password with the code from the reset message; every other session ends. */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ email: string }> {
  return platform.post<{ reset: true; email: string }>("/auth/reset-password", {
    token,
    newPassword,
  });
}

/** The signed-in user changes its own password; the answer is a fresh session for this tab. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<User> {
  return storeSession(
    await platform.post<AuthResult>("/auth/password", {
      currentPassword,
      newPassword,
    }),
  );
}

export interface InvitationPreview {
  email: string;
  displayName: string;
  role: Role;
  organization: string;
  expiresAt: string;
}

export async function getInvitation(token: string): Promise<InvitationPreview> {
  return platform.get<InvitationPreview>(
    `/auth/invitations/${encodeURIComponent(token)}`,
  );
}

/** Activates an invited account with the chosen password and signs in. */
export async function acceptInvitation(
  token: string,
  password: string,
  displayName?: string,
): Promise<User> {
  return storeSession(
    await platform.post<AuthResult>("/auth/invitations/accept", {
      token,
      password,
      ...(displayName?.trim() ? { displayName: displayName.trim() } : {}),
    }),
  );
}

export interface InviteInput {
  email: string;
  displayName: string;
  role: Role;
  title?: string;
  /** System administrator only. */
  organizationId?: string;
}

export async function inviteMember(
  input: InviteInput,
): Promise<{ userId: string; email: string; expiresAt: string }> {
  return platform.post("/auth/invitations", input);
}

export interface OutboxMessage {
  to: string;
  subject: string;
  link: string;
  kind: "PASSWORD_RESET" | "INVITATION";
  createdAt: string;
}

/** Demo deployments: what would have been emailed, so a reset or an invitation can be followed. */
export async function listOutbox(): Promise<OutboxMessage[]> {
  return platform.get<OutboxMessage[]>("/auth/outbox");
}
