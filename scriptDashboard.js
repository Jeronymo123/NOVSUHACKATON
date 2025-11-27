document.getElementById("Logout").onclick = Logout;

async function Logout() {
    const response = await fetch("/logout", { method: "POST",  credentials: "include",});
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

async function get_User() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();

    if (res.status === "ok") {
        return res.user;
    } else {
        window.location.href = "entry_form.html"
    }
}

async function profile() {
    const user = await get_User();
    
    document.querySelectorAll("#NameProfile").forEach(item=>{
        item.textContent = user.Surname + " " + user.Name;
    });
    document.getElementById("NameProfileMain").textContent = user.Surname + " " + user.Name;

    // Проверка роли пользователя по вашей логике
    if (user.Role === "Преподаватель") {
        document.getElementById("teacherStats").style.display = "grid";
    }
    
    console.log(user.Name);
}
window.onload = profile;