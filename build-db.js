var request = require('request-promise'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio');

var Database = require('./database');

const URL_BASE = 'https://fr.wikipedia.org';

main();

function main() {
    var db = new Database();

    db
        .load()
        .then(() => getLinks(db))
        .then(links => {
            var p = Promise.resolve([]);
            var N = links.length;

            links.forEach((l, idx) => {
                p = p.then(prevData => {
                    process.stdout.write(`Getting ${idx+1}/${N}...\r`);
                    return getData(l, db)
                        .then(data => {
                            process.stdout.write(`Got ${idx+1}/${N} links...\r`);
                            prevData.push(data);
                            return prevData;
                        });
                });
            });

            return p;
        })
        .then(() => console.log('\n\nAll Done...'))
        .catch(e => setTimeout(() => { throw e; }));  
}

function getLinks(db) {
    const KEY = 'LINKS_DB';

    var savedLinks = db.get(KEY);

    if (savedLinks) return Promise.resolve(savedLinks);

    return fetchLinks()
        .then(links => {
            db.set(KEY, links);
            return db.save();
        })
        .then(() => db.get(KEY));
}

function fetchLinks() {
    const URL = '/wiki/Liste_de_fromages_fran%C3%A7ais';

    return request(URL_BASE + URL)
        .then(body => {
            var $ = cheerio.load(body);

            var links = $('div.colonnes li > a:first-child')
                    .filter((i, e) => !$(e).hasClass('new'))
                    .map((i, e) => $(e).attr('href'))
                    .get();

            return links;
        });
}

function getData(link, db) {
    const KEY = 'LINK_DB__' + link;

    var savedData = db.get(KEY);

    if (savedData) return Promise.resolve(savedData);

    return fetchData(link)
        .then(data => {
            db.set(KEY, data);
            return db.save();
        })
        .then(() => db.get(KEY));
}

function fetchData(link) {
    return request(URL_BASE + link)
        .then(body => {
            var $ = cheerio.load(body);

            var title = $('h1#firstHeading').text();

            var contents = $('#mw-content-text > *');
            var endHeader = false,
                headerElts = [],
                headerEltsHTML = [],
                infobox,
                idx = 0;

            while (!endHeader && idx < contents.length) {
                var e = contents[idx];

                if (e.attribs.id === 'toc' || e.name === 'h2') {
                    endHeader = true;
                } else if (e.name === 'p') {
                    headerElts.push($(e).text());
                    headerEltsHTML.push($(e).html());
                } else if (e.attribs.class === 'infobox_v3') {
                    infobox = e;
                }

                idx++;
            }

            return {
                link: URL_BASE + link,
                title: title,
                description: headerElts.join('\n\n'),
                descriptionHTML: '<p>' + headerEltsHTML.join('</p><p>') + '</p>',
                image: getInfoboxImage($, infobox),
                details: getInfoboxDetails($, infobox)
            };
        });
}

function getInfoboxImage($, infobox) {
    var url = $(infobox).find('.images img').first().attr('src');

    return /Blue_pencil/gi.test(url) ? '' : url;
}

function getInfoboxDetails($, infobox) {
    var lines = $(infobox).find('table tr')
            .map((idx, e) => ({
                key: $(e).find('th').text().trim(),
                value: capitalize($(e).find('td').text().trim())
            }))
            .get();


    return lines;
}

function capitalize(s) {
    return s.split('').map((c,i) => i ? c : c.toUpperCase()).join('');
}
