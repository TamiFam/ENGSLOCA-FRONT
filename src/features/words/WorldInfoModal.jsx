import { useState, useEffect } from "react";
import Portal from "../../components/Portal";

export default function WorldInfoModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    examples: [""],
    notes: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        examples: initialData.examples?.length > 0 ? initialData.examples : [""],
        notes: initialData.notes || "",
      });
    } else {
      setForm({
        examples: [""],
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addExample = () => {
    setForm(prev => ({
      ...prev,
      examples: [...prev.examples, ""]
    }));
  };

  const removeExample = (index) => {
    setForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleExampleChange = (index, value) => {
    setForm(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cleanedData = {
      ...form,
      examples: form.examples.filter(ex => ex.trim() !== ""),
      notes: form.notes.trim()
    };
    
    onSave(cleanedData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white border-4 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto relative mx-2 sm:mx-4">
          {/* Декоративные угловые элементы */}
          <div className="absolute -top-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
          <div className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>
          <div className="absolute -bottom-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-black"></div>

          {/* Заголовок */}
          <div className="bg-black border-b-4 border-black px-4 sm:px-6 py-3 sm:py-4 relative">
            <h2 className="text-lg sm:text-xl font-black text-white text-center pr-8 sm:pr-0">
              {initialData ? `✏️ ${initialData.word}` : "НОВОЕ СЛОВО"}
            </h2>
            
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white text-black border-2 border-black flex items-center justify-center font-black hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Поле для примеров использования */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-black text-black">
                  💬 Примеры
                </label>
                <span className="text-xs text-gray-500">
                  {form.examples.filter(ex => ex.trim() !== "").length} из {form.examples.length}
                </span>
              </div>
              
              {form.examples.map((example, index) => (
                <div key={index} className="flex gap-2 group">
                  <input
                    value={example}
                    onChange={(e) => handleExampleChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-50"
                    placeholder="Пример использования..."
                  />
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="w-10 bg-red-500 text-white border-2 border-black font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить пример"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addExample}
                className="w-full bg-gray-100 text-black px-4 py-2 border-2 border-black font-bold hover:bg-gray-200 transition-colors"
              >
                + Добавить пример
              </button>
            </div>

            {/* Поле для заметок */}
            <div className="space-y-3">
              <label className="block text-sm font-black text-black">
                📝 Заметки
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-50 resize-none"
                placeholder="Дополнительные заметки..."
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-black px-4 py-3 border-2 border-black font-bold hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white px-4 py-3 border-2 border-black font-bold hover:bg-white hover:text-black transition-colors"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}