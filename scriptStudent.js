document.getElementById("AddStudent").onclick = fLoadClasses;


export async function parseJSONStudent(group) {
    const Student = await fetch(`/loadstudent?group=${group}`);
    const jsonStudent = await Student.json();
    return jsonStudent;
}


export async function fLoadClasses() {
    const Classes = await fetch("/loadclasses");
    const jsonClasses = await Classes.json();
    return jsonClasses;

}

