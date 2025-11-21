document.getElementById("RegBut").onclick = toTable;

async function toTable() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    document.getElementById("ErrorPassword").style.display="none";
    document.getElementById("ErrorEmail").style.display="none";
    if (document.getElementById("PasswordReg").value.length >= 8 && emailRegex.test(document.getElementById("Email").value)) {
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
        const response = await fetch(`/registration`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        if (res.status === "invlog") {
            console.log("inv");
        }
        else{
            window.location.href="dashboard.html";
        }
    }
    else{
        document.getElementById("ErrorPassword").style.display="inline";
        document.getElementById("ErrorEmail").style.display="inline";
    }
}
