// Guarded PWA service-worker registration wrapper.
// Registers only in production, top-level window, and non-Lovable-preview hosts.
// Supports ?sw=off kill switch. See PWA skill for rules.

const SW_URL = "/sw.js";

function isPreviewHost(hostname: string): boolean {
  if (
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) {
    return true;
  }
  return false;
}

async function unregisterMatching(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs.map(async (reg) => {
        const scriptURL = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";
        if (scriptURL.endsWith(SW_URL)) {
          await reg.unregister();
        }
      }),
    );
  } catch {
    // ignore
  }
}

export function registerPWA(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const swOff = url.searchParams.get("sw") === "off";
  const inIframe = window.self !== window.top;
  const hostname = window.location.hostname;
  const isPreview = isPreviewHost(hostname);
  const isProd = import.meta.env.PROD;

  if (!isProd || inIframe || isPreview || swOff) {
    void unregisterMatching();
    return;
  }

  window.addEventListener("load", () => {
    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        registerSW({ immediate: true });
      })
      .catch(() => {
        // pwa virtual module unavailable — no-op
      });
  });
}
