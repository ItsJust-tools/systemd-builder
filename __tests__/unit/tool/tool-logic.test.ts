import { describe, it, expect } from 'vitest';
import { createMockToolState } from '@itsjust/core/testing';
import { systemdTool, initialState } from '@/tool/tool-definition';
import type { SystemdUnit } from '@/tool/types';
import { generateUnitFile, getFilename, DEFAULT_SECTIONS, UNIT_PRESETS } from '@/tool/types';

describe('systemd builder logic', () => {
  it('initializes with default state', () => {
    const state = createMockToolState<SystemdUnit>({ ...initialState });

    expect(state.data.unitType).toBe('service');
    expect(state.data.unitName).toBe('my-service');
    expect(state.data.sections.length).toBeGreaterThan(0);
  });

  it('updates unit name', () => {
    const state = createMockToolState<SystemdUnit>({ ...initialState });

    state.setData((prev) => ({ ...prev, unitName: 'my-app' }));
    expect(state.data.unitName).toBe('my-app');
  });

  it('supports undo/redo', () => {
    const state = createMockToolState<SystemdUnit>({ ...initialState });

    state.setData((prev) => ({ ...prev, unitName: 'v2' }));
    expect(state.data.unitName).toBe('v2');
    expect(state.canUndo).toBe(true);

    state.undo();
    expect(state.data.unitName).toBe('my-service');
    expect(state.canRedo).toBe(true);

    state.redo();
    expect(state.data.unitName).toBe('v2');
  });
});

