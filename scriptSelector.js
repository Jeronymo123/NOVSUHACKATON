import { fLoadClasses } from "./scriptStudent.js"
import { AddTable, DeleteTable } from "./scriptTable.js"

async function get_User() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();

    if (res.status === "ok") {
        return res.user;
    } else {
        window.location.href = "entry_form.html"
    }
}

function getSubjectIcon(subjectName) {
    const icons = {
        'математика': 'calculator',
        'физика': 'atom',
        'химия': 'flask',
        'информатика': 'laptop-code',
        'программирование': 'code',
        'история': 'monument',
        'литература': 'book',
        'биология': 'dna',
        'английский': 'language',
        'русский': 'language',
        'обществознание': 'globe',
        'география': 'globe-americas',
        'экономика': 'chart-line',
        'философия': 'brain',
        'физическая культура': 'running',
        'физкультура': 'running'
    };
    
    const lowerName = subjectName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
        if (lowerName.includes(key)) {
            return icon;
        }
    }
    
    return 'book';
}

function getSubjectNameFromPath(filePath) {
    return filePath.slice(filePath.indexOf('\\') + 1, filePath.lastIndexOf('\\'));
}

function getGroupNameFromPath(filePath) {
    return filePath.slice(filePath.lastIndexOf('\\') + 1).replace(/.json/, '');
}

async function fill_selector() {
    try {
        const oldClasses = await fLoadClasses();
        const user = await get_User();

        let Classes = [];

        if (user.Role === "Студент") {
            Classes = oldClasses.filter(item => getGroupNameFromPath(item) === user.Group);
        } else {
            Classes = oldClasses.filter(item => getSubjectNameFromPath(item) === user.Group);
        }

        const container = document.getElementById('subjectHorizontal');
        
        if (Classes.length === 0) {
            container.innerHTML = '<div class="no-subjects">Нет доступных предметов</div>';
            return;
        }

        container.innerHTML = '';
        
        // Добавляем задержку между переключениями
        let isSwitching = false;
        
        Classes.forEach((classItem, index) => {
            const subjectName = getSubjectNameFromPath(classItem);
            const groupName = getGroupNameFromPath(classItem);

            const card = document.createElement('div');
            card.className = 'horizontal-subject-card';
            card.innerHTML = `
                <div class="horizontal-subject-icon">
                    <i class="fas fa-${getSubjectIcon(subjectName)}"></i>
                </div>
                <div class="horizontal-subject-name">${subjectName}</div>
                <div class="horizontal-subject-group">Группа: ${groupName}</div>
            `;
            
            card.addEventListener('click', async () => {
                // Защита от множественных кликов
                if (isSwitching) return;
                isSwitching = true;
                
                document.querySelectorAll('.horizontal-subject-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Полностью очищаем таблицу перед загрузкой новых данных
                DeleteTable();
                
                // Добавляем небольшую задержку для гарантии очистки
                await new Promise(resolve => setTimeout(resolve, 50));
                
                AddTable(subjectName, "\\" + groupName + ".json");
                
                // Снимаем блокировку после загрузки
                setTimeout(() => { isSwitching = false; }, 100);
            });
            
            if (index === 0) {
                card.classList.add('active');
                // Для первой карточки тоже используем асинхронную загрузку
                setTimeout(() => {
                    DeleteTable();
                    AddTable(subjectName, "\\" + groupName + ".json");
                }, 100);
            }
            
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки селектора:', error);
        document.getElementById('subjectHorizontal').innerHTML = '<div class="no-subjects">Ошибка загрузки данных</div>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fill_selector();
});