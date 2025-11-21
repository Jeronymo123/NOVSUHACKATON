document.getElementById("Logout").onclick = Logout;

async function Logout() {
    const response = await fetch("/logout", { method: "POST",  credentials: "include",});
    const res = await response.json();
    if (res.status === "logout") {
        window.location.href = "entry_form.html";
    }
}

async function profile() {
    const response = await fetch("/profile", { credentials: "include" });
    const res = await response.json();
    if (res.status === "ok") {
        document.querySelectorAll("#NameProfile").forEach(item=>{
            item.textContent=res.user.Surname+" "+res.user.Name;
        });

    }
    else{
        window.location.href = "entry_form.html";
    }
    console.log(res.user.Name);
}
window.onload = profile;