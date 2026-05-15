export type TemplateCategory =
  | "all"
  | "birthday"
  | "anniversary"
  | "festivals"
  | "love";

export interface QuoteLine {
  text: string;
  highlight?: string;
  highlightColor?: string;
}

export interface GreetingTemplate {
  id: string;
  title: string;
  category: Exclude<TemplateCategory, "all">;
  backgroundUrl: string;
  isPremium: boolean;
  quote: QuoteLine[];
  signature?: string;
}

export interface UserProfile {
  displayName: string;
  photoUrl: string;
  isPremium: boolean;
}

export type AuthMethod = "guest" | "google" | "email" | null;

export interface AuthUser {
  uid: string;
  email?: string | null;
  method: AuthMethod;
}
