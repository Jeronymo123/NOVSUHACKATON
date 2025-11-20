const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;

const main_directory = "data/";

app.use(express.json());

app.use(express.static(__dirname))

app.post('/savestudent', (req, res) => {
    const dir = path.join(__dirname, `data/${req.query.subject}`);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${req.query.group}`);
    try {
        console.log(req.body);
        try {
            const FileContent = fs.readFileSync(file, 'utf8');
            const parsed = FileContent ? JSON.parse(FileContent) : [];
            var data = Array.isArray(parsed) ? parsed : [parsed];
        }
        catch (err) {
            console.warn("Error");
        }
        const indexFind = data.findIndex(item => item.id === req.body.id);
        if (indexFind !== -1) {
            data[indexFind] = req.body;
        }
        else {
            data.push(req.body);
        }
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successful ${req.body.info.group}`);
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error("Invalid write file!!!");
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.get('/loadstudent', (req, res) => {
    try {
        const file = path.join(main_directory + req.query.subject, req.query.group);
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, "utf8");
            res.send(data);
        }
        else {
            res.send("{}");
        }
    }
    catch (err) {
        console.error("Invalid group");
        res.status(400).json({ status: "error", message: err.message })
    }
});

function getAllFiles(dir, result = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, result);
        } else {
            result.push(fullPath);
        }
    }

    return result;
}

app.get('/loadclasses', (req, res) => {
    try {
        fs.mkdirSync(main_directory, { recursive: true });
        const file = path.join(main_directory, "Classes.json");

        const folders = getAllFiles(main_directory);
        folders.shift();
        folders.shift();
        fs.writeFileSync(file, JSON.stringify(folders, null, 2), 'utf8');
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, "utf8");
            res.send(data);
        }
        else {
            res.send("{}");
        }
    }
    catch (err) {
        console.error("Invalid reg!!!");
        res.status(400).json({ status: "error", message: err.message });
    }

});

app.post('/registration', (req, res) => {


    try {
        fs.mkdirSync(main_directory, { recursive: true });
        const file = path.join(main_directory, "User.json");
        console.log(req.body);
        var data = [];
        try {
            const FileContent = fs.readFileSync(file, 'utf8');
            const parsed = FileContent ? JSON.parse(FileContent) : [];
            data = Array.isArray(parsed) ? parsed : [parsed];
        }
        catch (err) {
            console.warn("Error");
        }
        const indexFind = data.findIndex(user => user.Login === req.body.Login);
        if (indexFind !== -1) {
            console.log("Пользователь уже зарегистрирован!!!");
            return;
        }
        else {
            data.push(req.body);
        }
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successful ${req.body.Login}`);
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error("Invalid registration!!!");
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.get('/login', (req, res) => {
    try{
        const file = path.join(main_directory, "User.json");
    }   
    catch{
        console.error("Invalid login!!!");
        res.status(400).json({ status: "error", message: err.message });
    }

})
// function GeneratorFile() {
//     const Person = {
//         id: 0,
//         info: {
//             name: "",
//             group: 5092,
//         },
//         study: {
//             index: 0,
//             Date: "DD.MM.YYYY",
//             TypeWork: "typeWork",
//             Value: "+"
//         }
//     }
//     let data = [];
//     for (let i = 0; i < 19; i++) {
//         Person.id = i;
//         data.push(Person);
//     }
//     fs.writeFileSync("Person.json", JSON.stringify(data, null, 2), 'utf8');
// }
// GeneratorFile();


app.listen(port, () => console.log(`127.0.0.1:${port}`));