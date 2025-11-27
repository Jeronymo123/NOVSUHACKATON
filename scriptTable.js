import { parseJSONStudent } from './scriptStudent.js'


document.addEventListener("DOMContentLoaded", function () {
    var leftBody = document.querySelector("#Table1 tbody");
    var rightBody = document.querySelector("#Table tbody");

    var isSyncingLeft = false;
    var isSyncingRight = false;

    leftBody.addEventListener("scroll", function () {
        if (isSyncingLeft) {
            isSyncingLeft = false;
            return;
        }
        isSyncingRight = true;
        rightBody.scrollTop = leftBody.scrollTop;
    });

    rightBody.addEventListener("scroll", function () {
        if (isSyncingRight) {
            isSyncingRight = false;
            return;
        }
        isSyncingLeft = true;
        leftBody.scrollTop = rightBody.scrollTop;
    });
});


document.getElementById('AddColumn').onclick = AddColumn;
document.getElementById('Editing').addEventListener("change", create_edit)
document.getElementById('Pass').addEventListener("change", Pass);
document.getElementById('Presence').addEventListener("change", Presence);
document.getElementById('Disease').addEventListener("change", Disease);
document.getElementById('AddStudent').onclick = send_to_Server;

async function get_User() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();
    if (res.status === "ok") {
        return res.user;
    } else {
        window.location.href = "entry_form.html"
    }
}
async function LoadDoc() {

    const user = await get_User();
    const divRole = document.getElementById("Role");
    if (user.Role === "Преподаватель") {
        divRole.style.display = "";
    }
}



