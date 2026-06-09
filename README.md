# systemd Unit Builder

[![CI](https://github.com/ItsJust-tools/systemd-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/systemd-builder/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm](https://img.shields.io/badge/version-1.1.0-blue)](https://github.com/ItsJust-tools/systemd-builder)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A visual tool for building [systemd](https://systemd.io/) unit files — services, timers, sockets, mount points, and more. No manual syntax needed.

Built for [ItsJust](https://itsjust.app), a collection of small, focused web utilities.

## Features

- **Visual form editor** — No manual syntax needed. Add sections and fields through an intuitive form.
- **Multiple unit types** — Service, Timer, Socket, Mount, Automount, Path, and Target units with smart defaults.
- **Custom field names** — Autocomplete-suggested field names with the ability to type any systemd directive.
- **Smart field values** — Context-aware dropdowns for common fields like `Type` (simple/forking/oneshot/…) and `Restart` policies.
- **Section management** — Add, remove, and reorder sections to build complex unit files.
- **Keyboard-friendly** — Press Enter on the last value input to quickly add new fields.
- **Live preview** — See the generated `.service`/`.timer`/`.socket` file in real-time.
- **Validation warnings** — Sidebar highlights fields with missing keys or values.
- **Export & Share** — Export as JSON, PNG, JPEG, WebP, or PDF. Share via URL.
- **Dark mode / high contrast** — Fully theme-aware with `@itsjust/core`.

## Supported Unit Types

| Type        | Description               | Default Sections         |
| ----------- | ------------------------- | ------------------------ |
| `service`   | Background service daemon | Unit, Service, Install   |
| `timer`     | Timer-based activation    | Unit, Timer, Install     |
| `socket`    | Socket-based activation   | Unit, Socket, Install    |
| `mount`     | Filesystem mount point    | Unit, Mount, Install     |
| `automount` | Automated mount point     | Unit, Automount, Install |
| `path`      | Path-based activation     | Unit, Path, Install      |
| `target`    | Grouping of units         | Unit, Target             |

## systemd Directives Reference

The tool provides autocomplete suggestions for each unit section. Below is a summary of key directives available in the builder:

### [Unit] Section

Common metadata and dependency directives:

- **Description / Documentation** — Human-readable description and documentation URIs
- **Wants / Requires / BindsTo / PartOf** — Dependency declarations (weaker to stronger)
- **Before / After** — Ordering relative to other units
- **OnFailure / OnSuccess** — Units to activate on specific outcomes
- **Conflicts** — Units that cannot run alongside this one
- **ConditionPathExists / AssertPathExists** — Conditional activation via filesystem paths
- **ConditionArchitecture / ConditionHost / ConditionVirtualization** — Runtime condition checks
- **ConditionMemory / ConditionCPUs** — Hardware condition checks
- **DefaultDependencies** — Whether default dependency ordering is applied
- **StopWhenUnneeded / RefuseManualStart / RefuseManualStop** — Lifecycle controls
- **StartLimitIntervalSec / StartLimitBurst / StartLimitAction** — Rate limiting
- **JobTimeoutSec / JobRunningTimeoutSec / JobTimeoutAction** — Job timeout handling
- **CollectMode** — Garbage collection mode for the unit
- **FailureAction / SuccessAction** — System-level action on unit failure/success

### [Service] Section

Execution environment and lifecycle:

- **Type** — `simple`, `forking`, `oneshot`, `dbus`, `notify`, or `exec` (each changes the expected lifecycle)
- **ExecStart / ExecStop / ExecReload** — Command paths with arguments
- **ExecStartPre / ExecStartPost / ExecCondition** — Pre/post hooks and conditional execution
- **Restart** — `no`, `on-success`, `on-failure`, `on-abnormal`, `on-watchdog`, `on-abort`, or `always`
- **RestartSec / RestartSteps / RestartMaxDelaySec** — Restart timing controls
- **SuccessExitStatus / RestartPreventExitStatus / RestartForceExitStatus** — Exit code handling
- **TimeoutStartSec / TimeoutStopSec / TimeoutAbortSec / TimeoutCleanSec** — Timeout configuration
- **RuntimeMaxSec** — Maximum runtime for the service
- **User / Group / DynamicUser / SupplementaryGroups** — Process credentials
- **WorkingDirectory / RootDirectory / RootImage** — Filesystem context
- **Environment / EnvironmentFile / PassEnvironment / UnsetEnvironment** — Environment variables
- **StandardInput / StandardOutput / StandardError / StandardInputData** — I/O stream configuration
- **TTYPath / TTYReset / TTYVHangup / TTYVTDisallocate** — TTY integration
- **SyslogIdentifier / SyslogFacility / SyslogLevel** — Logging preferences
- **LimitNOFILE / LimitNPROC / LimitCORE / LimitMEMLOCK / LimitAS / LimitCPU** — Resource limits
- **Nice / IOSchedulingClass / CPUSchedulingPolicy / CPUAffinity** — Scheduling and priority
- **CPUQuota / CPUQuotaPeriodSec** — CPU time limits
- **MemoryMax / MemoryHigh / MemoryLow / MemoryMin** — Memory controls (cgroup v2)
- **MemorySwapMax / MemoryZSwapMax** — Swap limits
- **TasksMax / IOWeight / IOReadBandwidthMax / IOWriteBandwidthMax** — Resource accounting
- **ProtectSystem / ProtectHome / PrivateTmp / PrivateDevices / PrivateMounts** — Sandboxing
- **ProtectKernelTunables / ProtectKernelModules / ProtectKernelLogs** — Kernel hardening
- **ProtectControlGroups / ProtectProc / ProcSubset** — cgroup and procfs hardening
- **NoNewPrivileges / CapabilityBoundingSet / AmbientCapabilities** — Capability controls
- **SystemCallFilter / SystemCallArchitectures / SystemCallErrorNumber** — Syscall filtering
- **MemoryDenyWriteExecute / RestrictRealtime / RestrictSUIDSGID** — Execution restrictions
- **RestrictNamespaces / RestrictAddressFamilies / LockPersonality** — Namespace and address family restrictions
- **OOMScoreAdjust / OOMPolicy** — OOM killer behavior
- **DeviceAllow / DevicePolicy** — Device access control
- **StateDirectory / CacheDirectory / LogsDirectory / RuntimeDirectory** — Service data directories
- **BindPaths / BindReadOnlyPaths / MountImages / TemporaryFileSystem** — Additional mounts
- **WatchdogSec / FileDescriptorStoreMax / ServiceTasksMax** — Watchdog and resource management
- **Delegate** — Pass cgroup delegation to the service
- **Sockets / BusName / NotifyAccess** — Socket and D-Bus integration
- **ReloadSignal / RemoveIPC / UtmpIdentifier / KeyringMode** — Signal and IPC controls

### [Install] Section

- **WantedBy / RequiredBy** — How the unit is pulled in (user-controlled vs. mandatory)
- **Also** — Other units to enable/disable alongside this one
- **Alias** — Additional names for this unit
- **DefaultInstance** — Default instance name for template units

### [Timer] Section

- **OnCalendar** — Calendar event expression (e.g., `Daily`, `Mon..Fri *-*-* 09:00:00`, `*-*-* 00/2:00:00`)
- **OnBootSec / OnStartupSec** — Relative time after boot/startup
- **OnUnitActiveSec / OnUnitInactiveSec** — Relative time after state transitions
- **AccuracySec** — Scheduling precision (higher = more efficient coalescing)
- **RandomizedDelaySec** — Maximum random delay to add (avoids thundering herd)
- **FixedRandomDelay** — Whether the random delay is deterministic per unit
- **Persistent** — Catch up on missed timer events across reboots
- **WakeSystem** — Allow the timer to wake the system from suspend
- **RemainAfterElapse** — Keep the timer unit active after the event elapses
- **OnClockChange / OnTimezoneChange** — Trigger on clock or timezone changes
- **Unit** — Explicit override of the unit to activate

### [Socket] Section

- **ListenStream / ListenDatagram / ListenSequentialPacket** — TCP/UDP/Unix socket types
- **ListenFIFO / ListenSpecial** — Named pipe and special file activation
- **ListenNetlink / ListenMessageQueue** — Netlink and POSIX message queue
- **Accept** — Per-connection service instances (inetd/xinetd style)
- **MaxConnections / MaxConnectionsPerSource** — Connection limits
- **KeepAlive / KeepAliveTime / KeepAliveInterval / KeepAliveProbes** — TCP keepalive
- **SocketUser / SocketGroup / SocketMode** — Ownership and permissions
- **BindIPv6Only / ReusePort** — Socket options
- **SmackLabel / SELinuxContextFromNet / IPTOS / IPTTL** — Security and network parameters
- **TriggerLimitBurst / TriggerLimitIntervalSec** — Rate limiting for socket activation
- **Service** — Explicit override of the service to activate

### [Mount] Section

- **What** — Block device or filesystem source path
- **Where** — Mount point path
- **Type** — Filesystem type (ext4, xfs, btrfs, zfs, tmpfs, etc.)
- **Options** — Mount options (comma-separated, e.g., `noatime,compress=zstd`)
- **TimeoutSec** — Mount operation timeout
- **Sloppy / LazyUnmount / ForceUnmount** — Mount/umount behavior flags
- **NoSuid / NoDev / NoExec / ReadWriteOnly** — Mount permission flags
- **RebootArgument** — Argument for reboot if mount fails

### [Automount] Section

- **Where** — Mount point path
- **DirectoryMode** — Permissions for the autofs mount point
- **TimeoutSec** — Idle timeout before unmount
- **ExtraOptions** — Extra autofs mount options

### [Path] Section

- **PathExists / PathExistsGlob** — Trigger when a path appears
- **PathChanged / PathModified** — Trigger when a path is written to or modified
- **DirectoryNotEmpty** — Trigger when a directory becomes non-empty
- **MakeDirectory / DirectoryMode** — Auto-create the watched directory
- **Unit** — Unit to activate on path event
- **TriggerLimitBurst / TriggerLimitIntervalSec** — Rate limiting

### [Target] Section

- **Description / Documentation** — Standard metadata
- **Wants / Requires / BindsTo / PartOf** — Dependency declarations
- **Conflicts / Before / After** — Ordering and conflict resolution
- **AllowIsolate** — Allow this target to be used with `systemctl isolate`
- **StopWhenUnneeded / RefuseManualStart / RefuseManualStop** — Lifecycle controls

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Choose a unit type** from the dropdown at the top.
2. **Name your unit** — this becomes the filename (e.g., `my-app.service`).
3. **Add fields** to each section using the form controls. Type any systemd directive or pick from autocomplete suggestions.
4. **Reorder sections** with the ▲/▼ buttons, add new sections, or remove unwanted ones.
5. **Preview** the generated unit file with the Show Preview button.
6. **Copy** the output or **export** as an image/PDF.

### Keyboard Shortcuts

| Shortcut       | Action                                |
| -------------- | ------------------------------------- |
| `Enter`        | Add a new field (on last value input) |
| `Escape`       | Blur current field input              |
| `Ctrl+Shift+E` | Export all formats                    |

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Vitest** with Testing Library
- **Playwright** for E2E tests

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── globals.css  # Global styles + theme variables
│   ├── layout.tsx   # Root layout with ThemeProvider
│   ├── page.tsx     # Home page
│   └── …
├── lib/           # Shared utilities (seo, etc.)
├── tool/
│   ├── components/
│   │   ├── tool-canvas.tsx    # Main form editor
│   │   ├── tool-sidebar.tsx   # Info panel & validation
│   │   └── tool-toolbar.tsx   # Toolbar links
│   ├── types.ts               # Types, constants, unit file generator
│   ├── tool-definition.ts     # Tool lifecycle (init, serialize, deserialize)
│   ├── tool.config.ts         # Tool configuration
│   └── …
```

## Contributing

PRs are welcome! This tool follows the ItsJust-tools conventions:

- `@itsjust/core` provides the shared shell (toolbar, sidebar, status bar, theme)
- Each tool lives in `src/tool/` with a consistent structure
- Tests go in `__tests__/` (unit tests with Vitest, E2E with Playwright)

## License

[MIT](LICENSE)
