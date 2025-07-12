import { isMobile,storage, randomInRange, formatPrice, playSound} from './utils.js';
import { renderInventory } from './inventory.js'; // Добавьте этот импорт
import itemsData from './prices2.js'; // Правильный импорт default-экспорта
// Данные кейсов и предметов
export const casesData = {
    "1": {
        name: "ВСЕ ИЛИ НИЧЕГО",
        image: "https://i.ibb.co/N2TB75Ls/2025-07-13-12-18-28-AM-Photoroom.png",
        items: [
            {
                "name": "M9 Bayonet Ancient",
                "chance": 0.1
            },
            {
                "name": "USP Line",
                "chance": 0.9
            },
        ]
    },
};
export function getItemData(itemName) {
    const item = itemsData[itemName];
    if (!item) {
        console.error(`Item not found: ${itemName}`);
        return {
            name: itemName.split('_')[1] || itemName,
            image: 'https://via.placeholder.com/150x150?text=Missing+Item',
            type: itemName.split('_')[0] || 'Unknown',
            price: 0
        };
    }
    return {
        name: itemName.split('_')[1] || itemName,
        image: item.image,
        type: itemName.split('_')[0],
        price: item.price
    };
}

// Рендер списка кейсов
export function renderCasesList() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'cases-container';

    for (const [id, caseData] of Object.entries(casesData)) {
        const caseElement = document.createElement('div');
        caseElement.className = 'case-item';
        caseElement.dataset.id = id;

        caseElement.innerHTML = `
            <img src="${caseData.image}" alt="${caseData.name}">
            <h3>${caseData.name}</h3>
        `;

        caseElement.addEventListener('click', () => renderCasePage(id));
        container.appendChild(caseElement);
    }

    app.appendChild(container);

    // Добавляем кнопку инвентаря
    const inventoryButton = document.createElement('button');
    inventoryButton.className = 'nav-button';
    inventoryButton.textContent = 'Инвентарь';
    inventoryButton.addEventListener('click', () => {
        renderInventory(); // Теперь функция доступна
    });
    document.body.appendChild(inventoryButton);
}

