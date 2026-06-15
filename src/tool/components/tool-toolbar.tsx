'use client';

import Link from 'next/link';
import toolConfig from '@/tool/tool.config';

const SECTION_HEADER: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary, #9ca3af)',
  marginBottom: '6px',
};

const KBD_STYLE: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 6px',
  fontSize: '11px',
  fontFamily: 'monospace',
  fontWeight: 500,
  background: 'var(--bg-secondary, #1f2937)',
  border: '1px solid var(--border-color, #374151)',
  borderRadius: '4px',
  color: 'var(--text-secondary, #9ca3af)',
  minWidth: '20px',
  textAlign: 'center',
};

/**
 * Toolbar for the systemd Unit Builder.
 *
 * Provides a Help link and a keyboard shortcuts reference dropdown.
 */
export function ToolToolbar() {
  return (
    <div className="systemd-toolbar">
      <Link href="/help" className="toolbar-btn toolbar-help-link" aria-label="Open help page">
        Help
      </Link>
      <div className="toolbar-btn toolbar-shortcuts-trigger">
        <span>Shortcuts</span>
        <div className="toolbar-shortcuts-dropdown" role="menu" aria-label="Keyboard shortcuts">
          <div style={SECTION_HEADER}>{toolConfig.name}</div>
          {toolConfig.shortcuts.map((group) =>
            group.shortcuts.map((sc, i) => (
              <div key={`${group.title}-${i}`} className="shortcut-row" role="menuitem">
                <span className="shortcut-label">{sc.label}</span>
                <span className="shortcut-keys">
                  {sc.keys.split('+').map((key, ki) => (
                    <span key={ki}>
                      {ki > 0 && <span style={{ margin: '0 2px' }}>+</span>}
                      <kbd style={KBD_STYLE}>{key}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

ToolToolbar.displayName = 'ToolToolbar';
