// scriptSchedule.js
let currentWeekOffset = 0;
let scheduleData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    profile();
    setupEventListeners();
    updateWeekDisplay();
    loadScheduleData();
}

function setupEventListeners() {
    // Обработчики для кнопок навигации недель
    document.getElementById('prevWeekBtn').onclick = () => changeWeek(-1);
    document.getElementById('nextWeekBtn').onclick = () => changeWeek(1);
    document.getElementById('todayBtn').onclick = resetToCurrentWeek;
    document.getElementById('refreshBtn').onclick = loadScheduleData;
    document.getElementById("Logout").onclick = Logout;
}

function resetToCurrentWeek() {
    currentWeekOffset = 0;
    updateWeekDisplay();
    loadScheduleData();
}

document.getElementById("Logout").onclick = Logout;

async function Logout() {
    const response = await fetch("/logout", { method: "POST", credentials: "include" });
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

async function profile() {
    try {
        const response = await fetch("/profile", { credentials: "include" });
        const res = await response.json();
        if (res.status === "ok") {
            document.querySelectorAll("#NameProfile").forEach(item => {
                item.textContent = res.user.Surname + " " + res.user.Name;
            });
            
            localStorage.setItem('currentUser', JSON.stringify(res.user));
            localStorage.setItem('userRole', res.user.role || 'student');
            localStorage.setItem('userGroup', res.user.group || 'ПИ-201');
            
            initializeSchedule();
        } else {
            window.location.href = "entry_form.html";
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        initializeScheduleWithDemoData();
    }
}

function initializeSchedule() {
    updateWeekDisplay();
    loadScheduleData();
}

function initializeScheduleWithDemoData() {
    const demoUser = {
        id: 'demo1',
        Name: 'Алексей',
        Surname: 'Иванов',
        group: 'ПИ-201',
        role: 'student'
    };
    
    document.querySelectorAll("#NameProfile").forEach(item => {
        item.textContent = demoUser.Surname + " " + demoUser.Name;
    });
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    localStorage.setItem('userRole', 'student');
    localStorage.setItem('userGroup', 'ПИ-201');
    
    initializeSchedule();
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

        // Пробуем загрузить из JSON, если не получится - используем встроенные данные
        scheduleData = await loadScheduleFromJSON();
        
    } catch (error) {
        console.log('Используются встроенные данные расписания');
        scheduleData = getBuiltInScheduleData();
    }
    
    const userSchedule = generateUserSchedule();
    renderSchedule(userSchedule);
}

// Упрощенная загрузка из JSON
async function loadScheduleFromJSON() {
    try {
        const response = await fetch('/data/schedule.json');
        if (!response.ok) throw new Error('File not found');
        return await response.json();
    } catch (error) {
        throw new Error('Cannot load JSON');
    }
}

// Встроенные данные расписания
function getBuiltInScheduleData() {
    return {
        weeks: {
            upper: {
                description: "Верхняя неделя",
                days: {
                    monday: [
                        {
                            id: "upper_mon_1",
                            time: "09:00-10:30",
                            subject: "Веб-разработка",
                            type: "Лекция",
                            groups: ["ПИ-201", "ПИ-202"],
                            classroom: "А-101",
                            teacher: "Иванов А.С.",
                            teacherId: "teacher1"
                        },
                        {
                            id: "upper_mon_2",
                            time: "11:00-12:30",
                            subject: "Алгоритмы и структуры данных",
                            type: "Практика",
                            groups: ["ПИ-201"],
                            classroom: "Б-205",
                            teacher: "Петрова М.В.",
                            teacherId: "teacher2"
                        }
                    ],
                    tuesday: [
                        {
                            id: "upper_tue_1",
                            time: "13:00-14:30",
                            subject: "Базы данных",
                            type: "Лабораторная",
                            groups: ["ПИ-201"],
                            classroom: "К-301",
                            teacher: "Кузнецова Е.Л.",
                            teacherId: "teacher3"
                        }
                    ],
                    wednesday: [
                        {
                            id: "upper_wed_1",
                            time: "10:00-11:30",
                            subject: "Математический анализ",
                            type: "Лекция",
                            groups: ["ПИ-201"],
                            classroom: "А-102",
                            teacher: "Сидоров П.И.",
                            teacherId: "teacher4"
                        }
                    ],
                    thursday: [
                        {
                            id: "upper_thu_1",
                            time: "14:00-15:30",
                            subject: "Архитектура компьютеров",
                            type: "Лекция",
                            groups: ["ПИ-201"],
                            classroom: "А-104",
                            teacher: "Федоров С.М.",
                            teacherId: "teacher5"
                        }
                    ],
                    friday: [
                        {
                            id: "upper_fri_1",
                            time: "09:00-10:30",
                            subject: "Теория вероятностей",
                            type: "Лекция",
                            groups: ["ПИ-201"],
                            classroom: "А-105",
                            teacher: "Николаева О.П.",
                            teacherId: "teacher6"
                        }
                    ],
                    saturday: [],
                    sunday: []
                }
            },
            lower: {
                description: "Нижняя неделя",
                days: {
                    monday: [
                        {
                            id: "lower_mon_1",
                            time: "09:00-10:30",
                            subject: "Математический анализ",
                            type: "Лекция",
                            groups: ["ПИ-201", "ПИ-202"],
                            classroom: "А-102",
                            teacher: "Сидоров П.И.",
                            teacherId: "teacher4"
                        }
                    ],
                    tuesday: [
                        {
                            id: "lower_tue_1",
                            time: "15:00-16:30",
                            subject: "Операционные системы",
                            type: "Лекция",
                            groups: ["ПИ-201"],
                            classroom: "А-103",
                            teacher: "Федоров С.М.",
                            teacherId: "teacher5"
                        }
                    ],
                    wednesday: [
                        {
                            id: "lower_wed_1",
                            time: "12:00-13:30",
                            subject: "Иностранный язык",
                            type: "Практика",
                            groups: ["ПИ-201"],
                            classroom: "Л-201",
                            teacher: "Смирнова О.К.",
                            teacherId: "teacher7"
                        }
                    ],
                    thursday: [
                        {
                            id: "lower_thu_1",
                            time: "16:00-17:30",
                            subject: "Физическая культура",
                            type: "Практика",
                            groups: ["ПИ-201"],
                            classroom: "Спортзал",
                            teacher: "Петров В.И.",
                            teacherId: "teacher8"
                        }
                    ],
                    friday: [
                        {
                            id: "lower_fri_1",
                            time: "11:00-12:30",
                            subject: "Проектный практикум",
                            type: "Лабораторная",
                            groups: ["ПИ-201"],
                            classroom: "К-302",
                            teacher: "Иванов А.С.",
                            teacherId: "teacher1"
                        }
                    ],
                    saturday: [],
                    sunday: []
                }
            }
        },
        modifications: {
            "2024-12-25": {
                date: "2024-12-25",
                description: "Рождественские каникулы",
                changes: [
                    {
                        action: "remove",
                        lessonId: "upper_mon_1",
                        reason: "Выходной день"
                    }
                ]
            }
        },
        holidays: [
            "2024-12-31",
            "2025-01-01",
            "2025-01-02",
            "2025-01-07"
        ]
    };
}

// Остальные функции остаются без изменений
function generateUserSchedule() {
    if (!scheduleData) {
        console.warn('Нет данных расписания');
        return { days: [], weekType: 'unknown', weekDescription: 'Демо-расписание' };
    }
    
    const userGroup = localStorage.getItem('userGroup') || 'ПИ-201';
    const userRole = localStorage.getItem('userRole') || 'student';
    const weekDates = getCurrentWeekDates();
    
    // Определяем тип недели для отображаемого периода
    const displayWeekType = getWeekTypeForDate(new Date(weekDates.monday));
    const baseWeek = scheduleData.weeks[displayWeekType];
    
    if (!baseWeek) {
        console.warn('Не найдена неделя типа:', displayWeekType);
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
        
        let filteredLessons = baseLessons.filter(lesson => {
            if (userRole === 'teacher') {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                return lesson.teacherId === currentUser.id;
            }
            return lesson.groups && lesson.groups.includes(userGroup);
        });
        
        filteredLessons = applyModifications(filteredLessons, dayInfo.date);
        
        if (scheduleData.holidays && scheduleData.holidays.includes(dayInfo.date)) {
            filteredLessons = [];
        }
        
        return {
            day: dayInfo.day,
            date: dayInfo.date,
            lessons: filteredLessons,
            isHoliday: scheduleData.holidays && scheduleData.holidays.includes(dayInfo.date)
        };
    });
    
    return { 
        days: resultDays,
        weekType: displayWeekType,
        weekDescription: baseWeek.description || (displayWeekType === 'upper' ? 'Верхняя неделя' : 'Нижняя неделя')
    };
}

