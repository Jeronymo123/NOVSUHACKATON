const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

const main_directory = "data/";

app.use(express.json());

app.use(express.static(__dirname))

app.post('/savestudent', (req, res) => {
    const dir = path.join(__dirname, `data/${req.body.info.group}`);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "Inf.json");
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
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error("Invalid write file!!!");
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.get('/loadstudent', (req, res) => {
    try {
        const file = path.join(main_directory + req.query.group, "Inf.json");
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

app.get('/loadclasses', (req, res) => {
    const file = path.join(main_directory, "Classes.json");
    const folders = fs.readdirSync(main_directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(dirent.name));
    fs.writeFileSync(file, JSON.stringify(folders, null, 2), 'utf8');
    if (fs.existsSync(file)) {
        const data = fs.readFileSync(file, "utf8");
        res.send(data);
    }
    else {
        res.send("{}");
    }
});
function GeneratorFile() {
    const Person = {
        id: 0,
        info: {
            name: "",
            group: 5092,
        },
        study: {
            index: 0,
            Date: "DD.MM.YYYY",
            TypeWork: "typeWork",
            Value: "+"
        }
    }
    let data = [];
    for (let i = 0; i < 19; i++) {
        Person.id = i;
        data.push(Person);
    }
    fs.writeFileSync("Person.json", JSON.stringify(data, null, 2), 'utf8');
}
GeneratorFile();
app.listen(port, () => console.log(`127.0.0.1:${port}`));