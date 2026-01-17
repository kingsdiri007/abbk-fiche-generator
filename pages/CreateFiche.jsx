import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { generatePDF } from "../components/PdfGenerator";
import { saveFicheToFirebase } from "../components/SaveToFirebase";
import logoImg from "../assets/logoImg.jpg";

export default function CreateFiche() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    software: "",
    type: "",
    subType: "",
    certification: "",
    clientName: "",
    address: "",
    phone: "",
    id: "",
    interventionNature: "",
    referenceBC: "",
    licenses: [{ name: "", quantity: "", serial: "", invoice: "" }],
    intervenant: "",
    interventionDate: "",
    observations: "",
    location: "",
    clientRemarks: "",
  });

  const softwares = [
    { id: "solidworks", name: "SolidWorks", icon: "🔷" },
    { id: "3dexperience", name: "3DExperience", icon: "🌐" },
    { id: "abaqus", name: "Abaqus", icon: "⚙️" },
    { id: "mastercam", name: "MasterCAM", icon: "🔧" },
  ];

  const certifications = [
    "CSWA",
    "CSWP",
    "CSWE",
    "CSWPA-SD",
    "3DEXPERIENCE Certified",
    "Abaqus Certified",
    "MasterCAM Certified",
    "Custom Certification",
  ];

  const goNext = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const goBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const addLicense = () => {
    setFormData({
      ...formData,
      licenses: [
        ...formData.licenses,
        { name: "", quantity: "", serial: "", invoice: "" },
      ],
    });
  };

  const updateLicense = (index, field, value) => {
    const updated = [...formData.licenses];
    updated[index][field] = value;
    setFormData({ ...formData, licenses: updated });
  };

  const handleGeneratePDF = async () => {
    try {
      const { pdfBlob, save } = generatePDF(formData, {}, logoImg);
      save(); // download locally
      await saveFicheToFirebase(pdfBlob, formData, {});
      alert("✅ PDF generated and saved to Firebase");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ABBK PhysicsWorks
              </h1>
              <p className="text-sm text-gray-500">Fiche Generator</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          {["Software", "Type", "Certification", "Preview"].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep > idx + 1
                    ? "bg-green-500 text-white"
                    : currentStep === idx + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {currentStep > idx + 1 ? "✓" : idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {label}
              </span>
              {idx < 3 && <div className="w-16 h-1 bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStep === 1 && (
          <Step1Software
            formData={formData}
            setFormData={setFormData}
            softwares={softwares}
          />
        )}
        {currentStep === 2 && (
          <Step2Type formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 3 && (
          <Step3Certification
            formData={formData}
            setFormData={setFormData}
            certifications={certifications}
            addLicense={addLicense}
            updateLicense={updateLicense}
          />
        )}
        {currentStep === 4 && <Step4Preview formData={formData} />}

        {/* NAV BUTTONS */}
        <div className="flex justify-between mt-8">
          <button
            onClick={goBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              <Download size={20} />
              Generate PDF
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

/* ===============================
   STEP COMPONENTS (reuse from example)
================================*/
function Step1Software({ formData, setFormData, softwares }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">SOFTWARE</h2>
        {softwares.map((sw) => (
          <button
            key={sw.id}
            onClick={() => setFormData({ ...formData, software: sw.id })}
            className={`w-full p-6 rounded-xl text-left transition-all ${
              formData.software === sw.id
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sw.icon}</span>
              <span className="text-xl font-semibold">{sw.name}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="col-span-8 bg-white rounded-xl shadow-lg p-8">
        {formData.software ? (
          <p className="text-lg font-semibold text-blue-700">
            {softwares.find((s) => s.id === formData.software)?.name} selected.
          </p>
        ) : (
          <p className="text-gray-400 text-center">Select a software.</p>
        )}
      </div>
    </div>
  );
}
// Step 2: Type Selection
function Step2Type({ formData, setFormData }) {
  const [typeCategory, setTypeCategory] = useState("audience"); // 'audience' or 'standard'

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">TYPE</h2>

        <div className="space-y-2 mb-6">
          <button
            onClick={() => setTypeCategory("audience")}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
              typeCategory === "audience"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Audience Type
          </button>
          <button
            onClick={() => setTypeCategory("standard")}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${
              typeCategory === "standard"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Service Type
          </button>
        </div>

        {typeCategory === "audience" ? (
          <>
            <button
              onClick={() => setFormData({ ...formData, type: "educational" })}
              className={`w-full p-6 rounded-xl text-left transition-all ${
                formData.type === "educational"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <span className="text-xl font-semibold">Educational</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: "industrial" })}
              className={`w-full p-6 rounded-xl text-left transition-all ${
                formData.type === "industrial"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <span className="text-xl font-semibold">Industrial</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setFormData({ ...formData, subType: "installation" })}
              className={`w-full p-6 rounded-xl text-left transition-all ${
                formData.subType === "installation"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <span className="text-xl font-semibold">Installation</span>
            </button>
            <button
              onClick={() => setFormData({ ...formData, subType: "formation" })}
              className={`w-full p-6 rounded-xl text-left transition-all ${
                formData.subType === "formation"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <span className="text-xl font-semibold">Formation</span>
            </button>
          </>
        )}
      </div>

      <div className="col-span-8 bg-white rounded-xl shadow-lg p-8">
        {(formData.type || formData.subType) ? (
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-900">
              Type selected: {formData.type || formData.subType}
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Proceed to certification details
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>Select a type to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3: Certification & Details
function Step3Certification({ formData, setFormData, certifications, addLicense, updateLicense }) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-3">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Certification</h2>
        <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
          {certifications.map((cert) => (
            <button
              key={cert}
              onClick={() => setFormData({ ...formData, certification: cert })}
              className={`w-full p-4 rounded-lg text-left transition-all text-sm ${
                formData.certification === cert
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border"
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-9 bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 pb-4 border-b">
          <h3 className="text-lg font-bold text-gray-600">Certification sélectionnée</h3>
          <p className="text-xl font-semibold text-blue-600 mt-1">
            {formData.certification || "None selected"}
          </p>
        </div>

        <h3 className="text-xl font-bold text-gray-400 mb-6">Détails Client</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nom du client"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="text"
          placeholder="Adresse"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Nature de l'intervention"
          value={formData.interventionNature}
          onChange={(e) => setFormData({ ...formData, interventionNature: e.target.value })}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Référence"
            value={formData.referenceBC}
            onChange={(e) => setFormData({ ...formData, referenceBC: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.interventionDate}
            onChange={(e) => setFormData({ ...formData, interventionDate: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <h4 className="font-semibold text-gray-700 mb-3">Licenses</h4>
        {formData.licenses.map((license, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
            <input
              type="text"
              placeholder="License"
              value={license.name}
              onChange={(e) => updateLicense(idx, "name", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Qty"
              value={license.quantity}
              onChange={(e) => updateLicense(idx, "quantity", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Serial #"
              value={license.serial}
              onChange={(e) => updateLicense(idx, "serial", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Invoice #"
              value={license.invoice}
              onChange={(e) => updateLicense(idx, "invoice", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ))}
        <button
          onClick={addLicense}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
        >
          + Add License
        </button>

        <input
          type="text"
          placeholder="Intervenant"
          value={formData.intervenant}
          onChange={(e) => setFormData({ ...formData, intervenant: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mt-6 mb-4 focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Lieu (Fait à)"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

// Step 4: Preview
function Step4Preview({ formData }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg mb-6">
        <h2 className="text-3xl font-bold text-center">Aperçu de la Fiche</h2>
      </div>

      <div className="border-t-2 border-b-2 border-gray-800 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoImg} alt="ABBK Logo" className="w-16 h-16 object-contain rounded" />
            <div>
              <h3 className="text-xl font-bold">ABBK PhysicsWorks</h3>
              <p className="text-sm text-gray-600">Fiche d’Intervention</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Cyberparc Régional, 3200, Tataouine</p>
            <p>4ème Étage, Technopôle El Ghazela</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p><strong>Client:</strong> {formData.clientName || "_______________"}</p>
        <p><strong>Adresse:</strong> {formData.address || "_______________"}</p>
        <p><strong>Nature de l’intervention:</strong> {formData.interventionNature || "_______________"}</p>
        <p><strong>Référence:</strong> {formData.referenceBC || "_______________"}</p>
      </div>

      {formData.licenses.length > 0 && formData.licenses[0].name && (
        <div className="mt-6">
          <p className="font-semibold mb-2">Licenses:</p>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Nom</th>
                <th className="border p-2">Qté</th>
                <th className="border p-2 text-left">N° Série</th>
                <th className="border p-2 text-left">Facture</th>
              </tr>
            </thead>
            <tbody>
              {formData.licenses.map((lic, idx) =>
                lic.name ? (
                  <tr key={idx}>
                    <td className="border p-2">{lic.name}</td>
                    <td className="border p-2 text-center">{lic.quantity}</td>
                    <td className="border p-2">{lic.serial}</td>
                    <td className="border p-2">{lic.invoice}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-sm">
        <p><strong>Fait à:</strong> {formData.location || "_______________"}</p>
        <p><strong>Remarques client:</strong> {formData.clientRemarks || "_______________"}</p>
        <p><strong>Date:</strong> {formData.interventionDate || "_______________"}</p>
      </div>

      <div className="bg-gray-800 text-white text-center p-4 mt-8 rounded-b-lg">
        <p>© 2024 ABBK PhysicsWorks. Tous droits réservés.</p>
      </div>
    </div>
  );
}