function getCurrentWeekType() {
    const now = new Date();
    return getWeekTypeForDate(now);
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
    
    // Обновляем состояние кнопки "Сегодня"
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
    const userRole = localStorage.getItem('userRole') || 'student';
    
    if (userRole === 'teacher') {
        return `
            <button class="btn btn-secondary attendance-btn" onclick="startAttendance('${lesson.time}', '${lesson.subject}', '${lesson.id}')">
                <i class="fas fa-qrcode"></i> QR
            </button>
        `;
    } else {
        return `
            <button class="btn btn-secondary" onclick="viewLessonDetails('${lesson.subject}', '${lesson.teacher}')">
                <i class="fas fa-info-circle"></i> Подробнее
            </button>
        `;
    }
}

function startAttendance(time, subject) {
    alert(`Запуск отметки посещаемости для:\n${subject}\n${time}\n\nQR-код будет сгенерирован для студентов.`);
}

function viewLessonDetails(subject, teacher) {
    alert(`Детали занятия:\nПредмет: ${subject}\nПреподаватель: ${teacher}`);
}

window.onload = profile;

// Глобальные функции для вызова из HTML
window.startAttendance = function(time, subject, lessonId) {
    alert(`Запуск отметки посещаемости для:\n${subject}\n${time}\n\nQR-код будет сгенерирован для студентов.`);
    
    // В реальной системе здесь будет генерация QR-кода
    console.log(`Генерация QR-кода для занятия: ${subject}, ID: ${lessonId}`);
};

window.viewLessonDetails = function(subject, teacher) {
    alert(`Детали занятия:\nПредмет: ${subject}\nПреподаватель: ${teacher}`);
};

window.changeWeek = changeWeek;
window.loadScheduleData = loadScheduleData;