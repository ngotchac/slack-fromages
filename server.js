var express = require('express');

var Database = require('./database');

const PORT = process.env.PORT || 3000;

var db = new Database();

var app = express();

app.get('/fromages', (req, res) => {
    res.send(getFromages());
});

app.get('/fromage', (req, res) => {
    var fromages = getFromages();
    var idx = Math.floor(Math.random() * fromages.length);

    res.send(fromages[idx]);
});

function getFromages() {
    var allDb = db.getAll();

    var fromages = Object.keys(allDb)
            .filter(k => k !== 'LINKS_DB')
            .map(k => allDb[k]);

    return fromages;
}

db
    .load()
    .then(() => {
        app.listen(PORT, () => {
            console.log('[Fromage - Slack] Listenening on port', PORT);
        });
    });
