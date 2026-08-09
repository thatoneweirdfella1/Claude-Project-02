export interface DesktopUser {
  id: string;
  email: string;
  displayName: string;
  role: "operator" | "user";
  createdAt: number;
  creditBalance?: number;
  plan?: string;
  billingDate?: number;
  pendingPayments?: Array<{
    id: string;
    kind: "subscription" | "top-up";
    paidAmount: number;
    creditAmount: number;
    tier?: string;
    status: "pending";
  }>;
}

export interface DesktopPersistedState {
  session?: Record<string, unknown>;
  account?: Record<string, unknown>;
}

export interface DivergenceDesktopBridge {
  platform: string;
  state: {
    load(): Promise<DesktopPersistedState | null>;
    save(state: DesktopPersistedState): Promise<void>;
  };
  auth: {
    current(): Promise<DesktopUser | null>;
    signUp(input: { email: string; password: string; displayName: string }): Promise<DesktopUser>;
    logIn(input: { email: string; password: string }): Promise<DesktopUser>;
    logOut(): Promise<void>;
    listUsers(): Promise<DesktopUser[]>;
  };
  admin: {
    listUsers(): Promise<DesktopUser[]>;
    adjustCredits(userId: string, amount: number, note?: string): Promise<DesktopUser>;
    resolvePayment(userId: string, requestId: string, approved: boolean): Promise<DesktopUser>;
  };
  provider: {
    apiKeyStatus(): Promise<{ configured: boolean; source: "secure-storage" | "environment" | "none" }>;
    saveApiKey(apiKey: string): Promise<void>;
    clearApiKey(): Promise<void>;
  };
  ai: {
    complete(request: {
      model: string;
      system?: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      maxTokens?: number;
    }): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } }>;
  };
  app: {
    version(): Promise<string>;
    openDataFolder(): Promise<void>;
    minimize(): Promise<void>;
    toggleMaximize(): Promise<void>;
    close(): Promise<void>;
  };
}

declare global {
  interface Window {
    divergenceDesktop?: DivergenceDesktopBridge;
  }
}

export function desktopBridge(): DivergenceDesktopBridge | null {
  return window.divergenceDesktop ?? null;
}

export function isDesktopApp(): boolean {
  return desktopBridge() !== null;
}
