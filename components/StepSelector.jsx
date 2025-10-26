
import React from 'react';

export default function StepSelector({ ficheData, setFicheData }) {
  const softwares = [
    'SOLIDWORKS',
    'ABAQUS',
    '3DEXPERIENCE',
    'AUTOCAD',
    'OTHER'
  ];

  const certifications = [
    'None',
    'CSWA',
    'CSWP',
    '3DEXPERIENCE CERT',
    'Custom'
  ];

  return (
    <div className="card">
      <h3>1. Choose Options</h3>
      <label>
        Software
        <select
          value={ficheData.software}
          onChange={(e) => setFicheData({ ...ficheData, software: e.target.value })}
        >
          <option value="">-- Select software --</option>
          {softwares.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Action Type
        <select
          value={ficheData.type}
          onChange={(e) => setFicheData({ ...ficheData, type: e.target.value })}
        >
          <option value="">-- Select type --</option>
          <option value="Formation">Formation</option>
          <option value="Installation">Installation</option>
        </select>
      </label>

      <label>
        Audience
        <select
          value={ficheData.audience}
          onChange={(e) => setFicheData({ ...ficheData, audience: e.target.value })}
        >
          <option value="">-- Select audience --</option>
          <option value="Educational">Educational</option>
          <option value="Industrial">Industrial</option>
        </select>
      </label>

      <label>
        Certification
        <select
          value={ficheData.certification}
          onChange={(e) => setFicheData({ ...ficheData, certification: e.target.value })}
        >
          {certifications.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
