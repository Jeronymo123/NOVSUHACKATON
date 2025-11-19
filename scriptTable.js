import { parseJSONStudent } from './scriptStudent.js'

document.getElementById('AddColumn').onclick = AddColumn;
document.getElementById('Editing').addEventListener("change", create_edit)
document.getElementById('Pass').addEventListener("change", Pass);
document.getElementById('Presence').addEventListener("change", Presence);
document.getElementById('Disease').addEventListener("change", Disease);
document.getElementById('AddStudent').onclick = send_to_Server;

var indexInput = 0;
var countPerson = 0;
var type_editing = 0;
var indexColumn = 0;
var countCell = 0;
var PersonData = [];
var data = [];

function send_to_Server() {
    for (let i = 0; i < countPerson; i++) {
        for (let j = 0; j < data.length; j++)
            PersonData[i][j] = data[j];
    }
    PersonData.forEach(item => {
        fetch("/savestudent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
    });
}

export async function AddTable(group) {
    PersonData = await parseJSONStudent(group);
    countPerson = PersonData.length;
    var Table = document.getElementById("Table");
    for (let i = 0; i < countPerson; i++) {

        indexInput++;

        const Row = Table.insertRow();
        Row.className = "Delete Row";

        const Num = Row.insertCell();
        Num.innerHTML = i + 1;

        const Cell = Row.insertCell();

        Cell.innerHTML = PersonData[i].info.name;
        Cell.id = i;
        const InputName = document.createElement("input");

        InputName.className = "RowInput";
        InputName.type = 'text'
        InputName.style.display = "none";
        InputName.value = Cell.textContent;
        Cell.appendChild(InputName);

        Cell.addEventListener("click", function () {
            if (document.getElementById("Editing").checked) {
                Cell.firstChild.nodeValue = "";
                InputName.style.display = "inline-block";
                InputName.focus();
            }
        });

        InputName.addEventListener("blur", function () {
            if (document.getElementById("Editing").checked) {
                InputName.style.display = "none";
                Cell.firstChild.nodeValue = InputName.value;
                change_data_Name(Cell.id / countPerson, InputName.value)

            }
        });
        1
        InputName.addEventListener("keypress", function (event) {
            if (document.getElementById("Editing").checked) {
                if (event.key === "Enter") {
                    InputName.style.display = "none";
                    Cell.firstChild.nodeValue = InputName.value;
                    change_data_Name(Cell.id / countPerson, InputName.value)
                }
            }
        })

    }
    Object.keys(PersonData[0]).forEach(element => {
        let regex = /\d/;
        if (regex.test(element)) {
            var PersonGrades = [];
            for (let i = 0; i < countPerson; i++) {
                PersonGrades.push(PersonData[i][element].Value);
            }
            LoadHeader(PersonData[0][element].Date, PersonData[0][element].TypeWork);
            LoadGrade(PersonGrades);
            indexColumn++;
        }
    })

}

export function DeleteTable() {
    const Rows = document.querySelectorAll(".Delete");
    Rows.forEach(element => {
        element.remove();
    });
    indexColumn = 0;
    countCell = 0;
    indexInput = 0;
    data=[];
}

function create_delete_Column() {
    const DeleteCol = document.getElementById("DeleteColumn").insertCell();
    DeleteCol.className = `Delete Column${indexColumn}`;

    const DeleteButton = document.createElement("button");

    DeleteCol.onclick = function () {
        const Columns = document.querySelectorAll(`.${DeleteCol.className.slice(7)}`);
        Columns.forEach(element => {
            for (let i = 0; i < countPerson; i++) {
                delete PersonData[i][`${DeleteCol.className.slice(13)}`]
            };
            element.remove();
        })
    };
    DeleteCol.appendChild(DeleteButton);

}

function AddColumn() {

    create_data();
    create_delete_Column();
    AddDate();
    AddTypeWork()

    const elements = document.querySelectorAll('.Row');
    elements.forEach(element => {
        const Cell = element.insertCell();
        Cell.id = countCell;
        Cell.className = `Column${indexColumn}`;
        Cell.innerHTML = change_attendance(Cell.id);
        countCell++;
        Cell.addEventListener("click", function () {
            if (document.getElementById("Editing").checked) {
                Cell.innerHTML = change_attendance(Cell.id);
            }
        });
    });
    indexColumn++;
}

function AddDate() {
    const DateKey = document.getElementById("Keyword").insertCell();
    let today = new Date();
    DateKey.innerHTML = today.getDate() + "." + String(Number(today.getMonth()) + 1) + "." + today.getFullYear();
    DateKey.id = "Date" + indexColumn;
    DateKey.className = `Delete Column${indexColumn}`;
    const InputDate = document.createElement("input");

    InputDate.className = "InputDate";
    InputDate.type = 'date';
    InputDate.style.display = "none";
    InputDate.value = DateKey.textContent;
    DateKey.appendChild(InputDate);

    DateKey.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            DateKey.firstChild.nodeValue = "";
            InputDate.style.display = "inline-block";
            InputDate.focus();
        }
    });
    InputDate.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            InputDate.style.display = "none";
            DateKey.firstChild.nodeValue = InputDate.value.slice(8) + "." + InputDate.value.slice(5, 7) + "." + InputDate.value.slice(0, 4);
            (DateKey.id.slice(4), DateKey.textContent);
        }
    });

    InputDate.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                InputDate.style.display = "none";
                DateKey.firstChild.nodeValue = InputDate.value.slice(8) + "." + InputDate.value.slice(5, 7) + "." + InputDate.value.slice(0, 4);;
                change_data_date(DateKey.id.slice(4), DateKey.textContent);
            }
        }
    });
    change_data_date(DateKey.id.slice(4), DateKey.textContent);
}

