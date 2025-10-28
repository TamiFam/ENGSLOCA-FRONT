import { useState, useEffect } from "react";

export default function WordModal({ isOpen, onClose, onSave, initialData }) {
  const [isClosing, setIsClosing] = useState(false);
  const [form, setForm] = useState({
    word: "",
    translation: "",
    partOfSpeech: "noun",
    category: "basic", // 
    transcriptionUK: "",
    transcriptionUS: "",
  });

  const partsOfSpeech = [
    { value: "noun", label: "📚 Сущ", title: "Существительное" },
    { value: "verb", label: "⚡ Гл", title: "Глагол" },
    { value: "adjective", label: "🎨 Прил", title: "Прилагательное" },
    { value: "adverb", label: "📊 Нар", title: "Наречие" },
  ];

  // const categories = [
  //   { value: "basic", label: "📖 Базовая лексика" },
  //   { value: "advanced", label: "🚀 Продвинутая" },
  //   { value: "business", label: "💼 Бизнес" },
  //   { value: "technical", label: "🔧 Техническая" },
  //   { value: "slang", label: "💬 Сленг" },
  // ];

  useEffect(() => {
    if (initialData) {
      setForm({
        word: initialData.word || "",
        translation: initialData.translation || "",
        partOfSpeech: initialData.partOfSpeech || "noun",
        category: initialData.category || "basic", // 👈 ДОБАВЬ
        transcriptionUK: initialData.transcriptionUK || "",
        transcriptionUS: initialData.transcriptionUS || "",
      });
    } else {
      // Сброс формы для нового слова
      setForm({
        word: "",
        translation: "",
        partOfSpeech: "noun",
        category: "basic", // 👈 ДОБАВЬ
        transcriptionUK: "",
        transcriptionUS: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = {
      word: form.word.trim(),
      translation: form.translation.trim(),
      partOfSpeech: form.partOfSpeech,
      category: form.category, // 👈 ДОБАВЬ
      transcriptionUK: form.transcriptionUK.trim() || undefined,
      transcriptionUS: form.transcriptionUS.trim() || undefined,
    };
    console.log('📤 Отправляемые данные:', cleanedData); // 👈 Для отладки
    onSave(cleanedData);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData ? "✏️ Редактировать" : "✨ Новое слово"}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Main Word Row */}
          <div className="flex gap-3">
            {/* Word Input */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Слово</label>
              <input
                value={form.word}
                onChange={(e) => setForm(prev => ({ ...prev, word: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="word"
                autoFocus
                required
              />
            </div>

            {/* Translation Input */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Перевод</label>
              <input
                value={form.translation}
                onChange={(e) => setForm(prev => ({ ...prev, translation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
                placeholder="translate"
                required
              />
            </div>
          </div>

          {/* Part of Speech & Category */}
          <div className="grid grid-cols-2 gap-3">
            {/* Part of Speech */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Часть речи</label>
              <div className="flex flex-col gap-1">
                {partsOfSpeech.map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, partOfSpeech: pos.value }))}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                      form.partOfSpeech === pos.value
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={pos.title}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            {/* <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Категория</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          {/* Transcriptions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">🇬🇧 UK</label>
              <input
                value={form.transcriptionUK}
                onChange={(e) => setForm(prev => ({ ...prev, transcriptionUK: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="/транскрипция/"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">🇺🇸 US</label>
              <input
                value={form.transcriptionUS}
                onChange={(e) => setForm(prev => ({ ...prev, transcriptionUS: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="/транскрипция/"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-2">Предпросмотр:</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">{form.word || "слово"}</div>
                <div className="text-sm text-gray-600">{form.translation || "перевод"}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-mono">
                  {form.transcriptionUK || form.transcriptionUS || "/.../"}
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {partsOfSpeech.find(p => p.value === form.partOfSpeech)?.title || "Часть речи"}
                </div>
                {/* <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mt-1">
                  {categories.find(c => c.value === form.category)?.label.split(' ')[1] || "Категория"}
                </div> */}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              {initialData ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}