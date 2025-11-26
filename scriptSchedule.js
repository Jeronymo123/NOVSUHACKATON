// scriptSchedule.js
let currentWeekOffset = 0;
let scheduleData = null;
let currentUser = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    await loadUserProfile();
    setupEventListeners();
    updateWeekDisplay();
    loadScheduleData();
}

function setupEventListeners() {
    document.getElementById('prevWeekBtn').onclick = () => changeWeek(-1);
    document.getElementById('nextWeekBtn').onclick = () => changeWeek(1);
    document.getElementById('todayBtn').onclick = resetToCurrentWeek;
    document.getElementById('refreshBtn').onclick = loadScheduleData;
    document.getElementById("Logout").onclick = Logout;
    
    // Обработчики для модального окна редактирования
    document.getElementById('editScheduleBtn').onclick = openEditModal;
    document.getElementById('closeModal').onclick = closeEditModal;
    document.getElementById('cancelEdit').onclick = closeEditModal;
    document.getElementById('saveSchedule').onclick = saveScheduleChanges;
}

async function loadUserProfile() {
    try {
        const response = await fetch("/profile", { credentials: "include" });
        const res = await response.json();

        if (res.status === "ok") {
            currentUser = res.user;
            
            const userName = currentUser.Surname + " " + currentUser.Name;
            document.querySelectorAll("#NameProfile").forEach(item => {
                item.textContent = userName;
            });
            
            // Показываем кнопку редактирования только для преподавателей
            if (currentUser.Role === "Преподаватель") {
                document.getElementById('editScheduleBtn').style.display = 'flex';
            }
            
        } else {
            window.location.href = "entry_form.html";
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        useDemoStudentData();
    }
}

function useDemoStudentData() {
    currentUser = {
        id: 'student1',
        Name: 'Сергей',
        Surname: 'Петров',
        Group: '5092',
        Role: 'Студент'
    };
    
    document.querySelectorAll("#NameProfile").forEach(item => {
        item.textContent = currentUser.Surname + " " + currentUser.Name;
    });
}

function resetToCurrentWeek() {
    currentWeekOffset = 0;
    updateWeekDisplay();
    loadScheduleData();
}

async function Logout() {
    const response = await fetch("/logout", { method: "POST", credentials: "include" });
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

// Загрузка данных расписания
async function loadScheduleData() {
    const scheduleTable = document.getElementById('scheduleTable');
    if (!scheduleTable) return;
    
    try {
        scheduleTable.innerHTML = `
            <div class="empty-schedule">
                <i class="fas fa-spinner fa-spin"></i>
                <h3>Загрузка расписания...</h3>
                <p>Пожалуйста, подождите</p>
            </div>
        `;

        scheduleData = await loadScheduleFromJSON();
        
    } catch (error) {
        console.log('Используются встроенные данные расписания');
        scheduleData = getBuiltInScheduleData();
    }
    
    try {
        const userSchedule = generateUserSchedule();
        renderSchedule(userSchedule);
    } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        scheduleTable.innerHTML = `
            <div class="empty-schedule">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки расписания</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function loadScheduleFromJSON() {
    try {
        let scheduleFile = 'data/schedule.json';
        
        if (currentUser?.Role === "Преподаватель") {
            scheduleFile = 'data/schedule_math.json';
        }
        
        const response = await fetch(scheduleFile);
        if (!response.ok) throw new Error('File not found');
        return await response.json();
    } catch (error) {
        throw new Error('Cannot load JSON');
    }
}

function getBuiltInScheduleData() {
    if (currentUser?.Role === "Преподаватель" && currentUser?.Login === "322") {
        return {
            weeks: {
                upper: {
                    description: "Верхняя неделя",
                    days: {
                        monday: [
                            {
                                id: "upper_mon_1",
                                time: "09:00-10:30",
                                subject: "Математика",
                                type: "Практика",
                                groups: ["5091"],
                                classroom: "3315",
                                teacher: "Матвеева Ольга Павловна",
                                teacherId: "322"
                            }
                        ],
                        tuesday: [],
                        wednesday: [],
                        thursday: [],
                        friday: [],
                        saturday: [],
                        sunday: []
                    }
                },
                lower: {
                    description: "Нижняя неделя",
                    days: {
                        monday: [],
                        tuesday: [],
                        wednesday: [],
                        thursday: [],
                        friday: [],
                        saturday: [],
                        sunday: []
                    }
                }
            },
            modifications: {},
            holidays: []
        };
    }
    
    return {
        weeks: {
            upper: {
                description: "Верхняя неделя",
                days: {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                }
            },
            lower: {
                description: "Нижняя неделя",
                days: {
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                }
            }
        },
        modifications: {},
        holidays: []
    };
}

function generateUserSchedule() {
    if (!scheduleData) {
        return { days: [], weekType: 'unknown', weekDescription: 'Демо-расписание' };
    }
    
    let userGroup = '5092';
    
    if (currentUser?.Role === "Студент") {
        if (currentUser.Group && typeof currentUser.Group === 'object') {
            const groupKeys = Object.keys(currentUser.Group);
            if (groupKeys.length > 0) {
                userGroup = groupKeys[0];
            }
        } else if (typeof currentUser.Group === 'string') {
            userGroup = currentUser.Group;
        }
    } else if (currentUser?.Role === "Преподаватель") {
        userGroup = null;
    }
    
    const weekDates = getCurrentWeekDates();
    
    const displayWeekType = getWeekTypeForDate(new Date(weekDates.monday));
    const baseWeek = scheduleData.weeks[displayWeekType];
    
    if (!baseWeek) {
        return { days: [], weekType: displayWeekType, weekDescription: 'Неизвестная неделя' };
    }
    
    const days = [
        { day: 'Понедельник', key: 'monday', date: weekDates.monday },
        { day: 'Вторник', key: 'tuesday', date: weekDates.tuesday },
        { day: 'Среда', key: 'wednesday', date: weekDates.wednesday },
        { day: 'Четверг', key: 'thursday', date: weekDates.thursday },
        { day: 'Пятница', key: 'friday', date: weekDates.friday },
        { day: 'Суббота', key: 'saturday', date: weekDates.saturday },
        { day: 'Воскресенье', key: 'sunday', date: weekDates.sunday }
    ];
    
    const resultDays = days.map(dayInfo => {
        const baseLessons = baseWeek.days[dayInfo.key] || [];
        
        let filteredLessons = [];
        
        if (currentUser?.Role === "Преподаватель") {
            filteredLessons = baseLessons.filter(lesson => {
                return lesson.teacherId === currentUser.Login;
            });
        } else if (currentUser?.Role === "Студент") {
            filteredLessons = baseLessons.filter(lesson => {
                if (!lesson.groups) return false;
                
                return Array.isArray(lesson.groups) 
                    ? lesson.groups.includes(userGroup)
                    : lesson.groups === userGroup;
            });
        } else {
            filteredLessons = baseLessons;
        }
        
        return {
            day: dayInfo.day,
            date: dayInfo.date,
            lessons: filteredLessons,
            isHoliday: false
        };
    });
    
    return { 
        days: resultDays,
        weekType: displayWeekType,
        weekDescription: baseWeek.description || (displayWeekType === 'upper' ? 'Верхняя неделя' : 'Нижняя неделя')
    };
}

function applyModifications(lessons, date) {
    if (!scheduleData.modifications || !scheduleData.modifications[date]) {
        return lessons;
    }
    
    const modifications = scheduleData.modifications[date].changes;
    let resultLessons = [...lessons];
    
    modifications.forEach(mod => {
        switch (mod.action) {
            case 'add':
                resultLessons.push(mod.lesson);
                break;
            case 'remove':
                resultLessons = resultLessons.filter(lesson => lesson.id !== mod.lessonId);
                break;
            case 'modify':
                resultLessons = resultLessons.map(lesson => {
                    if (lesson.id === mod.lessonId) {
                        return { ...lesson, ...mod.changes };
                    }
                    return lesson;
                });
                break;
            case 'move':
                resultLessons = resultLessons.map(lesson => {
                    if (lesson.id === mod.lessonId) {
                        return {
                            ...lesson,
                            time: mod.newTime,
                            classroom: mod.newClassroom
                        };
                    }
                    return lesson;
                });
                break;
        }
    });
    
    return resultLessons.sort((a, b) => {
        const timeA = a.time.split('-')[0];
        const timeB = b.time.split('-')[0];
        return timeA.localeCompare(timeB);
    });
}

function renderSchedule(data) {
    const scheduleTable = document.getElementById('scheduleTable');
    if (!scheduleTable) return;
    
    scheduleTable.innerHTML = '';
    
    const weekInfo = document.createElement('div');
    weekInfo.className = 'week-info';
    weekInfo.style.cssText = `
        background: ${data.weekType === 'upper' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px 10px 0 0;
        font-weight: 600;
        text-align: center;
        font-size: 1.1rem;
    `;
    weekInfo.innerHTML = `
        ${data.weekDescription}
        <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.3rem;">
            ${getCurrentWeekDates().monday} - ${getCurrentWeekDates().sunday}
        </div>
    `;
    scheduleTable.appendChild(weekInfo);
    
    if (!data.days || data.days.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-schedule';
        emptyDiv.innerHTML = `
            <i class="fas fa-calendar-times"></i>
            <h3>Нет занятий на эту неделю</h3>
            <p>Расписание не найдено</p>
        `;
        scheduleTable.appendChild(emptyDiv);
        return;
    }

    data.days.forEach(day => {
        const isHoliday = day.isHoliday;
        const holidayBadge = isHoliday ? 
            '<span style="margin-left: 10px; background: var(--error); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">Выходной</span>' : '';
        
        const dayElement = document.createElement('div');
        dayElement.className = 'schedule-day';
        dayElement.innerHTML = `
            <div class="day-header">
                <span>${day.day} ${holidayBadge}</span>
                <span>${new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
            </div>
            <div class="day-content">
                ${day.lessons.length > 0 ? 
                    day.lessons.map(lesson => `
                        <div class="lesson-card">
                            <div class="lesson-time">${lesson.time}</div>
                            <div class="lesson-info">
                                <div class="lesson-details">
                                    <h4>${lesson.subject}</h4>
                                    <div class="lesson-meta">
                                        ${lesson.type} | ${Array.isArray(lesson.groups) ? lesson.groups.join(', ') : lesson.groups} | ${lesson.classroom}
                                        ${lesson.teacher ? ` | ${lesson.teacher}` : ''}
                                    </div>
                                </div>
                                <div class="lesson-actions">
                                    ${getLessonActions(lesson)}
                                </div>
                            </div>
                        </div>
                    `).join('') : 
                    `<div style="text-align: center; color: var(--text-light); padding: 2rem;">
                        ${isHoliday ? 'Выходной день' : 'Нет занятий'}
                    </div>`
                }
            </div>
        `;
        scheduleTable.appendChild(dayElement);
    });
}

function changeWeek(direction) {
    currentWeekOffset += direction;
    updateWeekDisplay();
    loadScheduleData();
}

function updateWeekDisplay() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + (currentWeekOffset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekType = getWeekTypeForDate(startOfWeek);
    const weekTypeText = weekType === 'upper' ? 'Верхняя' : 'Нижняя';
    const weekTypeClass = weekType === 'upper' ? 'week-type-upper' : 'week-type-lower';

    const weekDisplay = document.getElementById('currentWeek');
    weekDisplay.innerHTML = 
        `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ` +
        `${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}` +
        `<span class="week-type-badge ${weekTypeClass}">${weekTypeText}</span>`;
    
    updateTodayButton();
}

function updateTodayButton() {
    const todayBtn = document.getElementById('todayBtn');
    if (currentWeekOffset === 0) {
        todayBtn.disabled = true;
        todayBtn.style.opacity = '0.6';
        todayBtn.style.cursor = 'not-allowed';
    } else {
        todayBtn.disabled = false;
        todayBtn.style.opacity = '1';
        todayBtn.style.cursor = 'pointer';
    }
}

function getWeekTypeForDate(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + 1) / 7);
    return weekNumber % 2 === 0 ? 'upper' : 'lower';
}

function getCurrentWeekDates() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + (currentWeekOffset * 7));
    
    const dates = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach((day, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        dates[day] = date.toISOString().split('T')[0];
    });
    
    return dates;
}

function getLessonActions(lesson) {
    // Убрана кнопка QR-кода
    return `
        <button class="btn btn-secondary" onclick="viewLessonDetails('${lesson.subject}', '${lesson.teacher}', '${lesson.type}', '${lesson.classroom}')">
            <i class="fas fa-info-circle"></i> Подробнее
        </button>
    `;
}

// Функции для редактирования расписания
function openEditModal() {
    if (currentUser?.Role !== "Преподаватель") {
        alert('Редактирование расписания доступно только преподавателям');
        return;
    }
    
    const modal = document.getElementById('editModal');
    const formContainer = document.getElementById('editFormContainer');
    
    // Заполняем форму редактирования
    formContainer.innerHTML = createEditForm();
    
    modal.style.display = 'flex';
    isEditMode = true;
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    isEditMode = false;
}

function createEditForm() {
    const currentSchedule = generateUserSchedule();
    
    return `
        <div class="edit-form">
            <div class="form-group">
                <label>Неделя:</label>
                <input type="text" value="${currentSchedule.weekDescription}" disabled>
            </div>
            
            ${currentSchedule.days.map(day => `
                <div class="schedule-day-edit">
                    <h4>${day.day} (${new Date(day.date).toLocaleDateString('ru-RU')})</h4>
                    ${day.lessons.length > 0 ? 
                        day.lessons.map(lesson => `
                            <div class="lesson-edit-item">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Время:</label>
                                        <input type="text" value="${lesson.time}" class="lesson-time-input">
                                    </div>
                                    <div class="form-group">
                                        <label>Предмет:</label>
                                        <input type="text" value="${lesson.subject}" class="lesson-subject-input">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Тип занятия:</label>
                                        <select class="lesson-type-input">
                                            <option value="Лекция" ${lesson.type === 'Лекция' ? 'selected' : ''}>Лекция</option>
                                            <option value="Практика" ${lesson.type === 'Практика' ? 'selected' : ''}>Практика</option>
                                            <option value="Лабораторная" ${lesson.type === 'Лабораторная' ? 'selected' : ''}>Лабораторная</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Аудитория:</label>
                                        <input type="text" value="${lesson.classroom}" class="lesson-classroom-input">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Группы:</label>
                                    <input type="text" value="${Array.isArray(lesson.groups) ? lesson.groups.join(', ') : lesson.groups}" class="lesson-groups-input">
                                </div>
                                <div class="lesson-edit-actions">
                                    <button class="btn btn-danger" onclick="removeLesson('${lesson.id}')">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                </div>
                            </div>
                        `).join('') : 
                        '<p style="color: var(--text-light); text-align: center;">Нет занятий в этот день</p>'
                    }
                    <button class="btn btn-primary" onclick="addNewLesson('${day.key}')" style="margin-top: 1rem;">
                        <i class="fas fa-plus"></i> Добавить занятие
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function addNewLesson(dayKey) {
    // Реализация добавления нового занятия
    alert(`Добавление нового занятия для ${dayKey}`);
    // Здесь будет логика добавления занятия
}

function removeLesson(lessonId) {
    if (confirm('Вы уверены, что хотите удалить это занятие?')) {
        // Реализация удаления занятия
        alert(`Удаление занятия с ID: ${lessonId}`);
        // Здесь будет логика удаления занятия
    }
}

function saveScheduleChanges() {
    if (currentUser?.Role !== "Преподаватель") {
        alert('Сохранение изменений доступно только преподавателям');
        return;
    }
    
    // Реализация сохранения изменений
    alert('Изменения расписания сохранены');
    closeEditModal();
    loadScheduleData(); // Перезагружаем расписание
}

// Глобальные функции
window.viewLessonDetails = function(subject, teacher, type, classroom) {
    let message = `Детали занятия:\nПредмет: ${subject}\nПреподаватель: ${teacher}`;
    if (type) message += `\nТип: ${type}`;
    if (classroom) message += `\nАудитория: ${classroom}`;
    alert(message);
};

window.changeWeek = changeWeek;
window.loadScheduleData = loadScheduleData;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.addNewLesson = addNewLesson;
window.removeLesson = removeLesson;
window.saveScheduleChanges = saveScheduleChanges;

// Функция для принудительной перезагрузки
window.forceReloadSchedule = function() {
    currentWeekOffset = 0;
    updateWeekDisplay();
    loadScheduleData();
};

setTimeout(() => {
    if (!scheduleData) {
        loadScheduleData();
    }
}, 1000);