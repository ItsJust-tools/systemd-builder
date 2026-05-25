'use client';

import { useCallback, useState } from 'react';
import type { SystemdUnit, UnitSection } from '../types';
import {
  generateUnitFile,
  UNIT_TYPE_DESCRIPTIONS,
  DEFAULT_SECTIONS,
  SECTION_FIELD_SUGGESTIONS,
  TYPE_OPTIONS,
  RESTART_OPTIONS,
} from '../types';

interface ToolCanvasProps {
  state: SystemdUnit;
  onChange: (state: SystemdUnit) => void;
}

function SectionFieldEditor({
  section,
  sectionIndex,
  onUpdateSection,
}: {
  section: UnitSection;
  sectionIndex: number;
  onUpdateSection: (index: number, section: UnitSection) => void;
}) {
  const suggestions = SECTION_FIELD_SUGGESTIONS[section.name] || [];

  const addField = useCallback(() => {
    const firstSuggestion = suggestions[0] || 'Key';
    const valueHint = section.name === 'Service' && firstSuggestion === 'ExecStart'
      ? '/usr/bin/'
      : 'value';
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

  return (
    <div className="systemd-section">
      <div className="section-header-row">
        <h3 className="section-title">[{section.name}]</h3>
        <button
          type="button"
          className="btn btn-sm btn-add-field"
          onClick={addField}
          aria-label={`Add field to ${section.name}`}
        >
          + Add Field
        </button>
      </div>

      {section.fields.length === 0 && (
        <p className="section-placeholder">No fields yet. Click &quot;+ Add Field&quot; to begin.</p>
      )}

      {section.fields.map((field, fieldIndex) => {
        const fieldSuggestions = suggestions.filter((s) => s !== field.key);
        return (
          <div key={fieldIndex} className="field-row">
            <div className="field-controls">
              <select
                className="field-key-select"
                value={field.key}
                onChange={(e) => updateField(fieldIndex, e.target.value, field.value)}
                aria-label={`Field name in ${section.name}`}
              >
                {[field.key, ...fieldSuggestions].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

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
                  placeholder="value"
                  aria-label={`Value for ${field.key}`}
                  spellCheck={false}
                />
              )}

              <button
                type="button"
                className="btn btn-remove-field"
                onClick={() => removeField(fieldIndex)}
                aria-label={`Remove ${field.key}`}
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
                {type}.{type} — {desc}
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
          <span className="file-extension-hint">
            .{state.unitType}
          </span>
        </div>
      </div>

      {/* Section Editors */}
      <div className="sections-list">
        {state.sections.map((section, i) => (
          <SectionFieldEditor
            key={`${section.name}-${i}`}
            section={section}
            sectionIndex={i}
            onUpdateSection={updateSection}
          />
        ))}
      </div>

      {/* Preview Toggle */}
      <div className="preview-section">
        <button
          type="button"
          className="btn btn-preview-toggle"
          onClick={() => setPreviewOpen(!previewOpen)}
        >
          {previewOpen ? 'Hide Preview' : 'Show Preview'}
        </button>

        {previewOpen && (
          <div className="unit-preview">
            <pre className="unit-output">{generated || '# (empty unit file)'}</pre>
            <button
              type="button"
              className="btn btn-copy"
              onClick={() => {
                navigator.clipboard.writeText(generated);
              }}
              aria-label="Copy unit file to clipboard"
            >
              📋 Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
