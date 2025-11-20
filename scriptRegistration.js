document.getElementById("RegBut").onclick = toTable;

function generateWindow() {
    const RoleSelect = document.getElementById("Role");

    const Role = [
        "Студент",
        "Преподаватель"
    ];

    Role.forEach(item => {
        const Option = document.createElement("option");
        Option.text = item;
        Option.value = item;

        RoleSelect.add(Option);
    });
    RoleSelect.selectedIndex = 0;
}

function toTable() {
    const data = {
        Role: document.getElementById("Role").options[document.getElementById("Role").selectedIndex].textContent,
        Group: document.getElementById("Group").value,
        Login: document.getElementById("LogReg").value,
        Email: document.getElementById("Email").value,
        Password: document.getElementById("PasswordReg").value,
        Name: document.getElementById("Name").value,
        SurName: document.getElementById("Surname").value,
        SecondName: document.getElementById("Secondname").value
    };
    fetch(`/registration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
}


generateWindow();