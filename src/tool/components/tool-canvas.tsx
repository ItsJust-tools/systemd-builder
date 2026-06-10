'use client';

import { useCallback, useMemo, useState, useRef } from 'react';
import type { SystemdUnit, UnitSection } from '../types';
import {
  generateUnitFile,
  UNIT_TYPE_DESCRIPTIONS,
  DEFAULT_SECTIONS,
  SECTION_FIELD_SUGGESTIONS,
  TYPE_OPTIONS,
  RESTART_OPTIONS,
  UNIT_PRESETS,
} from '../types';

interface ToolCanvasProps {
  state: SystemdUnit;
  onChange: (state: SystemdUnit) => void;
}

function SectionFieldEditor({
  section,
  sectionIndex,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  onUpdateSectionName,
  sectionCount,
}: {
  section: UnitSection;
  sectionIndex: number;
  onUpdateSection: (index: number, section: UnitSection) => void;
  onRemoveSection: (index: number) => void;
  onAddSection: (afterIndex: number) => void;
  onMoveSection: (from: number, to: number) => void;
  onUpdateSectionName: (index: number, name: string) => void;
  sectionCount: number;
}) {
  const suggestions = useMemo(() => SECTION_FIELD_SUGGESTIONS[section.name] || [], [section.name]);

  const addField = useCallback(() => {
    const firstSuggestion = suggestions[0] || '';
    const valueHint =
      section.name === 'Service' && firstSuggestion === 'ExecStart' ? '/usr/bin/' : 'value';
    onUpdateSection(sectionIndex, {
      ...section,
      fields: [...section.fields, { key: firstSuggestion, value: valueHint }],
    });
  }, [section, sectionIndex, onUpdateSection, suggestions]);

  const removeField = useCallback(
    (fieldIndex: number) => {
      onUpdateSection(sectionIndex, {
        ...section,
        fields: section.fields.filter((_, i) => i !== fieldIndex),
      });
    },
    [section, sectionIndex, onUpdateSection]
  );

  const updateField = useCallback(
    (fieldIndex: number, key: string, value: string) => {
      const newFields = [...section.fields];
      newFields[fieldIndex] = { key, value };
      onUpdateSection(sectionIndex, { ...section, fields: newFields });
    },
    [section, sectionIndex, onUpdateSection]
  );

  const handleValueKeyDown = useCallback(
    (e: React.KeyboardEvent, fieldIndex: number) => {
      // Enter on the last field's value input adds a new field
      if (e.key === 'Enter' && !e.shiftKey && fieldIndex === section.fields.length - 1) {
        e.preventDefault();
        addField();
      }
      // Escape blurs the input
      if (e.key === 'Escape') {
        (e.target as HTMLElement).blur();
      }
    },
    [addField, section.fields.length]
  );

  const handleKeySelectKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter on key select moves focus to value input
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const row = target.closest('.field-row');
      if (row) {
        const valueInput = row.querySelector('.field-value-input') as HTMLElement;
        valueInput?.focus();
      }
    }
  }, []);

  return (
    <div className="systemd-section">
      <div className="section-header-row">
        <input
          className="section-title-input"
          type="text"
          value={section.name}
          onChange={(e) => onUpdateSectionName(sectionIndex, e.target.value)}
          aria-label={`Section name for section ${sectionIndex + 1}`}
          spellCheck={false}
        />
        <div className="section-header-actions">
          <button
            type="button"
            className="btn btn-sm btn-move-section"
            onClick={() => onMoveSection(sectionIndex, sectionIndex - 1)}
            disabled={sectionIndex === 0}
            aria-label={`Move ${section.name} up`}
            title="Move section up"
          >
            ▲
          </button>
          <button
            type="button"
            className="btn btn-sm btn-move-section"
            onClick={() => onMoveSection(sectionIndex, sectionIndex + 1)}
            disabled={sectionIndex === sectionCount - 1}
            aria-label={`Move ${section.name} down`}
            title="Move section down"
          >
            ▼
          </button>
          <button
            type="button"
            className="btn btn-sm btn-add-field"
            onClick={addField}
            aria-label={`Add field to ${section.name}`}
          >
            + Add Field
          </button>
          <button
            type="button"
            className="btn btn-sm btn-remove-section"
            onClick={() => onRemoveSection(sectionIndex)}
            disabled={sectionCount <= 1}
            aria-label={`Remove ${section.name} section`}
            title="Remove section"
          >
            ✕ Section
          </button>
        </div>
      </div>

      {section.fields.length === 0 && (
        <p className="section-placeholder">
          No fields yet. Click &quot;+ Add Field&quot; or press Enter on a value field to begin.
        </p>
      )}

      {section.fields.map((field, fieldIndex) => {
        const allSuggestions = SECTION_FIELD_SUGGESTIONS[section.name] || [];
        const datalistId = `field-keys-${sectionIndex}`;
        return (
          <div key={fieldIndex} className="field-row">
            <div className="field-controls">
              <input
                className="field-key-input"
                type="text"
                value={field.key}
                onChange={(e) => updateField(fieldIndex, e.target.value, field.value)}
                onKeyDown={handleKeySelectKeyDown}
                placeholder="Key"
                aria-label={`Field name in ${section.name}`}
                spellCheck={false}
                list={datalistId}
              />
              <datalist id={datalistId}>
                {allSuggestions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>

              {field.key === 'Type' && section.name === 'Service' ? (
                <select
                  className="field-value-input"
                  value={field.value}
                  onChange={(e) => updateField(fieldIndex, field.key, e.target.value)}
                  aria-label="Service type"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.key === 'Restart' && section.name === 'Service' ? (
                <select
                  className="field-value-input"
                  value={field.value}
                  onChange={(e) => updateField(fieldIndex, field.key, e.target.value)}
                  aria-label="Restart policy"
                >
                  {RESTART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="field-value-input"
                  type="text"
                  value={field.value}
                  onChange={(e) => updateField(fieldIndex, field.key, e.target.value)}
                  onKeyDown={(e) => handleValueKeyDown(e, fieldIndex)}
                  placeholder="value"
                  aria-label={`Value for ${field.key}`}
                  spellCheck={false}
                />
              )}

              <button
                type="button"
                className="btn btn-remove-field"
                onClick={() => removeField(fieldIndex)}
                aria-label={`Remove ${field.key || 'field'}`}
                title="Remove field"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToolCanvas({ state, onChange }: ToolCanvasProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasAnyFields = useMemo(
    () => state.sections.some((s) => s.fields.length > 0),
    [state.sections]
  );

  const handleUnitTypeChange = useCallback(
    (newType: SystemdUnit['unitType']) => {
      const defaultSections = DEFAULT_SECTIONS[newType] || ['Unit', 'Install'];
      onChange({
        ...state,
        unitType: newType,
        sections: defaultSections.map((name) => ({
          name,
          fields: [],
        })),
      });
    },
    [state, onChange]
  );

  const handleUnitNameChange = useCallback(
    (name: string) => {
      onChange({ ...state, unitName: name });
    },
    [state, onChange]
  );

  const updateSection = useCallback(
    (index: number, section: UnitSection) => {
      const newSections = [...state.sections];
      newSections[index] = section;
      onChange({ ...state, sections: newSections });
    },
    [state, onChange]
  );

  const updateSectionName = useCallback(
    (index: number, name: string) => {
      const newSections = [...state.sections];
      newSections[index] = { ...newSections[index], name } as UnitSection;
      onChange({ ...state, sections: newSections });
    },
    [state, onChange]
  );

  const addSection = useCallback(
    (afterIndex: number) => {
      const newSections: UnitSection[] = [...state.sections];
      newSections.splice(afterIndex + 1, 0, { name: 'Unit' as const, fields: [] });
      onChange({ ...state, sections: newSections });
    },
    [state, onChange]
  );

  const removeSection = useCallback(
    (index: number) => {
      if (state.sections.length <= 1) return;
      const newSections = state.sections.filter((_, i) => i !== index);
      onChange({ ...state, sections: newSections });
    },
    [state, onChange]
  );

  const moveSection = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= state.sections.length) return;
      const newSections = [...state.sections];
      const [moved] = newSections.splice(from, 1);
      if (!moved) return;
      newSections.splice(to, 0, moved);
      onChange({ ...state, sections: newSections });
    },
    [state, onChange]
  );

  const clearAllFields = useCallback(() => {
    const emptySections = state.sections.map((s) => ({
      ...s,
      fields: [],
    }));
    onChange({ ...state, sections: emptySections });
  }, [state, onChange]);

  const loadPreset = useCallback(
    (preset: (typeof UNIT_PRESETS)[number]) => {
      onChange({
        unitType: preset.template.unitType,
        unitName: preset.template.unitName,
        sections: preset.template.sections.map((s) => ({
          name: s.name,
          fields: s.fields.map((f) => ({ ...f })),
        })),
      });
    },
    [onChange]
  );

  const handleCopy = useCallback(() => {
    const generated = generateUnitFile(state);
    navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [state]);

  const generated = generateUnitFile(state);

  return (
    <div className="systemd-canvas" role="application" aria-label="systemd Unit Builder canvas">
      {/* Unit Metadata */}
      <div className="unit-metadata">
        <div className="metadata-row">
          <label className="metadata-label" htmlFor="unit-type">
            Unit Type
          </label>
          <select
            id="unit-type"
            className="metadata-select"
            value={state.unitType}
            onChange={(e) => handleUnitTypeChange(e.target.value as SystemdUnit['unitType'])}
          >
            {Object.entries(UNIT_TYPE_DESCRIPTIONS).map(([type, desc]) => (
              <option key={type} value={type}>
                {type} — {desc}
              </option>
            ))}
          </select>
        </div>

        <div className="metadata-row">
          <label className="metadata-label" htmlFor="unit-name">
            Unit Name
          </label>
          <input
            id="unit-name"
            className="metadata-input"
            type="text"
            value={state.unitName}
            onChange={(e) => handleUnitNameChange(e.target.value)}
            placeholder="my-service"
            spellCheck={false}
          />
          <span className="file-extension-hint">.{state.unitType}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button
          type="button"
          className="btn btn-sm btn-clear-all"
          onClick={clearAllFields}
          disabled={!hasAnyFields}
          aria-label="Clear all fields"
        >
          ✕ Clear All Fields
        </button>
      </div>

      {/* Quick Presets */}
      {!hasAnyFields && (
        <div className="presets-section">
          <span className="presets-label">Quick Start:</span>
          <div className="presets-list">
            {UNIT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="btn btn-preset"
                onClick={() => loadPreset(preset)}
                aria-label={`Load ${preset.name} preset`}
                title={preset.description}
              >
                <span className="preset-icon" aria-hidden="true">
                  {preset.icon}
                </span>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
            <button
              type="button"
              className="btn btn-preset btn-preset-blank"
              onClick={() => {
                onChange({
                  ...state,
                  sections: state.sections.map((s) => ({ ...s, fields: [] })),
                });
              }}
              aria-label="Start from scratch"
            >
              <span className="preset-icon" aria-hidden="true">
                📝
              </span>
              <span className="preset-name">Blank</span>
            </button>
          </div>
        </div>
      )}

      {/* Section Editors */}
      <div className="sections-list">
        {state.sections.map((section, i) => (
          <SectionFieldEditor
            key={`${section.name}-${i}`}
            section={section}
            sectionIndex={i}
            onUpdateSection={updateSection}
            onRemoveSection={removeSection}
            onAddSection={addSection}
            onMoveSection={moveSection}
            onUpdateSectionName={updateSectionName}
            sectionCount={state.sections.length}
          />
        ))}
      </div>

      {/* Add Section Button */}
      <div className="action-bar add-section-bar">
        <button
          type="button"
          className="btn btn-add-section"
          onClick={() => addSection(state.sections.length - 1)}
          aria-label="Add a new section"
        >
          + Add Section
        </button>
        <span className="add-section-hint">
          Type any systemd section name (e.g., Unit, Service, Install, Timer, Socket, Mount,
          Automount, Path, Target)
        </span>
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <button
          type="button"
          className="btn btn-preview-toggle"
          onClick={() => setPreviewOpen(!previewOpen)}
          aria-expanded={previewOpen}
        >
          {previewOpen ? '⊟ Hide Preview' : '⊞ Show Preview'}
        </button>

        {previewOpen && (
          <div className="unit-preview">
            <pre className="unit-output">{generated || '# (empty unit file)'}</pre>
            <button
              type="button"
              className="btn btn-copy"
              onClick={handleCopy}
              aria-label="Copy unit file to clipboard"
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
