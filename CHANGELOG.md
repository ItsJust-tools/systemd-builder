# Changelog

## [1.2.0] - 2026-06-15

### Added

- `.swap` unit type support alongside the existing Service, Timer, Socket, Mount, Automount, Path, and Target types
- Section name autocomplete and a Swap Device Quick Start preset with a realistic swap file/device template
- Comprehensive systemd Swap directive reference in the README

## [1.1.0] - 2026-06-04

### Added

- Custom field keys with autocomplete-suggested systemd directives
- Section management: add, remove, and reorder sections
- Validation warnings in the sidebar for fields with missing keys or values
- Keyboard shortcuts (Enter on the last value input quickly adds new fields)
- Comprehensive README documentation

## [1.0.0] - 2026-05-25

### Initial Release

- Visual form editor for systemd unit files
- Support for 7 unit types: Service, Timer, Socket, Mount, Automount, Path, Target
- Smart field suggestions specific to each section type
- Live preview of generated unit file content
- Export to JSON, PNG, JPEG, WebP, PDF
- Share via URL with compressed state
- Dark mode and high contrast support
- Undo/redo support
- Auto-save with localStorage
