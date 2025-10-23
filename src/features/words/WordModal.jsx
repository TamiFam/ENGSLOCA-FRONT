import { useState, useEffect } from "react";

export default function WordModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    word: "",
    translation: "",
    partOfSpeech: "noun",
    category: "basic",
    transcriptionUK: "",
    transcriptionUS: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        word: initialData.word || "",
        translation: initialData.translation || "",
        partOfSpeech: initialData.partOfSpeech || "noun",
        category: initialData.category || "basic",
        transcriptionUK: initialData.transcriptionUK || "",
        transcriptionUS: initialData.transcriptionUS || "",
      });
    } else {
      setForm({
        word: "",
        translation: "",
        partOfSpeech: "noun",
        category: "basic",
        transcriptionUK: "",
        transcriptionUS: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const cleanedData = {
      word: form.word.trim(),
      translation: form.translation.trim(),
      partOfSpeech: form.partOfSpeech || "noun",
      category: form.category || "basic",
      transcriptionUK: form.transcriptionUK.trim() || undefined,
      transcriptionUS: form.transcriptionUS.trim() || undefined,
    };
    
    onSave(cleanedData);
  };

  // Закрытие по клику на оверлей
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Закрытие по Escape
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

        {/* Заголовок с кнопкой закрытия */}
        <div className="bg-black border-b-4 border-black px-4 sm:px-6 py-3 sm:py-4 relative">
          <h2 className="text-lg sm:text-xl font-black text-white text-center pr-8 sm:pr-0">
            {initialData ? "РЕДАКТИРОВАТЬ СЛОВО" : "НОВОЕ СЛОВО"}
          </h2>
          
          {/* Кнопка закрытия для мобильных */}
          <button
            onClick={onClose}
            className="absolute right-3 top-10 transform -translate-y-1/2 sm:hidden w-8 h-8 bg-white text-black border-2 border-black flex items-center justify-center font-black"
          >
            ✕
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Обязательные поля */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-black">
              СЛОВО *
            </label>
            <input
              name="word"
              value={form.word}
              onChange={handleChange}
              className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm"
              required
              autoFocus
              placeholder="Введите слово на английском"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-black">
              ПЕРЕВОД *
            </label>
            <input
              name="translation"
              value={form.translation}
              onChange={handleChange}
              className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm"
              required
              placeholder="Введите перевод на русский"
            />
          </div>

          {/* Часть речи с селектом */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-black">
              ЧАСТЬ РЕЧИ
            </label>
            <select
              name="partOfSpeech"
              value={form.partOfSpeech}
              onChange={handleChange}
              className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm appearance-none"
            >
              <option value="noun">СУЩЕСТВИТЕЛЬНОЕ</option>
              <option value="verb">ГЛАГОЛ</option>
              <option value="adjective">ПРИЛАГАТЕЛЬНОЕ</option>
              <option value="adverb">НАРЕЧИЕ</option>
              <option value="preposition">ПРЕДЛОГ</option>
              <option value="conjunction">СОЮЗ</option>
              <option value="interjection">МЕЖДОМЕТИЕ</option>
            </select>
          </div>

          {/* Категория */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-black">
              КАТЕГОРИЯ
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm"
              placeholder="basic, advanced, business..."
            />
          </div>

          {/* Транскрипции - вертикально на мобильных */}
          <div className="space-y-4 sm:space-y-3">
            <label className="block text-sm font-black text-black">
              ТРАНСКРИПЦИИ
            </label>
            
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600">
                  БРИТАНСКАЯ (UK)
                </label>
                <input
                  name="transcriptionUK"
                  value={form.transcriptionUK}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm"
                  placeholder="/trænˈskrɪp.ʃən/"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-600">
                  АМЕРИКАНСКАЯ (US)
                </label>
                <input
                  name="transcriptionUS"
                  value={form.transcriptionUS}
                  onChange={handleChange}
                  className="w-full px-3 py-3 sm:py-2 border-2 border-black text-black font-bold bg-white focus:outline-none focus:bg-yellow-100 text-base sm:text-sm"
                  placeholder="/trænˈskrɪp.ʃən/"
                />
              </div>
            </div>
          </div>

          {/* Подсказка про обязательные поля */}
          <div className="bg-gray-100 border-2 border-gray-300 p-3">
            <p className="text-xs text-gray-600 text-center">
              * Поля обязательные для заполнения
            </p>
          </div>

          {/* Кнопки - вертикально на мобильных */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-3 sm:py-2 bg-white text-black border-2 border-black font-black hover:bg-black hover:text-white transition-all duration-200 text-base sm:text-sm order-2 sm:order-1"
            >
              ОТМЕНА
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-3 sm:py-2 bg-black text-white border-2 border-black font-black hover:bg-white hover:text-black transition-all duration-200 text-base sm:text-sm order-1 sm:order-2"
            >
              {initialData ? "СОХРАНИТЬ" : "ДОБАВИТЬ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}