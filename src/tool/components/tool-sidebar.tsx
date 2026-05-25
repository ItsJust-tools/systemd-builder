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

      <div className="sidebar-section">
        <h3>Quick Tips</h3>
        <ul className="tips-list">
          <li>Add fields using the form controls in each section</li>
          <li>Use the Preview button to see the raw systemd unit file</li>
          <li>Changing Unit Type resets sections to defaults</li>
          <li>Export as image to share your configuration</li>
        </ul>
      </div>
    </div>
  );
}
