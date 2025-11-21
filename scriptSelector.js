import { fLoadClasses } from "./scriptStudent.js"
import { AddTable, DeleteTable } from "./scriptTable.js"

async function get_User() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();

    if (res.status === "ok") {
        console.log(res.user.Role)
        return res.user;
    } else {
        window.location.href = "entry_form.html"
    }
}

async function fill_selector() {
    const oldClasses = await fLoadClasses();
    var Classes;
    var CountClasses = 0;
    const Group = document.getElementById("Subject");

    const user = await get_User();
    if (user.Role === "Студент") {
        Classes = oldClasses.filter(item => item.slice(item.lastIndexOf('\\') + 1).replace(/.json/, '') === user.Group);
        CountClasses = Classes.length;
        console.log(user.Group);

        document.getElementById("LabelSubject").textContent = "Предмет";
        if (CountClasses !== 0) {
            for (let i = 0; i < CountClasses; i++) {
                const OptionSelect = document.createElement("option");

                OptionSelect.text = Classes[i].slice(Classes[i].indexOf('\\') + 1, Classes[i].lastIndexOf('\\'));
                OptionSelect.value = Classes[i];

                Group.add(OptionSelect);
            }
            Group.addEventListener("change", function () {
                DeleteTable();
                AddTable(Group.value.slice(Group.value.indexOf('\\') + 1, Group.value.lastIndexOf('\\')), Group.value.slice(Group.value.lastIndexOf('\\')));
            });
            Group.selectionIndex = 0;
            AddTable(Classes[0].slice(Classes[0].indexOf('\\') + 1, Classes[0].lastIndexOf('\\')), Classes[0].slice(Classes[0].lastIndexOf('\\')));
        }
    }
    else {
        document.getElementById("LabelSubject").textContent = "Группы";
        console.log(oldClasses[0].slice(oldClasses[0].indexOf('\\') + 1, oldClasses[0].lastIndexOf('\\')),user.Group);
        Classes = oldClasses.filter(item => item.slice(item.indexOf('\\') + 1, item.lastIndexOf('\\')) === user.Group);
        CountClasses = Classes.length;
        if (CountClasses !== 0) {
            for (let i = 0; i < CountClasses; i++) {
                const OptionSelect = document.createElement("option");

                OptionSelect.text = Classes[i].slice(Classes[i].lastIndexOf('\\')+1).replace(/.json/,'');
                OptionSelect.value = Classes[i];

                Group.add(OptionSelect);
            }
            Group.addEventListener("change", function () {
                DeleteTable();
                AddTable(Group.value.slice(Group.value.indexOf('\\') + 1, Group.value.lastIndexOf('\\')), Group.value.slice(Group.value.lastIndexOf('\\')));
            });
            Group.selectionIndex = 0;
            AddTable(Classes[0].slice(Classes[0].indexOf('\\') + 1, Classes[0].lastIndexOf('\\')), Classes[0].slice(Classes[0].lastIndexOf('\\')));
        }
    }
}
fill_selector();