
import React from 'react';
import { useFormContext } from '../context/FormContext';
import { Plus, Trash2 } from 'lucide-react';

export default function FormationSchedule() {
  const { formData, updateFormData } = useFormContext();

  const addScheduleDay = () => {
    const newSchedule = [...(formData.schedule || []), {
      day: `J${(formData.schedule || []).length + 1}`,
      content: '',
      methods: '',
      theoryHours: '',
      practiceHours: ''
    }];
    updateFormData({ schedule: newSchedule });
  };

  const removeScheduleDay = (index) => {
    const newSchedule = (formData.schedule || []).filter((_, i) => i !== index);
    updateFormData({ schedule: newSchedule });
  };

  const updateScheduleDay = (index, field, value) => {
    const newSchedule = [...(formData.schedule || [])];
    newSchedule[index][field] = value;
    updateFormData({ schedule: newSchedule });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700">Programme de Formation</h4>
        <button
          onClick={addScheduleDay}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
        >
          <Plus size={16} />
          Add Day
        </button>
      </div>

      {/* Schedule Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-16">Jour</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Contenu</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Méthodes</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-24">Théorie (h)</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-24">Pratique (h)</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {(formData.schedule || [{ day: 'J1', content: '', methods: '', theoryHours: '', practiceHours: '' }]).map((day, index) => (
              <tr key={index} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={day.day}
                    onChange={(e) => updateScheduleDay(index, 'day', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="J1"
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={day.content}
                    onChange={(e) => updateScheduleDay(index, 'content', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="Contenu du cours"
                    rows="2"
                  />
                </td>
                <td className="px-3 py-2">
                  <textarea
                    value={day.methods}
                    onChange={(e) => updateScheduleDay(index, 'methods', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="Méthodes pédagogiques"
                    rows="2"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={day.theoryHours}
                    onChange={(e) => updateScheduleDay(index, 'theoryHours', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="6"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={day.practiceHours}
                    onChange={(e) => updateScheduleDay(index, 'practiceHours', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2">
                  {(formData.schedule || []).length > 1 && (
                    <button
                      onClick={() => removeScheduleDay(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Hours Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Total Théorie: </span>
            <span className="text-gray-900">
              {(formData.schedule || []).reduce((sum, day) => sum + (parseFloat(day.theoryHours) || 0), 0)}h
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Total Pratique: </span>
            <span className="text-gray-900">
              {(formData.schedule || []).reduce((sum, day) => sum + (parseFloat(day.practiceHours) || 0), 0)}h
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Total Général: </span>
            <span className="text-gray-900 font-bold">
              {(formData.schedule || []).reduce((sum, day) => 
                sum + (parseFloat(day.theoryHours) || 0) + (parseFloat(day.practiceHours) || 0), 0
              )}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}