describe('systemd deserialize', () => {
  it('accepts valid systemd unit state', () => {
    const result = systemdTool.deserialize({
      unitType: 'timer',
      unitName: 'weekly-cleanup',
      sections: [{ name: 'Unit', fields: [{ key: 'Description', value: 'Weekly cleanup' }] }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unitType).toBe('timer');
      expect(result.data.unitName).toBe('weekly-cleanup');
    }
  });

  it('rejects null data', () => {
    const result = systemdTool.deserialize(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects non-object data', () => {
    const result = systemdTool.deserialize('string');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object without unitType', () => {
    const result = systemdTool.deserialize({ unitName: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('serializes state to JSON string', () => {
    const json = systemdTool.serialize(initialState);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.unitType).toBe('service');
  });
});

describe('generateUnitFile', () => {
  it('generates correct service unit file', () => {
    const unit: SystemdUnit = {
      unitType: 'service',
      unitName: 'my-app',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'My amazing app' },
            { key: 'After', value: 'network.target' },
          ],
        },
        {
          name: 'Service',
          fields: [
            { key: 'Type', value: 'simple' },
            { key: 'ExecStart', value: '/usr/bin/my-app' },
            { key: 'Restart', value: 'on-failure' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'multi-user.target' }],
        },
      ],
    };

    const output = generateUnitFile(unit);
    expect(output).toContain('[Unit]');
    expect(output).toContain('Description=My amazing app');
    expect(output).toContain('After=network.target');
    expect(output).toContain('[Service]');
    expect(output).toContain('Type=simple');
    expect(output).toContain('ExecStart=/usr/bin/my-app');
    expect(output).toContain('Restart=on-failure');
    expect(output).toContain('[Install]');
    expect(output).toContain('WantedBy=multi-user.target');
  });

  it('generates timer unit file', () => {
    const unit: SystemdUnit = {
      unitType: 'timer',
      unitName: 'backup',
      sections: [
        { name: 'Unit', fields: [{ key: 'Description', value: 'Daily backup timer' }] },
        {
          name: 'Timer',
          fields: [
            { key: 'OnCalendar', value: 'daily' },
            { key: 'Persistent', value: 'true' },
          ],
        },
        { name: 'Install', fields: [{ key: 'WantedBy', value: 'timers.target' }] },
      ],
    };

    const output = generateUnitFile(unit);
    expect(output).toContain('[Unit]');
    expect(output).toContain('[Timer]');
    expect(output).toContain('OnCalendar=daily');
    expect(output).toContain('Persistent=true');
    expect(output).toContain('[Install]');
  });

  it('returns empty string for empty sections', () => {
    const unit: SystemdUnit = {
      unitType: 'service',
      unitName: 'empty',
      sections: [],
    };

    expect(generateUnitFile(unit)).toBe('');
  });

  it('skips sections with no fields', () => {
    const unit: SystemdUnit = {
      unitType: 'service',
      unitName: 'test',
      sections: [
        { name: 'Unit', fields: [] },
        { name: 'Service', fields: [{ key: 'ExecStart', value: '/bin/true' }] },
      ],
    };

    const output = generateUnitFile(unit);
    expect(output).not.toContain('[Unit]');
    expect(output).toContain('[Service]');
    expect(output).toContain('ExecStart=/bin/true');
  });

  it('skips fields with empty keys or values', () => {
    const unit: SystemdUnit = {
      unitType: 'service',
      unitName: 'test',
      sections: [
        {
          name: 'Service',
          fields: [
            { key: 'ExecStart', value: '/bin/app' },
            { key: '', value: 'orphan-value' },
            { key: 'EmptyVal', value: '' },
            { key: '', value: '' },
          ],
        },
      ],
    };

    const output = generateUnitFile(unit);
    expect(output).toContain('[Service]');
    expect(output).toContain('ExecStart=/bin/app');
    expect(output).not.toContain('orphan-value');
    expect(output).not.toContain('EmptyVal=');
  });
});

describe('getFilename', () => {
  it('returns correct service filename', () => {
    expect(
      getFilename({ unitType: 'service', unitName: 'my-app', sections: [] })
    ).toBe('my-app.service');
  });

  it('returns correct timer filename', () => {
    expect(
      getFilename({ unitType: 'timer', unitName: 'backup', sections: [] })
    ).toBe('backup.timer');
  });

  it('returns correct socket filename', () => {
    expect(
      getFilename({ unitType: 'socket', unitName: 'http', sections: [] })
    ).toBe('http.socket');
  });

  it('handles unnamed units', () => {
    expect(
      getFilename({ unitType: 'service', unitName: '', sections: [] })
    ).toBe('unnamed.service');
  });
});

describe('DEFAULT_SECTIONS', () => {
  it('provides default sections for each unit type', () => {
    const types = ['service', 'timer', 'socket', 'mount', 'automount', 'path', 'target'] as const;
    for (const t of types) {
      expect(DEFAULT_SECTIONS[t].length).toBeGreaterThan(0);
    }
  });

  it('includes Unit section for all types', () => {
    const types = ['service', 'timer', 'socket', 'mount', 'automount', 'path', 'target'] as const;
    for (const t of types) {
      expect(DEFAULT_SECTIONS[t]).toContain('Unit');
    }
  });
});

describe('UNIT_PRESETS', () => {
  it('provides at least 3 presets', () => {
    expect(UNIT_PRESETS.length).toBeGreaterThanOrEqual(3);
  });

  it('each preset has required fields', () => {
    for (const preset of UNIT_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.icon).toBeTruthy();
      expect(preset.template).toBeDefined();
      expect(preset.template.unitType).toBeTruthy();
      expect(preset.template.unitName).toBeTruthy();
      expect(preset.template.sections.length).toBeGreaterThan(0);
    }
  });

  it('each preset template generates valid unit file output', () => {
    for (const preset of UNIT_PRESETS) {
      const output = generateUnitFile(preset.template);
      expect(output).toBeTruthy();
      expect(output).toContain(`[${preset.template.sections[0]?.name}]`);
    }
  });

  it('each preset template has at least one field with key and value', () => {
    for (const preset of UNIT_PRESETS) {
      const allFields = preset.template.sections.flatMap((s) => s.fields);
      const validFields = allFields.filter((f) => f.key && f.value);
      expect(validFields.length).toBeGreaterThan(0);
    }
  });

  it('Web Application preset generates realistic service', () => {
    const webPreset = UNIT_PRESETS.find((p) => p.name === 'Web Application');
    expect(webPreset).toBeDefined();
    const output = generateUnitFile(webPreset!.template);
    expect(output).toContain('Type=simple');
    expect(output).toContain('ExecStart=');
    expect(output).toContain('Restart=on-failure');
    expect(output).toContain('WantedBy=multi-user.target');
  });
});
