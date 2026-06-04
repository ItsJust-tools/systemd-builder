'use client';

import type { SystemdUnit } from '../types';
import { generateUnitFile, getFilename } from '../types';

interface ToolSidebarProps {
  state: SystemdUnit;
}

export function ToolSidebar({ state }: ToolSidebarProps) {
  const generated = generateUnitFile(state);
  const lines = generated ? generated.split('\n').length : 0;
  const sectionsWithFields = state.sections.filter((s) => s.fields.length > 0).length;
  const totalFields = state.sections.reduce((acc, s) => acc + s.fields.length, 0);

  // Validation — warn about empty keys or values
  const validationWarnings: string[] = [];
  for (let i = 0; i < state.sections.length; i++) {
    const section = state.sections[i];
    for (let j = 0; j < section.fields.length; j++) {
      const field = section.fields[j];
      if (!field.key.trim() && !field.value.trim()) continue; // both empty = unused row
      if (!field.key.trim()) {
        validationWarnings.push(`[${section.name}] field #${j + 1}: missing key`);
      }
      if (!field.value.trim()) {
        validationWarnings.push(`[${section.name}] "${field.key}": missing value`);
      }
    }
  }

  // Per-section field counts
  const sectionCounts = state.sections.map((s) => ({
    name: s.name,
    count: s.fields.filter((f) => f.key.trim()).length,
  }));

  return (
    <div className="systemd-sidebar">
      <div className="sidebar-section">
        <h3>Unit File Info</h3>
        <dl className="stats-list">
          <div className="stat-row">
            <dt>Filename</dt>
            <dd>{getFilename(state)}</dd>
          </div>
          <div className="stat-row">
            <dt>Type</dt>
            <dd>{state.unitType}</dd>
          </div>
          <div className="stat-row">
            <dt>Lines</dt>
            <dd>{lines}</dd>
          </div>
          <div className="stat-row">
            <dt>Sections populated</dt>
            <dd>{sectionsWithFields} / {state.sections.length}</dd>
          </div>
          <div className="stat-row">
            <dt>Fields configured</dt>
            <dd>{totalFields}</dd>
          </div>
        </dl>
      </div>

      {sectionCounts.length > 0 && (
        <div className="sidebar-section">
          <h3>Sections</h3>
          <dl className="stats-list">
            {sectionCounts.map((s) => (
              <div key={s.name} className="stat-row">
                <dt>[{s.name}]</dt>
                <dd>{s.count} field{s.count !== 1 ? 's' : ''}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="sidebar-section systemd-validation">
          <h3>Warnings</h3>
          <ul className="validation-list">
            {validationWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="sidebar-section">
        <h3>Quick Tips</h3>
        <ul className="tips-list">
          <li>Type custom field names using the text inputs with autocomplete suggestions</li>
          <li>Press <kbd>Enter</kbd> on the last field value to add another field</li>
          <li>Changing Unit Type resets sections to defaults</li>
          <li>Use the <strong>Preview</strong> button to see the raw systemd unit file</li>
          <li>Export as image to share your configuration</li>
        </ul>
      </div>
    </div>
  );
}
