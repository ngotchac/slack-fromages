var fs = require('fs');

fs.readFile('./data/db.json', (err, json) => {
    if (err) throw err;

    var db = JSON.parse(json);

    var fromages = Object.keys(db) 
        .filter(k => k !== 'LINKS_DB')
        .map(k => db[k]);

    var wrongs = fromages
        .filter(f => {
            return !f.details.find(d => ['Lait', 'P\u00e2te'].indexOf(d.key) >= 0);
        });

    wrongs.forEach(f => {
        console.log(f.title);
        console.log(f.link);
        console.log('-------------------------------------------');
        console.log(f.description);
        console.log('');
    });
});