function AddTypeWork() {
    const TypeWork = document.getElementById("TypeWork").insertCell();
    TypeWork.id = "TypeWork" + indexColumn;
    TypeWork.className = `Delete Column${indexColumn}`;
    const Work = document.createElement("select");

    const typetext = [
        "Посещаемость",
        "Лекция",
        "Практика",
        "Лабораторная",
        "Экзамен"
    ];
    const typevalue = [
        "Посещаемость",
        "Лекция",
        "Практика",
        "Лабораторная",
        "Экзамен"
    ];
    for (let i = 0; i < typetext.length; i++) {
        const Option = document.createElement("option");
        Option.text = typetext[i];
        Option.value = typevalue[i];
        Work.add(Option);
    }

    Work.id = "Work";
    Work.style.display = "none";
    Work.selectedIndex = 0;

    TypeWork.textContent = Work.options[Work.selectedIndex].textContent;

    TypeWork.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            TypeWork.firstChild.nodeValue = "";
            Work.style.display = "inline-block";
            Work.focus();
        }
    });

    Work.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.nodeValue = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
        }
    });

    Work.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                Work.style.display = "none";
                TypeWork.firstChild.nodeValue = Work.options[Work.selectedIndex].text;
                change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
            }
        }
    })
    TypeWork.appendChild(Work);
    change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
}

function LoadHeader(date, typework) {
    create_data();
    create_delete_Column();
    LoadDate(date);
    LoadTypeWork(typework)

}

function LoadDate(today) {
    const DateKey = document.getElementById("Keyword").insertCell();
    const normDate=today.slice(6)+"-"+today.slice(3,5)+"-"+today.slice(0,2)
    DateKey.innerHTML = today;
    DateKey.id = "Date" + indexColumn;
    DateKey.className = `Delete Column${indexColumn}`;
    const InputDate = document.createElement("input");

    InputDate.className = "InputDate";
    InputDate.type = 'date'
    InputDate.style.display = "none";
    InputDate.value = normDate;
    DateKey.appendChild(InputDate);

    DateKey.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            DateKey.firstChild.nodeValue = "";
            InputDate.style.display = "inline-block";
            InputDate.focus();
        }
    });
    InputDate.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            InputDate.style.display = "none";
            DateKey.firstChild.nodeValue = InputDate.value.slice(8) + "." + InputDate.value.slice(5, 7) + "." + InputDate.value.slice(0, 4);
            change_data_date(DateKey.id.slice(4), DateKey.textContent);
        }
    });

    InputDate.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                InputDate.style.display = "none";
                DateKey.firstChild.nodeValue = InputDate.value.slice(8) + "." + InputDate.value.slice(5, 7) + "." + InputDate.value.slice(0, 4);;
                change_data_date(DateKey.id.slice(4), DateKey.textContent);
            }
        }
    });
    change_data_date(DateKey.id.slice(4), DateKey.textContent);
}

