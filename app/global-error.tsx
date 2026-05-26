"use client";

// Top-level fallback when the root layout itself throws. Cannot use
// PageShell here — must render its own <html> + <body>.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(247,97,3,0.22), transparent 60%), #0a0a0a",
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 32,
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#f76103",
              fontWeight: 700,
            }}
          >
            Critical error
          </div>
          <h1
            style={{
              marginTop: 16,
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            The whole lobby crashed.
          </h1>
          <p style={{ marginTop: 16, color: "#a3a3a3", fontSize: 18 }}>
            The platform itself threw an error. Try reloading. If it keeps
            happening, ping us in Discord.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                fontFamily: "ui-monospace, monospace",
                fontSize: 12,
                color: "#737373",
              }}
            >
              ref · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 10,
              border: "none",
              background: "#f76103",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
