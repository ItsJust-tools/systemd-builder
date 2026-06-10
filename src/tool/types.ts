/**
 * Represents a single section within a systemd unit file (e.g., [Unit], [Service]).
 */
export interface UnitSection {
  /** The section name (e.g., "Unit", "Service", "Install") */
  name: string;
  /** Key-value directive pairs within this section */
  fields: Array<{ key: string; value: string }>;
}

/**
 * Represents a complete systemd unit configuration.
 */
export interface SystemdUnit {
  /** The type of systemd unit */
  unitType: 'service' | 'timer' | 'socket' | 'mount' | 'automount' | 'path' | 'target';
  /** The base filename (without extension) */
  unitName: string;
  /** Ordered list of sections in the unit file */
  sections: UnitSection[];
}

/** Union type of all supported systemd unit types */
export type SystemdUnitType = SystemdUnit['unitType'];

/** Human-readable descriptions for each supported unit type */
export const UNIT_TYPE_DESCRIPTIONS: Record<SystemdUnitType, string> = {
  service: 'Background service daemon',
  timer: 'Timer-based activation',
  socket: 'Socket-based activation',
  mount: 'Filesystem mount point',
  automount: 'Automated mount point',
  path: 'Path-based activation',
  target: 'Grouping of units',
};

/** Default section names for each unit type (used when switching types) */
export const DEFAULT_SECTIONS: Record<SystemdUnitType, string[]> = {
  service: ['Unit', 'Service', 'Install'],
  timer: ['Unit', 'Timer', 'Install'],
  socket: ['Unit', 'Socket', 'Install'],
  mount: ['Unit', 'Mount', 'Install'],
  automount: ['Unit', 'Automount', 'Install'],
  path: ['Unit', 'Path', 'Install'],
  target: ['Unit', 'Target'],
};

/**
 * Common systemd directive suggestions for each section type.
 * Used for autocomplete/validation within the form editor.
 */
