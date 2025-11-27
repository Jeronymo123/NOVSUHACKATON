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

        if (user.Role !== "Преподаватель") {
            Classes = oldClasses.filter(item => item.slice(item.lastIndexOf('\\') + 1).replace(/.json/, '') === user.Group);
            const label = document.getElementById("LabelSubject");
            if (label) label.textContent = "Предмет";
        } else {
            Classes = oldClasses.filter(item => item.slice(item.indexOf('\\') + 1, item.lastIndexOf('\\')) === user.Group);
            const label = document.getElementById("LabelSubject");
            if (label) label.textContent = user.Group;
        }

        const container = document.getElementById('subjectHorizontal');

        if (Classes.length === 0) {
            container.innerHTML = '<div class="no-subjects">Нет доступных предметов</div>';
            return;
        }

        container.innerHTML = '';


        Classes.forEach((classItem, index) => {
            const subjectName = classItem.slice(classItem.indexOf('\\') + 1, classItem.lastIndexOf('\\'));
            const groupPath = classItem.slice(classItem.lastIndexOf('\\'));
            const groupName = classItem.slice(classItem.lastIndexOf('\\') + 1).replace(/.json/, '');

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
                

                document.querySelectorAll('.horizontal-subject-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                DeleteTable();
                AddTable(subjectName, groupPath);

            });

            if (index === 0) {
                card.classList.add('active');
                DeleteTable();
                AddTable(subjectName, groupPath);
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки селектора:', error);
        document.getElementById('subjectHorizontal').innerHTML = '<div class="no-subjects">Ошибка загрузки данных</div>';
    }

}

document.addEventListener('DOMContentLoaded', function () {
    fill_selector();
});