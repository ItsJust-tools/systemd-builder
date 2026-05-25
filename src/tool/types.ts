export interface UnitSection {
  name: string;
  fields: Array<{ key: string; value: string }>;
}

export interface SystemdUnit {
  unitType: 'service' | 'timer' | 'socket' | 'mount' | 'automount' | 'path' | 'target';
  unitName: string;
  sections: UnitSection[];
}

export type SystemdUnitType = SystemdUnit['unitType'];

export const UNIT_TYPE_DESCRIPTIONS: Record<SystemdUnitType, string> = {
  service: 'Background service daemon',
  timer: 'Timer-based activation',
  socket: 'Socket-based activation',
  mount: 'Filesystem mount point',
  automount: 'Automated mount point',
  path: 'Path-based activation',
  target: 'Grouping of units',
};

export const DEFAULT_SECTIONS: Record<SystemdUnitType, string[]> = {
  service: ['Unit', 'Service', 'Install'],
  timer: ['Unit', 'Timer', 'Install'],
  socket: ['Unit', 'Socket', 'Install'],
  mount: ['Unit', 'Mount', 'Install'],
  automount: ['Unit', 'Automount', 'Install'],
  path: ['Unit', 'Path', 'Install'],
  target: ['Unit', 'Target'],
};

export const SECTION_FIELD_SUGGESTIONS: Record<string, string[]> = {
  Unit: [
    'Description',
    'Documentation',
    'Wants',
    'Requires',
    'BindsTo',
    'Before',
    'After',
    'Conflicts',
    'ConditionPathExists',
    'ConditionArchitecture',
    'AssertPathExists',
    'DefaultDependencies',
  ],
  Service: [
    'Type',
    'ExecStart',
    'ExecStartPre',
    'ExecStartPost',
    'ExecStop',
    'ExecStopPost',
    'ExecReload',
    'Restart',
    'RestartSec',
    'TimeoutStartSec',
    'TimeoutStopSec',
    'User',
    'Group',
    'WorkingDirectory',
    'Environment',
    'EnvironmentFile',
    'StandardOutput',
    'StandardError',
    'LimitNOFILE',
    'Nice',
    'IOSchedulingClass',
    'CPUSchedulingPolicy',
    'MemoryMax',
    'MemoryHigh',
    'CPUQuota',
    'TasksMax',
    'OOMScoreAdjust',
    'ProtectSystem',
    'ProtectHome',
    'PrivateTmp',
    'NoNewPrivileges',
    'CapabilityBoundingSet',
    'DeviceAllow',
    'SystemCallFilter',
  ],
  Install: ['WantedBy', 'RequiredBy', 'Also', 'Alias'],
  Timer: [
    'OnCalendar',
    'OnActiveSec',
    'OnBootSec',
    'OnStartupSec',
    'OnUnitActiveSec',
    'OnUnitInactiveSec',
    'AccuracySec',
    'RandomizedDelaySec',
    'FixedRandomDelay',
    'Persistent',
    'WakeSystem',
    'Unit',
  ],
  Socket: [
    'ListenStream',
    'ListenDatagram',
    'ListenSequentialPacket',
    'ListenFIFO',
    'Service',
    'Accept',
    'MaxConnections',
    'KeepAlive',
    'KeepAliveTime',
    'KeepAliveInterval',
    'KeepAliveProbes',
    'SocketUser',
    'SocketGroup',
    'SocketMode',
    'TriggerLimitBurst',
    'TriggerLimitIntervalSec',
  ],
  Mount: [
    'What',
    'Where',
    'Type',
    'Options',
    'TimeoutSec',
    'Sloppy',
    'NoSuid',
    'NoDev',
    'NoExec',
    'ReadWriteOnly',
  ],
  Automount: [
    'Where',
    'DirectoryMode',
    'TimeoutSec',
  ],
  Path: [
    'PathExists',
    'PathExistsGlob',
    'PathChanged',
    'PathModified',
    'DirectoryNotEmpty',
    'Unit',
    'MakeDirectory',
    'DirectoryMode',
  ],
  Target: [
    'Description',
    'Documentation',
    'Wants',
    'Requires',
    'AllowIsolate',
  ],
};

export const TYPE_OPTIONS = [
  { value: 'simple', label: 'simple (default)' },
  { value: 'forking', label: 'forking' },
  { value: 'oneshot', label: 'oneshot' },
  { value: 'dbus', label: 'dbus' },
  { value: 'notify', label: 'notify' },
  { value: 'exec', label: 'exec' },
];

export const RESTART_OPTIONS = [
  { value: 'no', label: 'no (default)' },
  { value: 'on-success', label: 'on-success' },
  { value: 'on-failure', label: 'on-failure' },
  { value: 'on-abnormal', label: 'on-abnormal' },
  { value: 'on-watchdog', label: 'on-watchdog' },
  { value: 'on-abort', label: 'on-abort' },
  { value: 'always', label: 'always' },
];

export function generateUnitFile(unit: SystemdUnit): string {
  const lines: string[] = [];

  for (const section of unit.sections) {
    if (section.fields.length === 0) continue;
    lines.push(`[${section.name}]`);
    for (const field of section.fields) {
      if (field.key && field.value) {
        lines.push(`${field.key}=${field.value}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function getFilename(unit: SystemdUnit): string {
  const typeSuffix: Record<string, string> = {
    service: '.service',
    timer: '.timer',
    socket: '.socket',
    mount: '.mount',
    automount: '.automount',
    path: '.path',
    target: '.target',
  };
  return `${unit.unitName || 'unnamed'}${typeSuffix[unit.unitType] || '.service'}`;
}
