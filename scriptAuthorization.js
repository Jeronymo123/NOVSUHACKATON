document.getElementById("LogBut").onclick = toTable;
document.getElementById("LogBut").focus();
async function toTable() {
    const response = await fetch(`/authorization`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            Login: document.getElementById("Login").value,
            Password: document.getElementById("PasswordLog").value
        })
    });
    const res = await response.json();
    if (res.status === "login") {
        window.location.href = "dashboard.html";
    }
    else {
        document.getElementById("ErrorLogin").style.display = "";
        document.getElementById("ErrorPass").style.display = "";
    }
}

