import { useState, useEffect } from "react";
import Portal from "../../components/Portal";
import { useAuth } from "../../context/AuthContext";
import Toast from "../../components/Toast";

export default function WorldInfoModal({ isOpen, onClose, onSave, initialData }) {
  const Max_letters = 94;
  const Max_example = 3;
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  const [form, setForm] = useState({
    examples: [""],
    notes: ""
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.length > Max_letters) return;
    if (user.role === 'viewer') return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addExample = () => {
    if (form.examples.length < Max_example) {
      if (user.role === 'viewer') return;
      setForm(prev => ({
        ...prev,
        examples: [...prev.examples, ""]
      }));
    }
  };

  const removeExample = (index) => {
    if (user.role === 'viewer') return;
    setForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const handleExampleChange = (index, value) => {
    if (value.length < Max_letters) {
      setForm(prev => ({
        ...prev,
        examples: prev.examples.map((ex, i) => i === index ? value : ex)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.role === 'viewer') {
      return showToast('У вас нет прав для редактирования', 'error');
    }
    const cleanedData = {
      ...form,
      examples: form.examples.filter(ex => ex.trim() !== ""),
      notes: form.notes.trim()
    };
    onSave(cleanedData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen && !isClosing) return null;

  const filledExamples = form.examples.filter(ex => ex.trim() !== "").length;
  const isViewer = user.role === 'viewer';

  return (
    <Portal>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleOverlayClick}
      >
        {/* Modal Container */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-200 ${
            isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white ">
            <div className="flex items-center gap-3 ">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 ">
                {initialData.word}
              </h2>
            </div>
            
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 font-mono text-lg"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Examples Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                    <span className="text-sm">💬</span>
                  </div>
                  Примеры использования
                </label>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                  {filledExamples} / {Max_example}
                </span>
              </div>
              
              <div className="space-y-3">
                {form.examples.map((example, index) => (
                  <div key={index} className="flex gap-2 group relative">
                    <div className="flex-1 relative">
                      <input
                        value={example}
                        onChange={(e) => handleExampleChange(index, e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isViewer 
                            ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Введите пример использования..."
                        disabled={isViewer}
                      />
                      {example.length > 0 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs text-gray-400 bg-white px-1">
                            {example.length}/{Max_letters}
                          </span>
                        </div>
                      )}
                    </div>
                    {form.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className={`w-12 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                          isViewer
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 transform hover:scale-105'
                        }`}
                        disabled={isViewer}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {form.examples.length < Max_example && (
                <button
                  type="button"
                  onClick={addExample}
                  className={`w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-xl transition-all duration-200 ${
                    isViewer
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                  }`}
                  disabled={isViewer}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Добавить пример
                </button>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-sm">📝</span>
                </div>
                Дополнительные заметки
              </label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-gray-900 font-medium resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isViewer
                      ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Введите дополнительные заметки..."
                  disabled={isViewer}
                />
                {form.notes.length > 0 && (
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs text-gray-400 bg-white px-1">
                      {form.notes.length}/{Max_letters}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Отмена
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isViewer
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                }`}
                disabled={isViewer}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12l5 5L20 7"/>
                </svg>
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </Portal>
  );
}