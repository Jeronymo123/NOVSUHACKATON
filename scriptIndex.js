document.getElementById("Enter").onclick = clickButton;

async function clickButton() {
    const response = await fetch('/profile', { credentials: "include" });
    const res = await response.json();
    if(res.status==="ok"){
        window.location.href="dashboard.html";
    }
    else{
        window.location.href="entry_form.html";
    }
}