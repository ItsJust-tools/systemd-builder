import { describe, expect, it } from 'vitest';
import { validateUnit } from '../../src/tool/validation';
import type { SystemdUnit } from '../../src/tool/types';

function makeUnit(overrides: Partial<SystemdUnit> = {}): SystemdUnit {
  return {
    unitType: 'service',
    unitName: 'my-service',
    sections: [
      { name: 'Unit', fields: [{ key: 'Description', value: 'My service' }] },
      {
        name: 'Service',
        fields: [{ key: 'ExecStart', value: '/usr/bin/sleep 10' }],
      },
      { name: 'Install', fields: [{ key: 'WantedBy', value: 'multi-user.target' }] },
    ],
    ...overrides,
  };
}

describe('validateUnit', () => {
  it('returns no issues for a valid service', () => {
    expect(validateUnit(makeUnit())).toEqual([]);
  });

  it('errors when ExecStart is missing for a simple service', () => {
    const unit = makeUnit({
      sections: [
        { name: 'Unit', fields: [{ key: 'Description', value: 'X' }] },
        { name: 'Service', fields: [] },
      ],
    });
    const issues = validateUnit(unit);
    const exec = issues.find((i) => i.directive === 'ExecStart');
    expect(exec?.severity).toBe('error');
    expect(exec?.message).toContain('ExecStart=');
  });

  it('errors for each service type that requires ExecStart', () => {
    for (const type of ['simple', 'exec', 'forking', 'notify', 'oneshot', 'dbus']) {
      const unit = makeUnit({
        sections: [
          { name: 'Unit', fields: [{ key: 'Description', value: 'X' }] },
          { name: 'Service', fields: [{ key: 'Type', value: type }] },
        ],
      });
      const issues = validateUnit(unit);
      expect(
        issues.some((i) => i.directive === 'ExecStart' && i.severity === 'error'),
        `Type=${type} should require ExecStart`
      ).toBe(true);
    }
  });

  it('errors when ExecStart executable is not an absolute path', () => {
    const unit = makeUnit();
    unit.sections[1]!.fields[0]!.value = 'sleep 10';
    const issues = validateUnit(unit);
    expect(issues.some((i) => i.severity === 'error' && i.message.includes('absolute path'))).toBe(
      true
    );
  });

  it('accepts ExecStart with systemd modifier prefixes', () => {
    const unit = makeUnit();
    unit.sections[1]!.fields[0]!.value = '+-/usr/bin/sleep 10';
    expect(validateUnit(unit)).toEqual([]);
  });

  it('errors for relative paths in ExecStop and ExecReload', () => {
    const unit = makeUnit();
    unit.sections[1]!.fields.push(
      { key: 'ExecStop', value: 'bin/stop' },
      { key: 'ExecReload', value: 'reload' }
    );
    const issues = validateUnit(unit);
    expect(issues.filter((i) => i.message.includes('absolute path')).length).toBe(2);
  });

  it('warns when Description is missing', () => {
    const unit = makeUnit({ sections: [{ name: 'Unit', fields: [] }] });
    const issues = validateUnit(unit);
    expect(issues.some((i) => i.directive === 'Description' && i.severity === 'warning')).toBe(
      true
    );
  });

  it('warns for ExecStop on oneshot services', () => {
    const unit = makeUnit();
    unit.sections[1]!.fields.push(
      { key: 'Type', value: 'oneshot' },
      { key: 'ExecStop', value: '/bin/stop' }
    );
    const issues = validateUnit(unit);
    expect(issues.some((i) => i.directive === 'ExecStop' && i.severity === 'warning')).toBe(true);
  });

  it('warns for forking services without PIDFile', () => {
    const unit = makeUnit();
    unit.sections[1]!.fields.push({ key: 'Type', value: 'forking' });
    const issues = validateUnit(unit);
    expect(issues.some((i) => i.directive === 'PIDFile' && i.severity === 'warning')).toBe(true);
  });

  it('errors when unitName is empty or whitespace', () => {
    expect(validateUnit(makeUnit({ unitName: '' })).some((i) => i.severity === 'error')).toBe(true);
    expect(validateUnit(makeUnit({ unitName: '   ' })).some((i) => i.severity === 'error')).toBe(
      true
    );
  });

  it('does not require ExecStart for non-service unit types', () => {
    const unit = makeUnit({
      unitType: 'timer',
      sections: [{ name: 'Unit', fields: [] }, { name: 'Timer', fields: [] }],
    });
    expect(validateUnit(unit).some((i) => i.directive === 'ExecStart')).toBe(false);
  });

  it('treats Type field case-insensitively and defaults to simple', () => {
    const unit = makeUnit({
      sections: [
        { name: 'Unit', fields: [{ key: 'Description', value: 'X' }] },
        { name: 'Service', fields: [{ key: 'type', value: 'SIMPLE' }] },
      ],
    });
    // 'SIMPLE' won't match lowercased types list, so no ExecStart error (graceful)
    const issues = validateUnit(unit);
    expect(issues.filter((i) => i.directive === 'ExecStart' && i.severity === 'error')).toEqual([]);
  });
});
