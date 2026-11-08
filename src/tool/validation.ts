/**
 * Live validation for systemd unit configurations.
 * Highlights missing required directives and common mistakes:
 * - `Description=` missing in the [Unit] section (warning)
 * - `ExecStart=` missing in [Service] (error, required for most service types)
 * - `ExecStart=` present but executable is not an absolute path (error)
 * - `ExecStop=` warnings for certain service types
 * - `unitName` empty (error)
 */
import type { SystemdUnit, UnitSection } from './types';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Human-readable message, e.g. "Missing required directive ExecStart= in [Service]" */
  message: string;
  /** Section name the issue relates to, if any */
  section?: string;
  /** Directive key the issue relates to, if any */
  directive?: string;
}

const EXEC_DIRECTIVES = ['ExecStart', 'ExecStop', 'ExecReload', 'ExecStartPre', 'ExecStartPost'];

function getSection(unit: SystemdUnit, name: string): UnitSection | undefined {
  return unit.sections.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

function getFieldValue(section: UnitSection | undefined, key: string): string | undefined {
  const field = section?.fields.find((f) => f.key.toLowerCase() === key.toLowerCase());
  return field && field.value.trim() !== '' ? field.value : undefined;
}

/**
 * Validate a systemd unit configuration. Pure function, safe for unit tests.
 */
export function validateUnit(unit: SystemdUnit): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!unit.unitName.trim()) {
    issues.push({
      severity: 'error',
      message: 'Unit name is empty. Choose a filename without extension, e.g. "my-service".',
    });
  }

  const unitSection = getSection(unit, 'Unit');
  const serviceSection = getSection(unit, 'Service');

  // Description is strongly recommended
  if (!getFieldValue(unitSection, 'Description')) {
    issues.push({
      severity: 'warning',
      message: 'Missing Description= in [Unit]. systemd warns for units without a description.',
      section: 'Unit',
      directive: 'Description',
    });
  }

  if (unit.unitType === 'service' && serviceSection) {
    const serviceType = getFieldValue(serviceSection, 'Type') || 'simple';
    const execStart = getFieldValue(serviceSection, 'ExecStart');

    // oneshot units still require ExecStart unless RemainAfterExit style without it;
    // systemd requires ExecStart= for simple/exec/forking/notify/oneshot types
    const typesRequiringExecStart = ['simple', 'exec', 'forking', 'notify', 'oneshot', 'dbus'];

    if (!execStart && typesRequiringExecStart.includes(serviceType)) {
      issues.push({
        severity: 'error',
        message: `Missing required directive ExecStart= in [Service] (required for Type=${serviceType}).`,
        section: 'Service',
        directive: 'ExecStart',
      });
    }

    if (execStart) {
      // First token must be an absolute path (unless prefixed with modifier chars like !, +, -)
      const firstToken = execStart.trim().split(/\s+/)[0] ?? '';
      const stripped = firstToken.replace(/^[!+\-:@%]+/, '');
      if (stripped && !stripped.startsWith('/')) {
        issues.push({
          severity: 'error',
          message: `ExecStart= executable must be an absolute path (e.g. /usr/bin/foo), got "${firstToken}".`,
          section: 'Service',
          directive: 'ExecStart',
        });
      }
    }

    // ExecStop/ExecReload with relative path also invalid
    for (const exec of ['ExecStop', 'ExecReload', 'ExecStartPre', 'ExecStartPost'] as const) {
      const value = getFieldValue(serviceSection, exec);
      if (value) {
        const firstToken = value.trim().split(/\s+/)[0] ?? '';
        const stripped = firstToken.replace(/^[!+\-:@%]+/, '');
        if (stripped && !stripped.startsWith('/')) {
          issues.push({
            severity: 'error',
            message: `${exec}= executable must be an absolute path, got "${firstToken}".`,
            section: 'Service',
            directive: exec,
          });
        }
      }
    }

    // Warn when ExecStop is set for oneshot services (usually unnecessary)
    if (serviceType === 'oneshot' && getFieldValue(serviceSection, 'ExecStop')) {
      issues.push({
        severity: 'warning',
        message: 'ExecStop= is rarely needed for Type=oneshot services (stop is implicit).',
        section: 'Service',
        directive: 'ExecStop',
      });
    }

    // Warn: forking without PIDFile
    if (serviceType === 'forking' && !getFieldValue(serviceSection, 'PIDFile')) {
      issues.push({
        severity: 'warning',
        message: 'Type=forking services should set PIDFile= so systemd can track the main process.',
        section: 'Service',
        directive: 'PIDFile',
      });
    }
  }

  return issues;
}

/** Directives whose value must reference an absolute executable path. */
export const EXEC_PATH_DIRECTIVES = EXEC_DIRECTIVES;
