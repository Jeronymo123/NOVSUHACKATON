document.getElementById("Logout").onclick = Logout;

async function Logout() {
    const response = await fetch("/logout", { method: "POST", credentials: "include", });
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

var data = {};
var data_group = [];
async function getGroup() {
    const response = await fetch('/getgroups', { credentials: "include" });
    const res = await response.json();
    data_group = res;
}
function sendGroup() {
    fetch(`/sendgroup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data),
    });
}

async function getUser() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();
    return res;
}

async function get_User() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();

    if (res.status === "ok") {
        return res.user;
    } else {
        window.location.href = "entry_form.html"
    }
}

async function loadSpan() {
    const res = await getUser();
    const Group = res.user.Group;
    const select = document.getElementById("Select-Group");
    document.querySelectorAll(".tag").forEach(item => {
        item.remove();
    });
    if(Group && Object.keys(Group).length !== 0){
        data = Group;
    }
    else{
        data={};
    }
    if (Group && Object.keys(Group).length !== 0) {
        Group[select.options[select.selectedIndex].textContent].forEach(item => {
            const span = document.createElement("span");
            const spanlabel = document.createElement("span");
            const spanremove = document.createElement("span");

            spanremove.textContent = "x";
            spanremove.title = "Удалить";
            spanremove.classNmae = "TagRemove";

            spanlabel.className = "TagLabel";

            span.textContent = item;
            span.className = "tag";
            spanremove.addEventListener('click', function () {
                span.remove();
                if (data[select.options[select.selectedIndex].textContent]) {
                    data[select.options[select.selectedIndex].textContent].splice(data[select.options[select.selectedIndex].textContent].indexOf(select.options[select.selectedIndex].textContent), 1);

                }
                sendGroup();
            })
            span.appendChild(spanlabel);
            span.appendChild(spanremove);
            document.getElementById("SpanGroup").appendChild(span);
        })
    }
}

async function groups() {

    const response = await fetch('loadclasses');
    const res = await response.json();
    const new_res = res.map(item => item.slice(item.indexOf('\\') + 1, item.lastIndexOf('\\'))).filter(function (item, pos, arr) {
        return arr.indexOf(item) == pos;
    });

    const select = document.getElementById("Select-Group");
    new_res.forEach(item => {
        const Option = document.createElement("option");
        Option.text = item;
        Option.value = item;
        select.add(Option);
    });
    select.selectedIndex = 0;

    const input = document.getElementById("Input-Group");
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const text = String(input.value).split(" ");
            text.forEach(item => {
                console.log(data_group);
                if (data_group.indexOf(item) != -1) {
                    const span = document.createElement("span");
                    const spanlabel = document.createElement("span");
                    const spanremove = document.createElement("span");
                    console.log(text);
                    spanremove.textContent = "x";
                    spanremove.title = "Удалить";
                    spanremove.className = "TagRemove";

                    spanlabel.className = "TagLabel";

                    span.textContent = item;
                    span.className = "tag";

                    span.appendChild(spanlabel);
                    span.appendChild(spanremove);

                    if (data[select.options[select.selectedIndex].textContent]) {

                        data[select.options[select.selectedIndex].textContent].push(item);
                    }
                    else {
                        data[select.options[select.selectedIndex].textContent] = [item];
                    }
                    spanremove.addEventListener('click', function () {
                        span.remove();
                        data[select.options[select.selectedIndex].textContent].splice(data[select.options[select.selectedIndex].textContent].indexOf(select.options[select.selectedIndex].textContent), 1);
                        sendGroup();
                    })
                    sendGroup();
                    document.getElementById("SpanGroup").appendChild(span);
                }
            })
            input.value = "";
        }
    });
    loadSpan();
}

// Функция экспорта данных
async function exportData() {
    try {
        const user = await get_User();
        showExportModal();
    } catch (error) {
        console.error('Ошибка при экспорте данных:', error);
        alert('Ошибка при экспорте данных');
    }
}

// Функция показа модального окна экспорта
function showExportModal() {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div class="export-modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
        ">
            <h3 style="margin: 0 0 1.5rem 0; color: var(--text);">Экспорт данных</h3>
            
            <div class="export-options" style="margin-bottom: 2rem;">
                <div class="export-option" style="margin-bottom: 1rem;">
                    <input type="radio" id="exportExcel" name="exportFormat" value="excel" checked>
                    <label for="exportExcel" style="margin-left: 0.5rem; cursor: pointer;">
                        <i class="fas fa-file-excel" style="color: #217346; margin-right: 0.5rem;"></i>
                        Экспорт в Excel (.xlsx)
                    </label>
                </div>
                
                <div class="export-option">
                    <input type="radio" id="exportPdf" name="exportFormat" value="pdf">
                    <label for="exportPdf" style="margin-left: 0.5rem; cursor: pointer;">
                        <i class="fas fa-file-pdf" style="color: #f40f02; margin-right: 0.5rem;"></i>
                        Экспорт в PDF (.pdf)
                    </label>
                </div>
            </div>
            
            <div class="export-buttons" style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary" id="cancelExport" style="padding: 0.75rem 1.5rem;">
                    Отмена
                </button>
                <button class="btn btn-primary" id="confirmExport" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-download"></i> Экспорт
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Обработчики событий
    document.getElementById('cancelExport').onclick = () => {
        document.body.removeChild(modal);
    };

    document.getElementById('confirmExport').onclick = () => {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        performExport(format);
        document.body.removeChild(modal);
    };

    // Закрытие по клику вне модального окна
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Функция выполнения экспорта
async function performExport(format) {
    try {
        const exportBtn = document.querySelector('.action-button:nth-child(4)');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Экспорт...';
        exportBtn.disabled = true;

        // Отправляем запрос на сервер
        const response = await fetch('/api/schedule/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ format: format })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при экспорте данных');
        }

        // Получаем blob и создаем ссылку для скачивания
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Получаем имя файла из заголовков или генерируем
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `schedule_export.${format === 'excel' ? 'xlsx' : 'pdf'}`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Восстанавливаем кнопку
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
        showExportNotification('Данные успешно экспортированы!');

    } catch (error) {
        console.error('Ошибка экспорта:', error);

        // Восстанавливаем кнопку
        const exportBtn = document.querySelector('.action-button:nth-child(4)');
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Экспорт данных';
        exportBtn.disabled = false;

        alert('Ошибка при экспорте данных: ' + error.message);
    }
}

// Функция показа уведомления об успешном экспорте
function showExportNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
    `;

    notification.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .action-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .action-button:disabled:hover {
        transform: none;
        border-color: var(--border);
    }
`;
document.head.appendChild(style);


async function profile() {
    const res = await getUser();
    getGroup();
    if (res.status === "ok") {
        const user = res.user;
        document.querySelectorAll("#NameProfile").forEach(item => {
            item.textContent = res.user.Surname + " " + user.Name;
        });
        document.getElementById("Name").textContent = user.Surname + " " + user.Name + " " + user.Secondname;
        document.getElementById("Role").textContent = user.Role;
        document.getElementById("Login").textContent = user.Login;
        document.getElementById("Email").textContent = user.Email;


        const exportButton = document.querySelector('.action-button:nth-child(4)');
        if (user.Role !== "Преподаватель") {
            document.getElementById("Group").style.display = "";
            document.getElementById("InfoGroup").firstChild.textContent = user.Group;
            if (exportButton) {

                exportButton.style.display = 'none';
            }
        } else {

            if (exportButton) {
                exportButton.onclick = exportData;

            }

            document.querySelectorAll("#Stats").forEach(item => {
                item.style.display = "";
            })
            document.getElementById("SelectGroup").style.display = "";

            document.getElementById("SelectGroup").addEventListener("change", function () {
                loadSpan();
            });
            groups();
        }

        if (user.Role === "Староста") {
            document.getElementById("Headman").style.display = "";
            document.getElementById("Button-Headman").onclick = changeRole;
        }
    }
    else {
        window.location.href = "entry_form.html";
    }
}
function changeRole() {
    fetch('/changerole', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ login: document.getElementById("Input-Headman").value }),
    });
}
window.onload = profile;