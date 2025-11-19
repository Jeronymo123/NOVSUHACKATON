import { fLoadClasses } from "./scriptStudent.js"
import { AddTable , DeleteTable} from "./scriptTable.js"


async function fill_selector() {
    const Classes = await fLoadClasses();
    const CountClasses = Classes.length;
    const Group = document.getElementById("Group");

    for (let i = 0; i < CountClasses; i++) {
        const OptionSelect = document.createElement("option");
        OptionSelect.text = Classes[i];
        OptionSelect.value = Classes[i];

        Group.add(OptionSelect);
    }
    Group.addEventListener("change", function () {
        DeleteTable();
        AddTable(Group.value);
    });
    Group.selectionIndex = 0;
    AddTable(Classes[0]);
}

fill_selector();