var indexInput = 0;
var countPerson = 0;
var type_editing = 0;
var indexColumn = 0;
var countCell = 0;
var PersonData = [];
var data = [];
var subject;
var group;
async function send_to_Server() {
    const user = await get_User();
    if (user.Role === "Преподаватель") {
        change_new_data_Value();
        PersonData.forEach(item => {
            fetch(`/savestudent?subject=${subject}&group=${group}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            });
        });
    }
}

export async function AddTable(Subject, Group) {
    LoadDoc()
    const user = await get_User();
    PersonData = await parseJSONStudent(Subject, Group);
    countPerson = PersonData.length;
    subject = Subject;
    group = Group;
    const Table = document.getElementById("Table");
    const Table1 = document.getElementById("Table1");
    for (let i = 0; i < countPerson; i++) {

        indexInput++;

        const Row = Table.insertRow();
        const Row1 = Table1.insertRow();

        Row.className = "Delete Row";


        const Num = Row1.insertCell();
        Num.className = "Num";
        Num.innerHTML = i + 1;

        const Cell = Row1.insertCell();

        Cell.innerHTML = PersonData[i].info.name;
        Cell.className = "NamePerson";

        Cell.id = i;
        //const InputName = document.createElement("input");

        // InputName.className = "RowInput";
        // InputName.type = 'text'
        // InputName.style.display = "none";
        // InputName.value = Cell.textContent;
        // Cell.appendChild(InputName);

        // Cell.addEventListener("click", function () {
        //     if (document.getElementById("Editing").checked) {
        //         Cell.firstChild.nodeValue = "";
        //         InputName.style.display = "inline-block";
        //         InputName.focus();
        //     }
        // });

        // InputName.addEventListener("blur", function () {
        //     if (document.getElementById("Editing").checked) {
        //         InputName.style.display = "none";
        //         Cell.firstChild.nodeValue = InputName.value;
        //         change_data_Name(Cell.id / countPerson, InputName.value)

        //     }
        // });
        // 1
        // InputName.addEventListener("keypress", function (event) {
        //     if (document.getElementById("Editing").checked) {
        //         if (event.key === "Enter") {
        //             InputName.style.display = "none";
        //             Cell.firstChild.nodeValue = InputName.value;
        //             change_data_Name(Cell.id / countPerson, InputName.value)
        //         }
        //     }
        // })
        if (user.Surname + " " + user.Name + " " + user.Secondname === PersonData[i].info.name) {
            Row.style.backgroundColor = "yellow";
            Cell.style.backgroundColor = "yellow";
            Num.style.backgroundColor = "yellow";

        }
    }
    if (PersonData.length > 0) {
        Object.keys(PersonData[0]).forEach(element => {
            let regex = /\d/;
            if (regex.test(element)) {
                var PersonGrades = [];
                for (let i = 0; i < countPerson; i++) {
                    PersonGrades.push(PersonData[i][element].Value);
                }
                LoadHeader(PersonData[0][element].Date, PersonData[0][element].Description);
                LoadTypeWork(PersonData[0][element].TypeWork);
                LoadGrade(PersonGrades);

                indexColumn++;
            }
        })
    }
}

export function DeleteTable() {
    const Rows = document.querySelectorAll(".Delete");
    Rows.forEach(element => {
        element.remove();
    });
    indexColumn = 0;
    countCell = 0;
    indexInput = 0;
    data = [];
}

function create_delete_Column() {
    const DeleteCol = document.getElementById("DeleteColumn").insertCell();
    DeleteCol.className = `Delete Column${indexColumn}`;
    DeleteCol.innerHTML = ".";
    DeleteCol.style.color = "rgba(0, 0, 0, 0)";
    DeleteCol.style.alignItems = "center";
    const DeleteButton = document.createElement("button");
    DeleteCol.onclick = function () {
        const Columns = document.querySelectorAll(`.${DeleteCol.className.slice(7)}`);
        Columns.forEach(element => {
            element.remove();
        })
        for (let i = 0; i < countPerson; i++) {
            for (let j = Number(`${DeleteCol.className.slice(13)}`); j < data.length - 1; j++) {
                PersonData[i][j] = PersonData[i][j + 1]

            }
            delete PersonData[i][data.length - 1];

        };
        indexColumn--;
        countCell -= countPerson;
        data.pop();
    };

    DeleteButton.style.display = 'none';
    DeleteCol.appendChild(DeleteButton);
}

async function AddColumn() {

    create_data();
    create_delete_Column();
    AddDate();
    AddTypeWork();
    AddDesciption();
    const elements = document.querySelectorAll('.Row');
    elements.forEach(element => {
        const Cell = element.insertCell();
        const GradeInput = document.createElement("input");

        Cell.id = countCell;
        Cell.className = `Column${indexColumn}`;

        countCell++;

        if (!Cell._clickFunc) {
            Cell._clickFunc = function () {
                if (document.getElementById("Editing").checked) {
                    Cell.firstChild.textContent = change_attendance(Cell.id);
                }
            };

        }
        Cell.className += " Grade";
        Cell.innerHTML = "+";
        Cell.addEventListener("click", Cell._clickFunc);
        GradeInput.value = Cell.textContent;
        GradeInput.style.display = "none";
        GradeInput.addEventListener("change", function () {
            if (!isNaN(GradeInput.value)) {
                change_data_Value(Cell.id % countPerson, Cell.className.replace(/Grades/, '').slice(6), GradeInput.value);
                Cell.style.backgroundColor="white";
                Cell.firstChild.textContent=GradeInput.value;
            }
            else{
                GradeInput.value=0;
                Cell.style.backgroundColor="#dc2626";
            }
        });
        Cell.appendChild(GradeInput);
    });



    indexColumn++;
}

function AddDesciption() {
    const Description = document.getElementById("Description").insertCell();

    Description.innerHTML = "Описание";

    Description.id = "Description" + indexColumn;
    Description.className = `Delete Column${indexColumn}`;

    Description.style.color = "black";
    Description.style.padding = "0px";
    Description.style.backgroundColor = "white";

    const Input = document.createElement("input");

    Input.style.display = "none";
    Input.style.border= "none";
    Input.style.width = "100%";
    Input.style.height = "100%";

    Description.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            Input.style.display = "block";
            Description.firstChild.textContent = "";
            Input.focus();
        }
    });
    Input.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                Input.style.display = "none";
                Description.firstChild.textContent = Input.value;
                change_data_desciption(Description.id.slice(11), Input.value);
            }
        }
    })
    Input.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {

            Input.style.display = "none";
            Description.firstChild.textContent = Input.value;
            change_data_desciption(Description.id.slice(11), Input.value);
        }
    })
    Description.appendChild(Input);
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
        "Экзамен",
        "Своё"
    ];
    const typevalue = [
        "Посещаемость",
        "Лекция",
        "Практика",
        "Лабораторная",
        "Экзамен",
        "Своё"
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
            TypeWork.firstChild.textContent = "";
            Work.style.display = "inline-block";
            Work.showPicker();
        }
    });

    Work.addEventListener("change", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.textContent = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
            var ColumnGrade = document.querySelectorAll(`.Column${TypeWork.id.slice(8)}.Grade`);
            if (ColumnGrade.length === 0) {
                ColumnGrade = document.querySelectorAll(`.Column${TypeWork.id.slice(8)}.Grades`);
            }

            ColumnGrade.forEach(element => {

                if (Work.options[Work.selectedIndex].text !== "Посещаемость") {
                    element.removeEventListener("click", element._clickFunc);
                    const Int = element.querySelector("input");

                    Int.style.display = 'inline-block';
                    Int.value = 0;
                    element.style.color="rgba(0,0,0,0)";
                    if (element.className === `Column${TypeWork.id.slice(8)} Grade`) {
                        element.className += "s";
                    }
                    
                }
                else {
                    const Int = element.querySelector("input");
                    Int.style.display = 'none';
                    element.style.color="rgba(0,0,0,1)";
                    element.firstChild.textContent = "+";
                    element.addEventListener("click", element._clickFunc);
                    element.className = String(element.className).replace("s", '');
                }
            });
        }
    });

    Work.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.textContent = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);

        }
    });
    TypeWork.appendChild(Work);
    change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
}

function LoadHeader(date, description) {
    create_data();
    create_delete_Column();
    LoadDate(date);
    LoadDesciption(description);
}

function LoadDesciption(description) {
    const Description = document.getElementById("Description").insertCell();

    

    Description.id = "Description" + indexColumn;
    Description.className = `Delete Column${indexColumn}`;

    Description.style.color = "black";
    Description.style.padding = "0px";
    Description.style.backgroundColor = "white";

    const Input = document.createElement("input");

    Input.style.display = "none";

    Input.style.border="none;"
    Input.style.width = "100%";
    Input.style.height = "100%";
    Description.innerHTML = description;
    Description.addEventListener("click", function () {
        if (document.getElementById("Editing").checked) {
            Input.style.display = "block";
            Input.value = Description.textContent;
            Description.firstChild.textContent = "";
            Input.focus();
        }
    });
    Input.addEventListener("keypress", function (event) {
        if (document.getElementById("Editing").checked) {
            if (event.key === "Enter") {
                Input.style.display = "none";
                Description.firstChild.textContent = Input.value;
                change_data_desciption(Description.id.slice(11), Input.value);
            }
        }
    })
    Input.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {

            Input.style.display = "none";
            Description.firstChild.textContent = Input.value;
            change_data_desciption(Description.id.slice(11), Input.value);
        }
    })
    Description.appendChild(Input);
}
function LoadDate(today) {
    const DateKey = document.getElementById("Keyword").insertCell();
    const normDate = today.slice(6) + "-" + today.slice(3, 5) + "-" + today.slice(0, 2)
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
        "Экзамен",
        "Своё"
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
            TypeWork.firstChild.textContent = "";
            Work.style.display = "inline-block";
            Work.showPicker();
        }
    });

    Work.addEventListener("change", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.textContent = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);
            var ColumnGrade = document.querySelectorAll(`.Column${TypeWork.id.slice(8)}.Grade`);
            if (ColumnGrade.length === 0) {
                ColumnGrade = document.querySelectorAll(`.Column${TypeWork.id.slice(8)}.Grades`);
            }

            ColumnGrade.forEach(element => {

                if (Work.options[Work.selectedIndex].text !== "Посещаемость") {
                    element.removeEventListener("click", element._clickFunc);
                    const Int = element.querySelector("input");

                    Int.style.display = 'inline-block';
                    Int.value = 0;
                    if (element.className === `Column${TypeWork.id.slice(8)} Grade`) {
                        element.className += "s";
                    }
                    element.element.style.color="rgba(0, 0, 0, 0)";
                }
                else {
                    const Int = element.querySelector("input");
                    Int.style.display = 'none';
                    element.style.color="rgba(0, 0, 0, 1)";
                    element.firstChild.textContent = "+";
                    element.addEventListener("click", element._clickFunc);
                    element.className = String(element.className).replace("s", '');
                }
            });
        }
    });

    Work.addEventListener("blur", function () {
        if (document.getElementById("Editing").checked) {
            Work.style.display = "none";
            TypeWork.firstChild.textContent = Work.options[Work.selectedIndex].text;
            change_data_TypeWork(TypeWork.id.slice(8), Work.options[Work.selectedIndex].text);

        }
    });
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
        const typework = document.getElementById(`TypeWork${Cell.className.slice(6)}`);

        countCell++;

        if (!Cell._clickFunc) {
            Cell._clickFunc = function () {
                if (document.getElementById("Editing").checked) {
                    Cell.firstChild.textContent = change_attendance(Cell.id);
                }
            };

        }
        const work = typework.querySelector("select");
        if (work.options[work.selectedIndex].text !== "Посещаемость") {
            Cell.className += " Grades";
            if (Number(Grades[cCell])) {
                Cell.innerHTML = Grades[cCell];
            }
            else {
                Cell.innerHTML = 0;
            }
        } else {

            Cell.className += " Grade";
            Cell.innerHTML = Grades[cCell];
            Cell.addEventListener("click", Cell._clickFunc);
        }
        GradeInput.value = Cell.textContent;
        GradeInput.style.display = "none";
        GradeInput.addEventListener("change", function () {
            if (!isNaN(GradeInput.value)) {
                change_data_Value(Cell.id % countPerson, Cell.className.replace(/Grades/, '').slice(6), GradeInput.value);
                Cell.style.backgroundColor="white";
                Cell.firstChild.textContent=GradeInput.value;
            }
            else{
                GradeInput.value=0;
                Cell.style.backgroundColor="#dc2626";
            }
            
        });
        cCell++;
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

async function create_edit() {
    const user = await get_User();
    if (user.Role !== "Студент") {
        if (document.getElementById('Editing').checked) {
            document.getElementById('Pass').style.display = "inline-block";
            document.getElementById('Presence').style.display = "inline-block";
            document.getElementById('Disease').style.display = "inline-block";
            document.getElementById("DeleteColumn").style.display = "table";
            document.getElementById("DeleteColumn1").style.display = "";
            const Grade = document.querySelectorAll(".Grades");
            Grade.forEach(element => {
                element.querySelector("input").style.display = "";
                element.style.color="rgba(0, 0, 0, 0)";
            });

        }
        else {
            document.getElementById('Pass').style.display = "none";
            document.getElementById('Presence').style.display = "none";
            document.getElementById('Disease').style.display = "none";
            document.getElementById("DeleteColumn").style.display = "none";
            document.getElementById("DeleteColumn1").style.display = "none";
            const Grade = document.querySelectorAll(".Grades");
            Grade.forEach(element => {
                const GradeInput = element.querySelector("input");
                GradeInput.style.display = "none";
                element.style.color="rgba(0, 0, 0, 1)";
                change_data_Value(element.id % countPerson, element.className.replace(/Grades/, '').slice(6), !isNaN(Number(GradeInput.value)) ? GradeInput.value : 0);
            });
        }
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
        Value: "+",
        Description: "",
    });

}

function change_data_date(id, date) {

    data[Number(id)].Date = date;
    for (let i = 0; i < countPerson; i++) {
        if (!PersonData[i][id]) {
            PersonData[i][id] = data[id];
        }

        PersonData[i][id].Date = date;
    }
}
function change_data_desciption(id, description) {

    data[Number(id)].Description = description;
    for (let i = 0; i < countPerson; i++) {
        if (!PersonData[i][id]) {
            PersonData[i][id] = data[id];
        }

        PersonData[i][id].Description = description;
    }
}
function change_data_TypeWork(id, typework) {
    data[id].TypeWork = typework;
    for (let i = 0; i < countPerson; i++) {
        if (!PersonData[i][id]) {
            PersonData[i][id] = data[id];
        }
        PersonData[i][id].TypeWork = typework;
    }
}
function change_new_data_Value() {
    for (let i = 0; i < indexColumn; i++) {
        var Column = document.querySelectorAll(`.Column${i}.Grade`);
        if (Column.length === 0) {
            Column = document.querySelectorAll(`.Column${i}.Grades`);
        }
        var j = 0;
        Column.forEach(item => {
            PersonData[j][i].Value = item.firstChild.textContent;
            j++
        });
    }
}
function change_data_Value(id, ind, grade) {
    data[Number(ind)].Value = grade;
    PersonData[id][Number(ind)].Value = grade;

}

// function change_data_Name(ind, Name) {
//     PersonData[ind].info.name = Name;
// }