export const SECTION_FIELD_SUGGESTIONS: Record<string, string[]> = {
  Unit: [
    'Description',
    'Documentation',
    'Wants',
    'Requires',
    'Requisite',
    'BindsTo',
    'PartOf',
    'Upholds',
    'Before',
    'After',
    'OnFailure',
    'OnSuccess',
    'PropagatesReloadTo',
    'ReloadPropagatedFrom',
    'ReloadSignal',
    'Conflicts',
    'ConditionPathExists',
    'ConditionPathExistsGlob',
    'ConditionPathIsDirectory',
    'ConditionPathIsSymbolicLink',
    'ConditionPathIsMountPoint',
    'ConditionPathIsReadWrite',
    'ConditionDirectoryNotEmpty',
    'ConditionFileNotEmpty',
    'ConditionFileIsExecutable',
    'ConditionACPower',
    'ConditionHost',
    'ConditionKernelCommandLine',
    'ConditionMemory',
    'ConditionCPUs',
    'ConditionArchitecture',
    'ConditionVirtualization',
    'ConditionSecurity',
    'ConditionCapability',
    'ConditionEnvironment',
    'ConditionUser',
    'ConditionGroup',
    'ConditionControlGroupController',
    'AssertPathExists',
    'AssertPathIsDirectory',
    'AssertPathIsSymbolicLink',
    'AssertPathIsMountPoint',
    'AssertPathIsReadWrite',
    'AssertDirectoryNotEmpty',
    'AssertFileNotEmpty',
    'AssertFileIsExecutable',
    'AssertACPower',
    'AssertHost',
    'AssertArchitecture',
    'AssertVirtualization',
    'AssertSecurity',
    'AssertCapability',
    'AssertUser',
    'AssertGroup',
    'AssertControlGroupController',
    'SourcePath',
    'DefaultDependencies',
    'IgnoreOnIsolate',
    'IgnoreOnSnapshot',
    'CollectMode',
    'FailureAction',
    'SuccessAction',
    'FailureActionExitStatus',
    'SuccessActionExitStatus',
    'JobTimeoutSec',
    'JobRunningTimeoutSec',
    'JobTimeoutAction',
    'JobTimeoutRebootArgument',
    'StartLimitIntervalSec',
    'StartLimitBurst',
    'StartLimitAction',
    'RebootArgument',
    'ConditionFirstBoot',
    'ConditionFirmware',
    'AssertFirmware',
    'ConditionNeedsUpdate',
    'AssertNeedsUpdate',
    'StopWhenUnneeded',
    'RefuseManualStart',
    'RefuseManualStop',
    'AllowIsolate',
  ],
  Service: [
    'Type',
    'ExecStart',
    'ExecStartPre',
    'ExecStartPost',
    'ExecCondition',
    'ExecStop',
    'ExecStopPost',
    'ExecReload',
    'Restart',
    'RestartSec',
    'RestartSteps',
    'RestartMaxDelaySec',
    'TimeoutStartSec',
    'TimeoutStopSec',
    'TimeoutAbortSec',
    'TimeoutCleanSec',
    'RuntimeMaxSec',
    'SuccessExitStatus',
    'RestartPreventExitStatus',
    'RestartForceExitStatus',
    'User',
    'Group',
    'DynamicUser',
    'SupplementaryGroups',
    'WorkingDirectory',
    'RootDirectory',
    'RootImage',
    'Environment',
    'EnvironmentFile',
    'PassEnvironment',
    'UnsetEnvironment',
    'StandardInput',
    'StandardOutput',
    'StandardError',
    'StandardInputData',
    'TTYPath',
    'TTYReset',
    'TTYVHangup',
    'TTYVTDisallocate',
    'SyslogIdentifier',
    'SyslogFacility',
    'SyslogLevel',
    'LogNamespace',
    'LogLevelMax',
    'LogExtraFields',
    'LimitNOFILE',
    'LimitNPROC',
    'LimitAS',
    'LimitRSS',
    'LimitCORE',
    'LimitMEMLOCK',
    'LimitFSIZE',
    'LimitSTACK',
    'LimitCPU',
    'LimitSIGPENDING',
    'LimitMSGQUEUE',
    'LimitNICE',
    'LimitRTPRIO',
    'LimitRTTIME',
    'Nice',
    'IOSchedulingClass',
    'IOSchedulingPriority',
    'CPUSchedulingPolicy',
    'CPUSchedulingPriority',
    'CPUSchedulingResetOnFork',
    'CPUAffinity',
    'CPUAccounting',
    'CPUWeight',
    'CPUQuota',
    'CPUQuotaPeriodSec',
    'MemoryMax',
    'MemoryHigh',
    'MemoryLow',
    'MemoryMin',
    'MemorySwapMax',
    'MemoryZSwapMax',
    'MemoryAccounting',
    'TasksMax',
    'TasksAccounting',
    'IOAccounting',
    'IOWeight',
    'IOReadWeight',
    'IOWriteWeight',
    'IODeviceWeight',
    'IOReadBandwidthMax',
    'IOWriteBandwidthMax',
    'IODeviceLatencyTargetSec',
    'NetworkNamespacePath',
    'PrivateNetwork',
    'NetworkLinkDown',
    'OOMScoreAdjust',
    'OOMPolicy',
    'UMask',
    'UtmpIdentifier',
    'KeyringMode',
    'ProtectSystem',
    'ProtectHome',
    'ProtectKernelTunables',
    'ProtectKernelModules',
    'ProtectKernelLogs',
    'ProtectControlGroups',
    'ProtectProc',
    'ProcSubset',
    'PrivateTmp',
    'PrivateDevices',
    'PrivateMounts',
    'PrivateUsers',
    'PrivateIPC',
    'ProtectClock',
    'ProtectHostname',
    'MemoryDenyWriteExecute',
    'RestrictRealtime',
    'RestrictSUIDSGID',
    'RestrictNamespaces',
    'RestrictAddressFamilies',
    'LockPersonality',
    'CapabilityBoundingSet',
    'AmbientCapabilities',
    'NoNewPrivileges',
    'DeviceAllow',
    'DevicePolicy',
    'SystemCallArchitectures',
    'SystemCallFilter',
    'SystemCallErrorNumber',
    'SystemCallLog',
    'RemoveIPC',
    'Delegate',
    'StateDirectory',
    'StateDirectoryMode',
    'CacheDirectory',
    'CacheDirectoryMode',
    'LogsDirectory',
    'LogsDirectoryMode',
    'ConfigurationDirectory',
    'ConfigurationDirectoryMode',
    'RuntimeDirectory',
    'RuntimeDirectoryMode',
    'RuntimeDirectoryPreserve',
    'BindPaths',
    'BindReadOnlyPaths',
    'MountImages',
    'TemporaryFileSystem',
    'ReloadSignal',
    'Sockets',
    'BusName',
    'NotifyAccess',
    'SdNotifySocket',
    'WatchdogSec',
    'FileDescriptorStoreMax',
    'ServiceTasksMax',
  ],
  Install: ['WantedBy', 'RequiredBy', 'Also', 'Alias', 'DefaultInstance'],
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
    'RemainAfterElapse',
    'Unit',
    'OnClockChange',
    'OnTimezoneChange',
  ],
  Socket: [
    'ListenStream',
    'ListenDatagram',
    'ListenSequentialPacket',
    'ListenFIFO',
    'ListenNetlink',
    'ListenMessageQueue',
    'ListenSpecial',
    'Service',
    'Accept',
    'MaxConnections',
    'MaxConnectionsPerSource',
    'KeepAlive',
    'KeepAliveTime',
    'KeepAliveInterval',
    'KeepAliveProbes',
    'SocketUser',
    'SocketGroup',
    'SocketMode',
    'BindIPv6Only',
    'ReusePort',
    'SmackLabel',
    'SELinuxContextFromNet',
    'IPTOS',
    'IPTTL',
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
    'LazyUnmount',
    'ForceUnmount',
    'NoSuid',
    'NoDev',
    'NoExec',
    'ReadWriteOnly',
    'RebootArgument',
  ],
  Automount: ['Where', 'DirectoryMode', 'TimeoutSec', 'ExtraOptions'],
  Path: [
    'PathExists',
    'PathExistsGlob',
    'PathChanged',
    'PathModified',
    'DirectoryNotEmpty',
    'Unit',
    'MakeDirectory',
    'DirectoryMode',
    'TriggerLimitBurst',
    'TriggerLimitIntervalSec',
  ],
  Target: [
    'Description',
    'Documentation',
    'Wants',
    'Requires',
    'BindsTo',
    'PartOf',
    'Conflicts',
    'Before',
    'After',
    'AllowIsolate',
    'StopWhenUnneeded',
    'RefuseManualStart',
    'RefuseManualStop',
  ],
};

