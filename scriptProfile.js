document.getElementById("Logout").onclick = Logout;

async function Logout() {
    const response = await fetch("/logout", { method: "POST", credentials: "include", });
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

async function profile() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();
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
        }
    }
    else {
        window.location.href = "entry_form.html";
    }
}
window.onload = profile;