document.getElementById("RegBut").onclick = toTable;

async function toTable() {

    let bool = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(document.getElementById("Email").value)) {
        document.getElementById("ErrorEmail").style.display = "inline-block";
        bool = false;
    }
    if (document.getElementById("PasswordReg").value <= 8) {
        document.getElementById("ErrorPassword").style.display = "inline-block";
        bool = false;
    }
    if (document.getElementById("Name").value <= 3) {
        document.getElementById("ErrorName").style.display = "inline-block";
        bool = false;
    }

    if (document.getElementById("Surname").value <= 3) {
        document.getElementById("ErrorSurname").style.display = "inline-block";
        bool = false;
    }

    if (document.getElementById("Secondname").value <= 3) {
        document.getElementById("ErrorSecondName").style.display = "inline-block";
        bool = false;
    }

    if (document.getElementById("LogReg").value <= 3) {
        document.getElementById("ErrorLog").style.display = "inline-block";
        bool = false;
    }
    var Role;
    if (document.getElementById("Role").options[document.getElementById("Role").selectedIndex].value !== "professor") {
        Group = document.getElementById("GrouP").options[document.getElementById("GrouP").selectedIndex].text;
    }

    if (!bool) {
        return; 
    }
    if (document.getElementById("Doc").checked) {
        const data = {
            Role: document.getElementById("Role").options[document.getElementById("Role").selectedIndex].textContent,
            Group: Group,
            Login: document.getElementById("LogReg").value,
            Email: document.getElementById("Email").value,
            Password: document.getElementById("PasswordReg").value,
            Name: document.getElementById("Name").value,
            SurName: document.getElementById("Surname").value,
            SecondName: document.getElementById("Secondname").value
        };
        const response = await fetch(`/registration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        if (res.status === "invlog") {
            document.getElementById("ErrorLog").style.display = "inline-block";
            bool = false;
        }
        else {
            window.location.href = "dashboard.html";
        }
    }
    else {
        document.getElementById("Check").style.color = "red";
        document.getElementById("Check").style.fontWeight = "bold";
    }


}
async function load() {
    const groups = await fetch("/getgroups");
    const res_groups = await groups.json();
    res_groups.forEach(element => {
        const Option = document.createElement("option");
        Option.value = element;
        Option.text = element;
        document.getElementById("GrouP").add(Option);
    });
    Role.addEventListener("change", function () {
        if (Role.options[Role.selectedIndex].value === "professor") {
            document.getElementById("Group").style.display = "none";

        }
        else {
            document.getElementById("Group").style.display = "";
        }
    });
}
window.onload = load;
