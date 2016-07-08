var express = require('express'),
    bodyParser = require('body-parser');

var Database = require('./database');

const PORT = process.env.PORT || 3000;

var db = new Database();

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/fromages', (req, res) => {
    res.send(getFromages());
});

app.get('/fromage', (req, res) => {
    var fromages = getFromages();
    var idx = Math.floor(Math.random() * fromages.length);

    res.send(fromages[idx]);
});

app.post('/get-fromage', (req, res) => {
    var fromages = getFromages();
    var idx = Math.floor(Math.random() * fromages.length);

    var fromage = fromages[idx];
    var token = req.body.token;

    res.send({
        attachments: [{
            title: fromage.title,
            title_link: fromage.link,
            text: fromage.description,
            fields: fromage.details.map(d => ({
                title: d.key,
                value: d.value
            })),
            image_url: 'https:' + fromage.image
        }]
    });
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
