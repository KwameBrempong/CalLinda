class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.tasks = JSON.parse(localStorage.getItem('calinda-tasks')) || {};
        
        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
        this.updateTaskPanel();
    }

    initializeElements() {
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentMonthSpan = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.selectedDateSpan = document.getElementById('selectedDate');
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }

    renderCalendar() {
        this.calendarGrid.innerHTML = '';
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.currentMonthSpan.textContent = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDay.getDate();
            
            if (currentDay.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isSameDay(currentDay, today)) {
                dayElement.classList.add('today');
            }
            
            if (this.isSameDay(currentDay, this.selectedDate)) {
                dayElement.classList.add('selected');
            }

            const dateKey = this.getDateKey(currentDay);
            if (this.tasks[dateKey] && this.tasks[dateKey].length > 0) {
                const indicator = document.createElement('div');
                indicator.className = 'task-indicator';
                dayElement.appendChild(indicator);
            }
            
            dayElement.addEventListener('click', () => {
                this.selectDate(currentDay);
            });
            
            this.calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderCalendar();
        this.updateTaskPanel();
    }

    updateTaskPanel() {
        const dateKey = this.getDateKey(this.selectedDate);
        this.selectedDateSpan.textContent = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.taskList.innerHTML = '';
        const todayTasks = this.tasks[dateKey] || [];

        todayTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            if (task.completed) {
                taskText.classList.add('completed');
            }
            taskText.textContent = task.text;
            taskText.addEventListener('click', () => this.toggleTask(dateKey, index));
            
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteTask(dateKey, index));
            
            taskActions.appendChild(deleteBtn);
            taskItem.appendChild(taskText);
            taskItem.appendChild(taskActions);
            this.taskList.appendChild(taskItem);
        });
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        if (!taskText) return;

        const dateKey = this.getDateKey(this.selectedDate);
        if (!this.tasks[dateKey]) {
            this.tasks[dateKey] = [];
        }

        this.tasks[dateKey].push({
            text: taskText,
            completed: false,
            created: new Date().toISOString()
        });

        this.taskInput.value = '';
        this.saveTasks();
        this.renderCalendar();
        this.updateTaskPanel();
    }

    toggleTask(dateKey, index) {
        if (this.tasks[dateKey] && this.tasks[dateKey][index]) {
            this.tasks[dateKey][index].completed = !this.tasks[dateKey][index].completed;
            this.saveTasks();
            this.updateTaskPanel();
        }
    }

    deleteTask(dateKey, index) {
        if (this.tasks[dateKey] && this.tasks[dateKey][index]) {
            this.tasks[dateKey].splice(index, 1);
            if (this.tasks[dateKey].length === 0) {
                delete this.tasks[dateKey];
            }
            this.saveTasks();
            this.renderCalendar();
            this.updateTaskPanel();
        }
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    isSameDay(date1, date2) {
        return this.getDateKey(date1) === this.getDateKey(date2);
    }

    saveTasks() {
        localStorage.setItem('calinda-tasks', JSON.stringify(this.tasks));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});