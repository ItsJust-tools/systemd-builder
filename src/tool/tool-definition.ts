import type { Tool } from '@itsjust/core';
import toolConfig from './tool.config';
import type { SystemdUnit } from './types';
import { DEFAULT_SECTIONS } from './types';

function isSystemdUnitState(value: unknown): value is SystemdUnit {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as {
    unitType?: unknown;
    unitName?: unknown;
    sections?: unknown;
  };
  return (
    typeof v.unitType === 'string' &&
    typeof v.unitName === 'string' &&
    Array.isArray(v.sections)
  );
}

export const initialState: SystemdUnit = {
  unitType: 'service',
  unitName: 'my-service',
  sections: DEFAULT_SECTIONS['service'].map((name) => ({ name, fields: [] })),
};

export const systemdTool: Tool<SystemdUnit> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState,
  serialize: (state) => JSON.stringify(state, null, 2),
  deserialize: (data) => {
    if (isSystemdUnitState(data)) {
      return { success: true, data };
    }
    return {
      success: false,
      error:
        'Invalid data format: expected { unitType: string, unitName: string, sections: [{ name: string, fields: [{key: string, value: string}] }] }',
    };
  },
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};
