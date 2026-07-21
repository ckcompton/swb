// hellosign-embedded ships no type declarations. Minimal ambient typing for
// the small surface this app actually uses.
declare module "hellosign-embedded" {
  export interface HelloSignOpenOptions {
    clientId: string;
    skipDomainVerification?: boolean;
  }

  export type HelloSignEvent = "sign" | "close" | "cancel" | "error" | "message" | "createTemplate";

  export default class HelloSign {
    constructor(options?: { clientId?: string });
    open(url: string, options?: HelloSignOpenOptions): void;
    close(): void;
    on(event: HelloSignEvent, callback: (data?: unknown) => void): void;
  }
}
