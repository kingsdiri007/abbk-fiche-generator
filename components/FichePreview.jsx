
import React from 'react';

function getHeaderText({ type, audience }) {
  if (type === 'Formation') {
    return audience === 'Educational'
      ? 'FICHE PROGRAMME DE FORMATION ÉDUCATIVE'
      : "FICHE PROGRAMME D'UNE ACTION DE FORMATION";
  }
  return 'FICHE D\'INSTALLATION';
}

export default function FichePreview({ ficheData, editableFields, setEditableFields }) {
  const header = getHeaderText(ficheData);

  return (
    <div className="card fiche-preview">
      <h3>Preview</h3>
      <div className="pdf-card">
        <div className="pdf-header">
          <img src="/logo192.png" alt="ABBK" style={{width:80}} />
          <div>
            <strong>ABBK PhysicsWorks</strong>
            <div>{header}</div>
          </div>
        </div>

        <div className="pdf-body">
          <p><strong>Logiciel:</strong> {ficheData.software || '...'}</p>
          <p><strong>Type:</strong> {ficheData.type || '...'}</p>
          <p><strong>Audience:</strong> {ficheData.audience || '...'}</p>
          <p><strong>Certification:</strong> {ficheData.certification || '...'}</p>

          <hr />

          <label>
            Client:
            <input
              value={editableFields.client}
              onChange={(e) => setEditableFields({ ...editableFields, client: e.target.value })}
              placeholder="Client name"
            />
          </label>

          <label>
            Adresse:
            <input
              value={editableFields.address}
              onChange={(e) => setEditableFields({ ...editableFields, address: e.target.value })}
              placeholder="Adresse"
            />
          </label>

          <label>
            Observations:
            <textarea
              value={editableFields.observations}
              onChange={(e) => setEditableFields({ ...editableFields, observations: e.target.value })}
              placeholder="Observations"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
