import CryptoJS from 'crypto-js';

// Секретный ключ — можно хранить в ENV или генерировать динамически
const SECRET_KEY = 'my-secret-key-123!'; // ⚠️ не хранить прямо в публичном коде для продакшена

export const saveEncryptedMessages = (chatId, messages) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(messages), SECRET_KEY).toString();
  localStorage.setItem(`chat_${chatId}`, ciphertext);
};

export const getEncryptedMessages = (chatId) => {
  try {
    const ciphertext = localStorage.getItem(`chat_${chatId}`);
    if (!ciphertext) return [];
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting messages', error);
    return [];
  }
};
