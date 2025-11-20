document.getElementById("LogBut").onclick=toTable;

function toTable(){
    fetch(`/authorization?login=${document.getElementById("Login").value}&password=${document.getElementById("PasswordLog").value}`)
    window.location.href="table.html";
}