import React from 'react';

/**
 * Phase 2 migration banner — informs users to refresh their session after
 * the security-rules cutover so their new `workspaceId` custom claim takes
 * effect.
 *
 * Rendering is gated by a runtime flag so this component is INERT until
 * Phase 2 goes live:
 *   localStorage.setItem('phase2_migration_active', '1');
 *   // set 'phase2_migration_dismissed' = '1' to hide per-device after refresh.
 *
 * The banner is intentionally dependency-free (no i18n, no toast lib) so
 * it can be dropped into `App.tsx` without pulling new modules.
 */
export function Phase2MigrationBanner(): JSX.Element | null {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const active = localStorage.getItem('phase2_migration_active') === '1';
      const dismissed = localStorage.getItem('phase2_migration_dismissed') === '1';
      setVisible(active && !dismissed);
    } catch {
      /* storage unavailable → stay hidden */
    }
  }, []);

  if (!visible) return null;

  const handleRefresh = () => {
    try { localStorage.setItem('phase2_migration_dismissed', '1'); } catch { /* noop */ }
    // Force a full reload so the auth SDK re-fetches the ID token and the
    // new workspaceId claim propagates. Avoids a partial in-app refresh.
    window.location.reload();
  };

  const handleDismiss = () => {
    try { localStorage.setItem('phase2_migration_dismissed', '1'); } catch { /* noop */ }
    setVisible(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        background: '#fff7ed',
        borderBottom: '1px solid #fdba74',
        color: '#7c2d12',
        fontSize: 14,
        lineHeight: 1.4,
      }}
    >
      <span aria-hidden style={{ fontSize: 18 }}>⚠️</span>
      <span style={{ flex: 1 }}>
        Workspace security update in progress. Refresh your session so your
        access to sales, purchases, and reports is restored. This is expected
        and only needs to be done once.
      </span>
      <button
        type="button"
        onClick={handleRefresh}
        style={{
          padding: '6px 12px',
          background: '#ea580c',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Refresh now
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          padding: '6px 8px',
          background: 'transparent',
          color: '#7c2d12',
          border: '1px solid #fdba74',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Later
      </button>
    </div>
  );
}