// Рендер страницы кейса
export function renderCasePage(caseId) {
    const caseData = casesData[caseId];
    if (!caseData) {
        console.error('Case not found:', caseId);
        return;
    }
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="case-page">
            <button class="back-button">← Назад</button>
            <h2>${caseData.name}</h2>
            
            <div class="roulette-container">
                <div class="center-pointer"></div>
                <div class="roulette" id="roulette"></div>
            </div>
            
            <button id="open-case">open ${formatPrice(getCasePrice(caseId))}</button>
            
            <h3>possible items:</h3>
            <div class="item-list" id="item-list"></div>
        </div>
    `;

    // Заполняем рулетку и список предметов
    const roulette = document.getElementById('roulette');
    const itemList = document.getElementById('item-list');

    caseData.items.forEach(item => {
        // Получаем полные данные о предмете
        const itemData = getItemData(item.name);
        
        // Добавляем в рулетку несколько копий каждого предмета
        for (let i = 0; i < 3; i++) {
            roulette.innerHTML += `
                <div class="roulette-item">
                    <img src="${itemData.image}" alt="${itemData.name}" 
                         onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
                </div>
            `;
        }

        // Добавляем в список предметов
        itemList.innerHTML += `
            <div class="item">
                <img src="${itemData.image}" alt="${itemData.name}"
                     onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
                <div class="item-info">
                    <p>${itemData.name}</p>
                    <p>${formatPrice(itemData.price)}</p>
                    <p>${(item.chance * 100).toFixed(2)}%</p>
                </div>
            </div>
        `;
    });

    // Обработчик кнопки "Назад"
    document.querySelector('.back-button').addEventListener('click', renderCasesList);

    // Обработчик кнопки "Открыть"
    document.getElementById('open-case').addEventListener('click', () => openCase(caseId));
}

// Получение цены кейса (можно настроить свою логику)
function getCasePrice(caseId) {
    if (!casesData[caseId] || !casesData[caseId].items) {
        console.error('Invalid case data for:', caseId);
        return 1.0; // Минимальная цена по умолчанию
    }

    const items = casesData[caseId].items;
    let expectedValue = 0;
    let validItemsCount = 0;

    items.forEach(item => {
        const itemData = getItemData(item.name);
        if (itemData && typeof itemData.price === 'number' && !isNaN(itemData.price)) {
            // Учитываем цену предмета, умноженную на его шанс
            expectedValue += itemData.price * item.chance;
            validItemsCount++;
        }
    });

    if (validItemsCount === 0) {
        console.warn('No valid items found for price calculation');
        return 1.0;
    }

    // Возвращаем 50-70% от математического ожидания
    return expectedValue * 0.8;
}

// В cases.js - обновлённая функция openCase
function openCase(caseId) {
    const caseData = casesData[caseId];
    const roulette = document.getElementById('roulette');
    const openButton = document.getElementById('open-case');
    
    openButton.disabled = true;
    openButton.textContent = 'opening...';

    // Выбираем случайный предмет с учетом шансов
    const random = Math.random();
    let accumulatedChance = 0;
    let selectedItem = null;

    for (const item of caseData.items) {
        const itemData = getItemData(item.name); // Получаем полные данные
        accumulatedChance += item.chance;
        if (random <= accumulatedChance) {
            selectedItem = {
                ...itemData,
                chance: item.chance
            };
            break;
        }
    }

    // Если предмет не выбран, берем первый
    if (!selectedItem) {
        selectedItem = {
            ...getItemData(caseData.items[0].name),
            chance: caseData.items[0].chance
        };
    }

    // Параметры рулетки
    const ITEM_WIDTH = 150;
    const ROLL_LENGTH = 50;
    const TARGET_INDEX = 25;
    const DURATION = 3000;
    function getRandomItemFromCase(caseData) {
        const randomIndex = Math.floor(Math.random() * caseData.items.length);
        return getItemData(caseData.items[randomIndex].name);
    }
    // Создаем рулетку
    roulette.innerHTML = '';
    for (let i = 0; i < ROLL_LENGTH; i++) {
        const item = (i === TARGET_INDEX || i === TARGET_INDEX - 1) ? selectedItem : getRandomItemFromCase(caseData);

        const itemElement = document.createElement('div');
        itemElement.className = 'roulette-item';
        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/150x150?text=No+Image'}" 
                 alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">

        `;
        roulette.appendChild(itemElement);
    }

    // 3. Анимация (точь-в-точь как в вашем примере)
    // const stopPosition = -(TARGET_INDEX * ITEM_WIDTH) + (ITEM_WIDTH * 2) + randomInRange(-10,80); // Центрируем
    const stopPosition = -(TARGET_INDEX * ITEM_WIDTH) + (ITEM_WIDTH * 2) + randomInRange(-10,10); // Центрируем
    let startTime = null;
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / DURATION, 1);
        const easing = 1 - Math.pow(1 - progress, 3);
        const currentPosition = stopPosition * easing;
        roulette.style.transform = `translateX(${currentPosition}px)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                if (!selectedItem) {
                    // Если предмет не выбран, создаем fallback
                    selectedItem = {
                        name: 'Unknown',
                        image: 'https://via.placeholder.com/150x150?text=No+Item',
                        type: 'Unknown',
                        price: 0
                    };
                }
                showResult(selectedItem);
                openButton.disabled = false;
                openButton.textContent = `open ${formatPrice(getCasePrice(caseId))}`;
            }, 300);
        }
    }

    // Запуск анимации (как в вашем примере)
    roulette.style.transition = 'none';
    roulette.style.transform = 'translateX(0)';
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 50);
}

// Показ результата открытия
function showResult(item) {
    if (item.price > 500){
        playSound('/sounds/win.mp3');
    }
    const modal = document.createElement('div');
    modal.className = 'result-modal';
    
    modal.innerHTML = `
        <div class="result-content">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Цена: ${formatPrice(item.price)}</p>
            <div class="result-buttons">
                <button id="sell-item">Продать за ${formatPrice(item.price * 0.9)}</button>
                <button id="keep-item">Оставить</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Обработчики кнопок
    document.getElementById('sell-item').addEventListener('click', () => {
        // Добавляем деньги
        const balance = storage.get('balance') || 0;
        storage.set('balance', balance + item.price * 0.9);
        modal.remove();
        document.getElementById('open-case').disabled = false;
        document.getElementById('open-case').textContent = `open ${formatPrice(getCasePrice(caseId))}`;
    });

    document.getElementById('keep-item').addEventListener('click', () => {
        // Добавляем предмет в инвентарь
        const inventory = storage.get('inventory') || [];
        inventory.push(item);
        storage.set('inventory', inventory);
        modal.remove();
        document.getElementById('open-case').disabled = false;
        document.getElementById('open-case').textContent = `open ${formatPrice(getCasePrice(caseId))}`;
    });
}