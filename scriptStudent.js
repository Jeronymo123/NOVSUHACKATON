document.getElementById("AddStudent").onclick = fLoadClasses;


export async function parseJSONStudent(subject, group) {
    const Student = await fetch(`/loadstudent?subject=${subject}&group=${group}`);
    const jsonStudent = await Student.json();
    return jsonStudent;
}


export async function fLoadClasses() {
    const Classes = await fetch("/loadclasses");
    const jsonClasses = await Classes.json();
    return jsonClasses;

}

