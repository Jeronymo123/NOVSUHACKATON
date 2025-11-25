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

async function loadSpan() {
    const res = await getUser();
    const Group = res.user.Group;
    const select = document.getElementById("Select-Group");
    document.querySelectorAll(".tag").forEach(item => {
        item.remove();
    });
    data = Group;
    if (Group.length !== 0) {
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
            const text = String(input.value).split(/ /);
            text.forEach(item => {
                console.log(data_group);
                if (data_group.indexOf(item) != -1) {
                    const span = document.createElement("span");
                    const spanlabel = document.createElement("span");
                    const spanremove = document.createElement("span");

                    spanremove.textContent = "x";
                    spanremove.title = "Удалить";
                    spanremove.className = "TagRemove";

                    spanlabel.className = "TagLabel";

                    span.textContent = item;
                    span.className = "tag";

                    span.appendChild(spanlabel);
                    span.appendChild(spanremove);

                    if (data[select.options[select.selectedIndex].textContent]) {

                        data[select.options[select.selectedIndex].textContent].push(input.value);
                    }
                    else {
                        data[select.options[select.selectedIndex].textContent] = [input.value];
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
        if (user.Role === "Преподаватель") {
            document.querySelectorAll("#Stats").forEach(item => {
                item.style.display = "";
            })
            document.getElementById("SelectGroup").style.display = "";

            document.getElementById("SelectGroup").addEventListener("change", function () {
                loadSpan();
            });
            groups();
        }
        else if (user.Role === "Староста") {
            document.getElementById("Headman").style.display = "";
        }
    }
    else {
        window.location.href = "entry_form.html";
    }
}
window.onload = profile;