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

    // 创建主要显示内容
    const mainContent = document.createElement('span');
    mainContent.textContent = `${name} - ${quantity}`;
    mainContent.classList.add('main-content');

    // 创建悬停提示内容
    const tooltipContent = document.createElement('span');
    tooltipContent.textContent = `${boxes}盒${groups}组${items}个`;
    tooltipContent.classList.add('tooltip-content');

    // 将内容添加到列表项
    li.appendChild(mainContent);
    li.appendChild(tooltipContent);

    // 添加输入框和删除按钮
    li.innerHTML += `
        <input type="number" min="0" value="${owned}" placeholder="已拥有" oninput="updateStatus(this)">
        <button onclick="removeItem(this)">删除</button>
    `;

    itemList.appendChild(li);
    updateStatus(li.querySelector('input'));

    // 添加悬停事件监听器
    li.addEventListener('mouseover', function () {
        tooltipContent.style.display = 'inline';
    });
    li.addEventListener('mouseout', function () {
        tooltipContent.style.display = 'none';
    });
}

function removeItem(button) {
    const li = button.parentElement;
    li.remove();
}

function updateStatus(input) {
    const li = input.parentElement;
    const required = parseInt(li.querySelector('span').textContent.split(' - ')[1]);
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
        const aQuantity = parseInt(a.querySelector('span').textContent.split(' - ')[1]);
        const bQuantity = parseInt(b.querySelector('span').textContent.split(' - ')[1]);
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

// 插入转换结果到所需数量
document.getElementById('insertConvertedValue').addEventListener('click', function () {
    const convertResult = document.getElementById('convertResult').textContent;
    const totalItems = convertResult.match(/\d+/); // 提取转换结果中的数字
    if (totalItems) {
        document.getElementById('itemQuantity').value = totalItems[0];
    }
});
