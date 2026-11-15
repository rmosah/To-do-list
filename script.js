// جلب العناصر من الـ DOM
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// مصفوفة حفظ المهام
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// تشغيل التطبيق أول مرة
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
});

// إضافة مهمة جديدة
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text !== '') {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        todos.push(newTodo);
        saveAndRender();
        todoInput.value = '';
    }
});

// حفظ البيانات في LocalStorage وتحديث الشاشة
function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// عرض المهام وتحديث الإحصائيات
function renderTodos() {
    todoList.innerHTML = '';

    // تصفية المهام حسب الفلتر النشط
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // all
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<li class="empty-msg">لا توجد مهام في هذه القائمة حالياً.</li>`;
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                    <span class="todo-text">${escapeHTML(todo.text)}</span>
                </div>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            todoList.appendChild(li);
        });
    }

    // تحديث عدد المهام المتبقية غير المكتملة
    const activeCount = todos.filter(todo => !todo.completed).length;
    remainingCount.textContent = activeCount;
}

// تغيير حالة المهمة (مكتملة / غير مكتملة)
window.toggleTodo = function(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveAndRender();
};

// حذف مهمة واحدة
window.deleteTodo = function(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
};

// التبديل بين الفلاتر (الكل / النشطة / المكتملة)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// مسح كل المهام المكتملة
clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveAndRender();
});

// دالة حماية من نصوص HTML الخبيثة (XSS Protection)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}