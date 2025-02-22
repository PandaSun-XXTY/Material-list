document.getElementById('addItem').addEventListener('click', function () {
    addItem();
});

document.getElementById('itemName').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addItem();
    }
});

document.getElementById('itemQuantity').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addItem();
    }
});

function addItem() {
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = document.getElementById('itemQuantity').value;

    if (itemName && itemQuantity) {
        addItemToList(itemName, itemQuantity);
        document.getElementById('itemName').value = '';
        document.getElementById('itemQuantity').value = '';
        document.getElementById('itemName').focus();
        sortList();
    }
}

document.getElementById('exportList').addEventListener('click', function () {
    const items = [];
    document.querySelectorAll('#itemList li').forEach(li => {
        const name = li.querySelector('span').textContent.split(' - ')[0];
        const quantity = li.querySelector('span').textContent.split(' - ')[1].replace('所需数量: ', '');
        const owned = li.querySelector('input').value || 0;
        items.push({ name, quantity, owned });
    });
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '材料列表.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('importButton').addEventListener('click', function () {
    document.getElementById('importList').click();
});

document.getElementById('importList').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const items = JSON.parse(e.target.result);
            items.forEach(item => addItemToList(item.name, item.quantity, item.owned));
            sortList();
        };
        reader.readAsText(file);
    }
});

function addItemToList(name, quantity, owned = 0) {
    const itemList = document.getElementById('itemList');
    const boxes = Math.floor(quantity / 1728);
    const groups = Math.floor((quantity % 1728) / 64);
    const items = quantity % 64;
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${name} - 所需数量: ${quantity} (${boxes}盒${groups}组${items}个)</span>
        <input type="number" min="0" value="${owned}" placeholder="已拥有" oninput="updateStatus(this)">
        <button onclick="removeItem(this)">删除</button>
    `;
    itemList.appendChild(li);
    updateStatus(li.querySelector('input'));

    // 添加悬停事件监听器
    li.querySelector('input').addEventListener('mouseover', showTooltip);
    li.querySelector('input').addEventListener('mouseout', hideTooltip);
}

function removeItem(button) {
    const li = button.parentElement;
    li.remove();
}

function updateStatus(input) {
    const li = input.parentElement;
    const required = parseInt(li.querySelector('span').textContent.split('所需数量: ')[1]);
    const owned = parseInt(input.value) || 0;
    if (owned >= required) {
        li.classList.add('completed');
        li.classList.remove('incomplete');
    } else {
        li.classList.add('incomplete');
        li.classList.remove('completed');
    }
}

function sortList() {
    const itemList = document.getElementById('itemList');
    const items = Array.from(itemList.children);
    items.sort((a, b) => {
        const aQuantity = parseInt(a.querySelector('span').textContent.split('所需数量: ')[1]);
        const bQuantity = parseInt(b.querySelector('span').textContent.split('所需数量: ')[1]);
        return aQuantity - bQuantity;
    });
    items.forEach(item => itemList.appendChild(item));
}

// 计算器功能
document.getElementById('calcButton').addEventListener('click', function () {
    const calcInput = document.getElementById('calcInput').value;
    try {
        const result = eval(calcInput);
        document.getElementById('calcResult').textContent = `结果: ${result}`;
    } catch (error) {
        document.getElementById('calcResult').textContent = '无效的表达式';
    }
});

// 快捷转换功能
function convert() {
    const boxes = parseInt(document.getElementById('boxInput').value) || 0;
    const groups = parseInt(document.getElementById('groupInput').value) || 0;
    const items = parseInt(document.getElementById('itemInput').value) || 0;
    const total = (boxes * 1728) + (groups * 64) + items;
    document.getElementById('convertResult').textContent = `转换结果: ${total} 个`;
}

document.getElementById('boxInput').addEventListener('input', convert);
document.getElementById('groupInput').addEventListener('input', convert);
document.getElementById('itemInput').addEventListener('input', convert);

document.getElementById('insertButton').addEventListener('click', function () {
    const total = document.getElementById('convertResult').textContent.split(' ')[2];
    document.getElementById('itemQuantity').value = total;
});

// 显示拆分结果的工具提示
function showTooltip(event) {
    const quantity = parseInt(event.target.value) || 0;
    const boxes = Math.floor(quantity / 1728);
    const groups = Math.floor((quantity % 1728) / 64);
    const items = quantity % 64;
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = `${boxes} 盒 ${groups} 组 ${items} 个`;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

document.getElementById('itemList').addEventListener('mouseover', function (event) {
    if (event.target.tagName === 'INPUT' && event.target.type === 'number') {
        showTooltip(event);
    }
});

document.getElementById('itemList').addEventListener('mouseout', function (event) {
    if (event.target.tagName === 'INPUT' && event.target.type === 'number') {
        hideTooltip(event);
    }
});

document.getElementById('itemQuantity').addEventListener('mouseover', showTooltip);
document.getElementById('itemQuantity').addEventListener('mouseout', hideTooltip);