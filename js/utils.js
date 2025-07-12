// Утилиты для работы с localStorage
const storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Генерация случайного числа в диапазоне
const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
};

// Форматирование числа с двумя знаками после запятой
const formatPrice = (price) => {
    // Проверяем, что price существует и является числом
    if (typeof price !== 'number' || isNaN(price)) {
        console.warn('Invalid price value:', price);
        return '0.00 G';
    }
    return price.toFixed(2) + 'G';
};
// utils.js
export function playSound(soundFile, volume = 0.7) {
    try {
        const audio = new Audio(soundFile);
        audio.volume = volume;
        audio.play().catch(e => console.warn('Audio play failed:', e));
        return audio;
    } catch (e) {
        console.error('Sound error:', e);
        return null;
    }
}
export function isMobile() {
    return window.innerWidth <= 768; // Стандартный breakpoint для мобильных
  }
export { storage, randomInRange, formatPrice };