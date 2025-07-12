import { storage, formatPrice } from './utils.js';
import { renderCasesList } from './cases.js';

// Рендер инвентаря
export function renderInventory() {
    const app = document.getElementById('app');
    const inventory = storage.get('inventory') || [];
    
    app.innerHTML = `
        <button class="back-button">Назад</button>
        <h2>инвентарь</h2>
        <p>Баланс: ${formatPrice(storage.get('balance') || 0)}</p>
        <div class="inventory-container" id="inventory-container"></div>
    `;

    const container = document.getElementById('inventory-container');

    if (inventory.length === 0) {
        container.innerHTML = '<p>Ваш инвентарь пуст</p>';
    } else {
        inventory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.dataset.index = index;
            
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Цена: ${formatPrice(item.price)}$</p>
                <button class="sell-btn">Продать</button>
            `;

            // Обработчик кнопки продажи
            itemElement.querySelector('.sell-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                sellItem(index);
            });

            container.appendChild(itemElement);
        });
    }

    // Обработчик кнопки "Назад"
    document.querySelector('.back-button').addEventListener('click', renderCasesList);
}

// Продажа предмета из инвентаря
function sellItem(index) {
    const inventory = storage.get('inventory') || [];
    if (index >= 0 && index < inventory.length) {
        const item = inventory[index];
        const balance = storage.get('balance') || 0;
        
        storage.set('balance', balance + item.price * 0.7);
        inventory.splice(index, 1);
        storage.set('inventory', inventory);
        
        renderInventory();
    }
}