/** Options for the service Type directive */
export const TYPE_OPTIONS = [
  { value: 'simple', label: 'simple (default)' },
  { value: 'forking', label: 'forking' },
  { value: 'oneshot', label: 'oneshot' },
  { value: 'dbus', label: 'dbus' },
  { value: 'notify', label: 'notify' },
  { value: 'exec', label: 'exec' },
];

/** Options for the service Restart directive */
export const RESTART_OPTIONS = [
  { value: 'no', label: 'no (default)' },
  { value: 'on-success', label: 'on-success' },
  { value: 'on-failure', label: 'on-failure' },
  { value: 'on-abnormal', label: 'on-abnormal' },
  { value: 'on-watchdog', label: 'on-watchdog' },
  { value: 'on-abort', label: 'on-abort' },
  { value: 'always', label: 'always' },
];

/**
 * Common systemd unit file presets for quick-start.
 * Each preset provides a name, description, and sections/fields to pre-fill.
 */
export interface UnitPreset {
  /** Display name for the preset */
  name: string;
  /** Short description explaining the use case */
  description: string;
  /** The padlock icon or emoji for the preset button */
  icon: string;
  /** Template state to apply */
  template: SystemdUnit;
}

/**
 * Built-in presets for commonly used systemd unit configurations.
 * These help users get started quickly with real-world patterns.
 */