function LoadTypeWork(typework) {
    const TypeWork = document.getElementById("TypeWork").insertCell();
    TypeWork.id = "TypeWork" + indexColumn;
    TypeWork.className = `Delete Column${indexColumn}`
    const Work = document.createElement("select");

    const typetext = [
        "Посещаемость",
        "Лекция",
        "Практика",
        "Лабораторная",
        "Экзамен"
    ];

    for (let i = 0; i < typetext.length; i++) {
        const Option = document.createElement("option");
        Option.text = typetext[i];
        Option.value = i;
        Work.add(Option);
    }

    Work.id = `Work${indexColumn}`;
    Work.style.display = "none";
    Work.selectedIndex = typetext.indexOf(typework);

    TypeWork.textContent = typework;

    TypeWork.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            TypeWork.firstChild.nodeValue = "";
            Work.style.display = "inline-block";
            Work.focus();
        }
    });

    Work.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.nodeValue = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
        }
    });

    Work.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                Work.style.display = "none";
                TypeWork.firstChild.nodeValue = Work.options[Work.selectedIndex].text;
                change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
            }
        }
    })
    TypeWork.appendChild(Work);
    change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
}

function LoadGrade(Grades) {
    const elements = document.querySelectorAll('.Row');
    let cCell = 0;
    elements.forEach(element => {
        const Cell = element.insertCell();
        const GradeInput = document.createElement("input");

        Cell.id = countCell;
        Cell.className = `Column${indexColumn}`;
        Cell.innerHTML = Grades[cCell];

        cCell++;
        countCell++;

        GradeInput.value = Cell.textContent;
        GradeInput.style.display = "none";

        let TypeWorkElement = document.getElementById(`Work${indexColumn}`);
        let workType = TypeWorkElement ? TypeWorkElement.options[TypeWorkElement.selectedIndex].text.trim() : "";
        if (workType === "Посещаемость") {
            Cell.addEventListener("click", function () {
                if (document.getElementById("Editing").checked) {
                    Cell.innerHTML = change_attendance(Cell.id);
                }
            });
        }
        else {
            GradeInput.style.display = "inline-block";
            Cell.firstChild.nodeValue = "";
        }
        Cell.appendChild(GradeInput);
    });
}

function change_attendance(ind) {
    if (type_editing === 0) {
        change_data_Value(ind % countPerson, Math.floor(ind / countPerson), "+");
        return "+";
    }
    else if (type_editing === 1) {
        change_data_Value(ind % countPerson, Math.floor(ind / countPerson), "П");
        return "П";
    }
    else if (type_editing === 2) {

        change_data_Value(ind % countPerson, Math.floor(ind / countPerson), "Б");
        return "Б";
    }
}

function create_edit() {
    if (document.getElementById('Editing').checked) {
        document.getElementById('Pass').style.display = "inline-block";
        document.getElementById('Presence').style.display = "inline-block";
        document.getElementById('Disease').style.display = "inline-block";
        document.getElementById("DeleteColumn").style.display = "inline-block";

    }
    else {
        document.getElementById('Pass').style.display = "none";
        document.getElementById('Presence').style.display = "none";
        document.getElementById('Disease').style.display = "none";
        document.getElementById("DeleteColumn").style.display = "none";

    }
}

function Presence() {
    type_editing = 0;
    document.getElementById('Pass').checked = false;
    document.getElementById('Disease').checked = false;
}

function Pass() {
    type_editing = 1;
    document.getElementById('Presence').checked = false;
    document.getElementById('Disease').checked = false;
}

function Disease() {
    type_editing = 2;
    document.getElementById('Pass').checked = false;
    document.getElementById('Presence').checked = false;
}

function create_data() {
    data.push({
        Date: "DD.MM.YYYY",
        TypeWork: "typeWork",
        Value: "+"
    });

}

function change_data_date(id, date) {
    data[id].Date = date;
    for (let i = 0; i < countPerson; i++) {
        PersonData[i][id] = data[id];
        PersonData[i][id].Date = date;
    }
}

function change_data_TypeWork(id, typework) {
    data[id].TypeWork = typework;
    for (let i = 0; i < countPerson; i++) {
        PersonData[i][id] = data[id];
        PersonData[i][id].TypeWork = typework;
    }
}

function change_data_Value(id, ind, grade) {
    data[ind].Value = grade;
    change_info(id, ind);
}

function change_data_Name(ind, Name) {
    PersonData[ind].info.name = Name;
}

function change_info(id, ind) {
    PersonData[id][ind] = data[ind];
}

window.onbeforeunload = function () {
    return confirm('Точно хотите выйти?');
}
