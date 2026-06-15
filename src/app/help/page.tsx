import type { Metadata } from 'next';
import Link from 'next/link';
import toolConfig from '@/tool/tool.config';

export const metadata: Metadata = {
  title: `Help — ${toolConfig.name}`,
  description: `How to use the ${toolConfig.name}. Build, edit, and export systemd unit files (services, timers, sockets, mount points, and more).`,
};

export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-card">
        <Link href="/" className="help-back-link" aria-label="Back to tool">
          ← Back to {toolConfig.name}
        </Link>
        <h1 className="help-title">How to Use the systemd Unit Builder</h1>

        <section className="help-section">
          <h2>Quick Start</h2>
          <ol className="help-steps">
            <li>
              <strong>Choose a unit type</strong> — Select from Service, Timer, Socket, Mount,
              Automount, Path, or Target using the dropdown at the top of the editor.
            </li>
            <li>
              <strong>Start from a preset</strong> — Use the Quick Start buttons (Web Application,
              Timer Service, Path Watcher, etc.) to load a pre-configured template.
            </li>
            <li>
              <strong>Add fields</strong> — Each section has editable fields. Use the dropdown to
              pick common directives or type your own. Press <kbd>Enter</kbd> on the last value
              input to add another field.
            </li>
            <li>
              <strong>Preview</strong> — Click &quot;Show Preview&quot; to see the raw systemd unit
              file output.
            </li>
            <li>
              <strong>Copy or export</strong> — Copy the generated unit file to your clipboard, or
              export as JSON, PNG, JPEG, WebP, or PDF.
            </li>
          </ol>
        </section>

        <section className="help-section">
          <h2>Supported Unit Types</h2>
          <div className="help-category-grid">
            <div className="help-category">
              <h3>🔧 Service</h3>
              <p>
                Background service daemon. The most common unit type for long-running processes, web
                servers, and system daemons.
              </p>
              <p className="help-category-example">
                Example: <code>Type=simple</code>, <code>ExecStart=/usr/bin/my-app</code>
              </p>
            </div>
            <div className="help-category">
              <h3>⏱️ Timer</h3>
              <p>
                Timer-based activation. Schedule recurring tasks using calendar events or monotonic
                timers, similar to cron.
              </p>
              <p className="help-category-example">
                Example: <code>OnCalendar=daily</code>, <code>OnUnitActiveSec=1h</code>
              </p>
            </div>
            <div className="help-category">
              <h3>🔌 Socket</h3>
              <p>
                Socket-based activation. Start a service automatically when a connection arrives on
                a socket (TCP, UDP, UNIX).
              </p>
              <p className="help-category-example">
                Example: <code>ListenStream=0.0.0.0:8080</code>, <code>Accept=false</code>
              </p>
            </div>
            <div className="help-category">
              <h3>📂 Mount / Automount</h3>
              <p>
                Filesystem mount points and on-demand automounts. Define mount behavior for local
                filesystems, NFS shares, or network mounts.
              </p>
              <p className="help-category-example">
                Example: <code>What=/dev/sda1</code>, <code>Where=/mnt/data</code>,
                <code>Type=ext4</code>
              </p>
            </div>
            <div className="help-category">
              <h3>👁️ Path</h3>
              <p>
                Path-based activation. Trigger a service when a file or directory changes (modified,
                created, removed).
              </p>
              <p className="help-category-example">
                Example: <code>PathModified=/etc/my-app/config.d</code>
              </p>
            </div>
            <div className="help-category">
              <h3>🎯 Target</h3>
              <p>
                Grouping of units. Targets are synchronization points used during boot or
                operational states (like multi-user.target).
              </p>
              <p className="help-category-example">
                Example: <code>Wants=network-online.target</code>,{' '}
                <code>Requires=dbus.service</code>
              </p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Editing Sections & Fields</h2>
          <ul className="help-tips">
            <li>
              <strong>Section names</strong> — Click the section header text (e.g.,
              &quot;[Service]&quot;) to edit the section name. Type any valid systemd section name.
            </li>
            <li>
              <strong>Directive lookup</strong> — Use the dropdown in each field row to select from
              common directives for that section. Over 60+ Unit directives, 30+ Service directives,
              and 20+ Timer directives are built in.
            </li>
            <li>
              <strong>Custom directives</strong> — If the directive you need isn&apos;t in the
              dropdown, type it directly into the key input.
            </li>
            <li>
              <strong>Reorder sections</strong> — Use the ↑ and ↓ buttons to reorder sections.
            </li>
            <li>
              <strong>Add / remove sections</strong> — Click &quot;+ Add Section&quot; at the bottom
              of the editor. The X button removes a section entirely.
            </li>
          </ul>
        </section>

        <section className="help-section">
          <h2>Tips</h2>
          <ul className="help-tips">
            <li>
              <strong>Presets save time</strong> — Start from a preset to get common configurations
              pre-filled. Then customize from there.
            </li>
            <li>
              <strong>Validation warnings</strong> — The sidebar shows warnings for fields with
              missing keys or values. Fix these before generating your unit file.
            </li>
            <li>
              <strong>Browser storage</strong> — Your configuration is saved automatically. Close
              and come back later without losing your work.
            </li>
            <li>
              <strong>Share via URL</strong> — Use the share button to encode your entire
              configuration into the URL.
            </li>
            <li>
              <strong>Keyboard shortcuts</strong> — Use <kbd>Ctrl+Shift+E</kbd> to trigger export
              all formats.
            </li>
            <li>
              <strong>Dark mode</strong> — The tool follows your system preference. Use the theme
              toggle to switch manually.
            </li>
          </ul>
        </section>

        <section className="help-section">
          <h2>Common Use Cases</h2>
          <div className="help-use-cases">
            <div className="help-use-case">
              <h3>🌐 Web Application Service</h3>
              <p>
                Create a <code>.service</code> unit with <code>Type=simple</code>,
                <code>ExecStart</code> pointing to your binary, and a<code>WorkingDirectory</code>{' '}
                and <code>EnvironmentFile</code>. Add
                <code>Restart=on-failure</code> for resilience.
              </p>
            </div>
            <div className="help-use-case">
              <h3>⏰ Scheduled Backup</h3>
              <p>
                Create a <code>.timer</code> unit with <code>OnCalendar=daily</code> or
                <code>OnUnitActiveSec=1d</code>, linked to a service unit that runs your backup
                script with <code>Nice=19</code> and <code>IOSchedulingClass=idle</code>.
              </p>
            </div>
            <div className="help-use-case">
              <h3>🔌 Socket-Activated API</h3>
              <p>
                Create a socket unit with <code>ListenStream=0.0.0.0:8080</code> and a matching
                service unit. The service starts automatically when the first request arrives.
              </p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Privacy</h2>
          <p>
            This tool runs entirely in your browser. No data is sent to any server. Your unit
            configurations never leave your device.
          </p>
        </section>

        <section className="help-section">
          <h2>Need More Help?</h2>
          <p>
            Report issues or suggest new features on the{' '}
            <a
              href="https://github.com/ItsJust-tools/systemd-builder/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub issue tracker
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
