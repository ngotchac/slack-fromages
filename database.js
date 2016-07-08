var fs = require('fs'),
    path = require('path');

module.exports = class Database {

    constructor() {
        this.DB_PATH = path.resolve('./data/db.json');
        this.db = {};
    }

    load() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.DB_PATH, (err, json) => {
                if (err && err.code === 'ENOENT') return resolve();
                else if (err) return reject(err);

                try {
                    this.db = JSON.parse(json);
                    resolve();
                } catch (e) {
                    return reject(e);
                }
            });
        });
    }

    save() {
        return new Promise((resolve, reject) => {
            try {
                var json = JSON.stringify(this.db);

                fs.writeFile(this.DB_PATH, json, err => {
                    if (err) return reject(err);
                    resolve();
                });
            } catch (e) {
                return reject(e);
            }
        });
    }

    get(key) {
        return this.db[key];
    }

    set(key, value) {
        this.db[key] = value;
    }

    getAll() {
        return this.db;
    }

}