const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require("bcrypt");
const session = require("express-session");
const FileStore = require('session-file-store')(session);

const app = express();
const port = 3000;

const main_directory = "data/";
const session_dir = path.join(__dirname, "session");
fs.mkdirSync(session_dir, { recursive: true });

const fileStoreOptions = {
    path: session_dir,
    retries: 2,
    fileExtension: ".json",
    ttl: 3600,
    reapInterval: 3600,
    retryOnInitFail: false
};

const fileStore = new FileStore(fileStoreOptions);

// Add error handling to the store
fileStore.on('disconnect', () => console.log('Session store disconnected'));
fileStore.on('connect', () => console.log('Session store connected'));
fileStore.on('error', (error) => console.error('Session store error:', error));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: fileStore,
    cookie: {
        maxAge: 60 * 60 * 1000,
        sameSite: 'lax',
        secure: false
    }
}));

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
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
            console.log(data);
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
        if (entry.isDirectory() && fullPath.indexOf("sessions") === -1) {
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

app.get('/getgroups', (req, res) => {
    try {
        fs.mkdirSync(main_directory, { recursive: true });
        const folders = getAllFiles(main_directory);
        folders.shift();
        folders.shift();
        folders.shift();
        folders.shift();
        const new_folders = folders.map(item => item.slice(item.lastIndexOf('\\') + 1).replace(/.json/, ''));
        const groups = new_folders.filter(function (item, pos) {
            return new_folders.indexOf(item) == pos;
        });
        if (folders) {
            res.send(groups);
        }
        else {
            return;
        }
    }
    catch {
        console.error("Invalid getclass!!!");
        res.status(400).json({ status: "error", message: err.message });
    }
})

app.post('/registration', async (req, res) => {
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
            res.json({ status: "invlog" });
            return;
        }
        else {
            req.body.Password = await bcrypt.hash(req.body.Password, 10);
            data.push(req.body);
            const user = req.body;
            req.session.user = {
                Login: user.Login,
                Name: user.Name,
                Surname: user.SurName,
                Secondname: user.SecondName,
                Group: user.Group,
                Role: user.Role,
                Email: user.Email
            }
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ status: "error" });
                }
            });
            fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Successful ${req.body.Login}`);
            res.json({ status: "ok" });
        }
    }
    catch (err) {
        console.error("Invalid registration!!!");
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.post(`/authorization`, async (req, res) => {
    try {
        const dir = path.join(main_directory, "User.json");
        const file = fs.readFileSync(dir, 'utf8');
        const users = JSON.parse(file);
        const indexLogin = users.findIndex(user => user.Login === req.body.Login);
        if (indexLogin === -1) {
            console.log("Пользователь не зарегистрирован!!!");
            res.json({ status: "WrongLogin" });
            return;
        }
        const valid = await bcrypt.compare(req.body.Password, users[indexLogin].Password);
        if (valid) {
            const user = users[indexLogin];
            req.session.user = {
                Login: user.Login,
                Name: user.Name,
                Surname: user.SurName,
                Secondname: user.SecondName,
                Group: user.Group,
                Role: user.Role,
                Email: user.Email
            }
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ status: "error" });
                }
                res.json({ status: "login" });
            });
            console.log(`Login: ${user.Login} ${user.Email}`);
        }
        else {
            res.json({ status: "WrongPassword" });
            return;
        }

    }
    catch (err) {
        console.error("Invalid login!!!");
        res.status(404).json({ status: "error", message: err.message });
    }

})

app.get('/profile', (req, res) => {
    if (!req.session.user) return res.status(400).json({ status: 'not_logged_in' });
    res.json({ status: 'ok', user: req.session.user });
});

app.post('/sendgroup', (req, res) => {
    try {
        const dir = path.join(main_directory, "User.json");
        const file = fs.readFileSync(dir, 'utf8');
        const users = JSON.parse(file);
        const indexLogin = users.findIndex(user => user.Login === req.session.user.Login);
        if (indexLogin !== -1) {
            console.log(req.body);
            users[indexLogin].Group = req.body;
            fs.writeFileSync(dir, JSON.stringify(users, null, 2), 'utf-8');
            req.session.user.Group = req.body;
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ status: "error" });
                }
                res.json({ status: "ok" });
            });;
        } else {
            res.status(404).json({ status: "user_not_found" });
        }
    }
    catch (err) {
        console.error("Error send group!!!");
        res.status(400).json({ status: 'not_send_group' });
    }
});

app.post('/logout', (req, res) => {
    if (req.session.user) {
        console.log(`Logout: ${req.session.user.Login} ${req.session.user.Email}`);


        const userInfo = { ...req.session.user };

        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ status: 'error' });
            }

            res.clearCookie('connect.sid', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax'
            });

            console.log(`Session destroyed for user: ${userInfo.Login}`);
            res.json({ status: 'logout' });
        });
    } else {

        res.json({ status: 'logout' });
    }
});
app.post(`/changerole`, (req, res) => {
    try {
        const dir = path.join(main_directory, "User.json");
        const file = fs.readFileSync(dir, 'utf8');
        const users = JSON.parse(file);
        const indexLoginnew = users.findIndex(user => user.Login === req.body.login);
        const indexLogin = users.findIndex(user => user.Login === req.session.user.Login);
        if (indexLoginnew !== -1 && req.body.login!==req.session.user.Login) {
            users[indexLoginnew].Role = "Староста";
            users[indexLogin].Role = "Студент";
            fs.writeFileSync(dir, JSON.stringify(users, null, 2), 'utf-8');
            req.session.user.Role = "Студент";
            req.session.save(err => {
                if (err) {
                    return res.status(500).json({ status: "error" });
                }
                res.json({ status: "ok" });
            });
        }
        else {
            console.log(12);
        }
    }
    catch (err) {
        console.error("Invalig login");
        res.status(404).json({ status: "not" });
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