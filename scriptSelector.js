import { fLoadClasses } from "./scriptStudent.js"
import { AddTable, DeleteTable } from "./scriptTable.js"


async function fill_selector() {
    const Classes = await fLoadClasses();
    const CountClasses = Classes.length;
    const Group = document.getElementById("Subject");

    for (let i = 0; i < CountClasses; i++) {
        const OptionSelect = document.createElement("option");

        OptionSelect.text = Classes[i].slice(Classes[i].indexOf('\\')+1, Classes[i].lastIndexOf('\\'));
        OptionSelect.value = Classes[i];

        Group.add(OptionSelect);
    }
    Group.addEventListener("change", function () {
        DeleteTable();
        console.log(Group.value)
        AddTable(Group.value.slice(Group.value.indexOf('\\')+1, Group.value.lastIndexOf('\\')), Group.value.slice(Group.value.lastIndexOf('\\')));
    });
    Group.selectionIndex = 0;
    AddTable(Classes[0].slice(Classes[0].indexOf('\\')+1, Classes[0].lastIndexOf('\\')), Classes[0].slice(Classes[0].lastIndexOf('\\')));

}
fill_selector();