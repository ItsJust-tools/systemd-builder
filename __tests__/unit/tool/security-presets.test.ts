import { describe, it, expect } from 'vitest';
import type { SystemdUnit } from '@/tool/types';
import { generateUnitFile, DEFAULT_SECTIONS, SECURITY_PRESETS, applySecurityDirectives } from '@/tool/types';

const serviceUnit = (): SystemdUnit => ({
  unitType: 'service',
  unitName: 'my-service',
  sections: [
    {
      name: 'Unit',
      fields: [{ key: 'Description', value: 'Test service' }],
    },
    {
      name: 'Service',
      fields: [
        { key: 'Type', value: 'simple' },
        { key: 'ExecStart', value: '/usr/bin/test' },
        { key: 'ProtectSystem', value: 'full' },
      ],
    },
    {
      name: 'Install',
      fields: [{ key: 'WantedBy', value: 'multi-user.target' }],
    },
  ],
});

describe('SECURITY_PRESETS', () => {
  it('exposes the recommended basic hardening directives', () => {
    const basic = SECURITY_PRESETS.find((p) => p.name === 'Basic Hardening');
    expect(basic).toBeDefined();
    const keys = basic!.directives.map((d) => d.key);
    expect(keys).toContain('NoNewPrivileges');
    expect(keys).toContain('ProtectSystem');
    expect(keys).toContain('ProtectHome');
    expect(keys).toContain('PrivateTmp');
    expect(basic!.directives.every((d) => d.key && d.value)).toBe(true);
  });

  it('exposes a strict sandboxing preset with syscall filtering', () => {
    const strict = SECURITY_PRESETS.find((p) => p.name === 'Strict Sandboxing');
    expect(strict).toBeDefined();
    const keys = strict!.directives.map((d) => d.key);
    expect(keys).toContain('SystemCallFilter');
    expect(keys).toContain('PrivateDevices');
    expect(keys).toContain('CapabilityBoundingSet');
  });
});

describe('applySecurityDirectives', () => {
  it('adds directives to the [Service] section', () => {
    const sections = applySecurityDirectives(serviceUnit().sections, [
      { key: 'NoNewPrivileges', value: 'yes' },
    ]);
    const service = sections.find((s) => s.name === 'Service')!;
    expect(service.fields.some((f) => f.key === 'NoNewPrivileges' && f.value === 'yes')).toBe(true);
  });

  it('replaces conflicting directives instead of duplicating them', () => {
    const sections = applySecurityDirectives(serviceUnit().sections, [
      { key: 'ProtectSystem', value: 'strict' },
    ]);
    const service = sections.find((s) => s.name === 'Service')!;
    const matches = service.fields.filter((f) => f.key === 'ProtectSystem');
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toBe('strict');
  });

  it('does not mutate the input sections', () => {
    const unit = serviceUnit();
    const before = JSON.stringify(unit.sections);
    applySecurityDirectives(unit.sections, [{ key: 'PrivateTmp', value: 'yes' }]);
    expect(JSON.stringify(unit.sections)).toBe(before);
  });

  it('creates a [Service] section before [Install] when missing', () => {
    const sections: SystemdUnit['sections'] = [
      { name: 'Unit', fields: [{ key: 'Description', value: 'X' }] },
      { name: 'Install', fields: [{ key: 'WantedBy', value: 'multi-user.target' }] },
    ];
    const result = applySecurityDirectives(sections, [{ key: 'PrivateTmp', value: 'yes' }]);
    const serviceIndex = result.findIndex((s) => s.name === 'Service');
    const installIndex = result.findIndex((s) => s.name === 'Install');
    expect(serviceIndex).toBeGreaterThanOrEqual(0);
    expect(serviceIndex).toBeLessThan(installIndex);
  });

  it('appends the [Service] section when no [Install] exists', () => {
    const sections: SystemdUnit['sections'] = [
      { name: 'Unit', fields: [{ key: 'Description', value: 'X' }] },
    ];
    const result = applySecurityDirectives(sections, [{ key: 'PrivateTmp', value: 'yes' }]);
    expect(result[result.length - 1]!.name).toBe('Service');
  });

  it('preserves non-Service sections untouched', () => {
    const unit = serviceUnit();
    const result = applySecurityDirectives(unit.sections, [{ key: 'PrivateTmp', value: 'yes' }]);
    expect(result.find((s) => s.name === 'Unit')).toEqual(unit.sections.find((s) => s.name === 'Unit'));
    expect(result.find((s) => s.name === 'Install')).toEqual(unit.sections.find((s) => s.name === 'Install'));
  });

  it('security preset output renders into the generated unit file', () => {
    const basic = SECURITY_PRESETS.find((p) => p.name === 'Basic Hardening')!;
    const sections = applySecurityDirectives(serviceUnit().sections, basic.directives);
    const output = generateUnitFile({ ...serviceUnit(), sections });
    expect(output).toContain('NoNewPrivileges=yes');
    expect(output).toContain('ProtectSystem=strict');
    expect(output).toContain('ProtectHome=yes');
    expect(output).toContain('PrivateTmp=yes');
    expect(output).toContain('ExecStart=/usr/bin/test');
  });
});

describe('DEFAULT_SECTIONS regression', () => {
  it('still provides the standard section skeleton', () => {
    expect(DEFAULT_SECTIONS.service).toEqual(['Unit', 'Service', 'Install']);
  });
});