export const UNIT_PRESETS: UnitPreset[] = [
  {
    name: 'Web Application',
    description: 'A Node.js/Python web service with environment variables and hardening',
    icon: '🌐',
    template: {
      unitType: 'service',
      unitName: 'my-web-app',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'Web application service' },
            { key: 'After', value: 'network.target' },
            { key: 'Wants', value: 'network-online.target' },
          ],
        },
        {
          name: 'Service',
          fields: [
            { key: 'Type', value: 'simple' },
            { key: 'User', value: 'www-data' },
            { key: 'WorkingDirectory', value: '/opt/my-web-app' },
            { key: 'ExecStart', value: '/usr/bin/node /opt/my-web-app/server.js' },
            { key: 'Restart', value: 'on-failure' },
            { key: 'RestartSec', value: '5' },
            { key: 'Environment', value: 'NODE_ENV=production' },
            { key: 'Environment', value: 'PORT=3000' },
            { key: 'NoNewPrivileges', value: 'true' },
            { key: 'ProtectSystem', value: 'full' },
            { key: 'ProtectHome', value: 'true' },
            { key: 'PrivateTmp', value: 'true' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'multi-user.target' }],
        },
      ],
    },
  },
  {
    name: 'Timer — Daily Backup',
    description: 'A timer that triggers a daily backup script at 2:00 AM',
    icon: '⏰',
    template: {
      unitType: 'timer',
      unitName: 'daily-backup',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'Daily backup timer' },
            { key: 'Documentation', value: 'https://example.com/backup-guide' },
          ],
        },
        {
          name: 'Timer',
          fields: [
            { key: 'OnCalendar', value: '*-*-* 02:00:00' },
            { key: 'Persistent', value: 'true' },
            { key: 'RandomizedDelaySec', value: '1800' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'timers.target' }],
        },
      ],
    },
  },
  {
    name: 'Simple Oneshot',
    description: 'A one-time task that runs at boot (e.g., sysctl, ip link)',
    icon: '⚡',
    template: {
      unitType: 'service',
      unitName: 'boot-sysctl',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'Apply sysctl settings at boot' },
            { key: 'After', value: 'network.target' },
            { key: 'Before', value: 'sshd.service' },
          ],
        },
        {
          name: 'Service',
          fields: [
            { key: 'Type', value: 'oneshot' },
            { key: 'ExecStart', value: '/usr/sbin/sysctl --system' },
            { key: 'RemainAfterExit', value: 'true' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'multi-user.target' }],
        },
      ],
    },
  },
  {
    name: 'Path Watcher',
    description: 'Trigger a service when a file is modified in a watched directory',
    icon: '👁️',
    template: {
      unitType: 'path',
      unitName: 'config-watcher',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'Watch config directory for changes' },
          ],
        },
        {
          name: 'Path',
          fields: [
            { key: 'PathModified', value: '/etc/my-app/config.d' },
            { key: 'Unit', value: 'config-reloader.service' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'multi-user.target' }],
        },
      ],
    },
  },
  {
    name: 'Socket Activation',
    description: 'Socket-activated service that starts on connection',
    icon: '🔌',
    template: {
      unitType: 'socket',
      unitName: 'my-api',
      sections: [
        {
          name: 'Unit',
          fields: [
            { key: 'Description', value: 'API server socket' },
            { key: 'PartOf', value: 'my-api.service' },
          ],
        },
        {
          name: 'Socket',
          fields: [
            { key: 'ListenStream', value: '0.0.0.0:8080' },
            { key: 'Accept', value: 'false' },
            { key: 'ReusePort', value: 'true' },
          ],
        },
        {
          name: 'Install',
          fields: [{ key: 'WantedBy', value: 'sockets.target' }],
        },
      ],
    },
  },
];

/**
 * Generates the complete systemd unit file content as a string.
 * Sections with no fields are omitted from the output.
 *
 * @param unit - The SystemdUnit configuration to render
 * @returns The formatted unit file string, or empty string if no content
 */
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

/**
 * Returns the expected filename for a systemd unit, including the type suffix.
 *
 * @param unit - The SystemdUnit to derive the filename from
 * @returns The filename (e.g., "my-app.service", "weekly-cleanup.timer")
 */
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