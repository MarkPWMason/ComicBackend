"use strict";
const mysql = require('mysql');
require('dotenv').config();
let db;
/*
 - try allows me to write code that may fail and catches it if it does fail. Then in the catch I can handle the error.
 - db is a variable that stores my connection to my database, the object i am passing to mySQL.createConnection is my credentials to access my database.
 - createUser is a function that takes a username and password and passes them into a prepared insert statement.
 - in node module.exports allows me to share functions between js files.
*/
try {
    db = mysql.createConnection({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USER,
        password: process.env.MY_SQL_PASSWORD,
        database: process.env.MY_SQL_DATABASE,
    });
    db.connect();
}
catch (error) {
    console.error('error ', error);
}
const returnCharacters = (callback, errorCallback) => {
    /*
    Select character properties and clicks and do a left join on characters to popularity based on character_id and then sort by clicks in DESC order and if
    there is no clicks then its null so it is unaffected and not ordered
    */
    db.query('SELECT characters.character_id, characters.character_name, popularity.clicks FROM characters LEFT JOIN popularity ON characters.character_id = popularity.character_id ORDER BY popularity.clicks DESC', function (error, results) {
        if (error) {
            errorCallback(error);
        }
        console.log(results);
        const mappedResults = results.map((r) => {
            return {
                id: r.character_id,
                value: r.character_name,
                label: r.character_name
            };
        });
        callback(mappedResults);
    });
};
const incrementCharacterClick = (character_id, callback, errorCallback) => {
    db.query('SELECT * FROM popularity WHERE character_id = ?', character_id, function (error, results) {
        if (error) {
            errorCallback(error);
        }
        else {
            if (results.length === 0) {
                //Insert row
                db.query('INSERT INTO popularity (character_id, clicks) VALUES (?, ?)', [character_id, 1], function (insertErr, insertRes) {
                    if (insertErr && insertRes.affectedRows !== 1) {
                        errorCallback(insertErr);
                    }
                    else {
                        callback(insertRes);
                    }
                });
            }
            else {
                //if row does exist update row
                db.query('UPDATE popularity SET clicks = ? WHERE character_id = ?', [results[0].clicks + 1, character_id], function (updateErr, updateRes) {
                    if (updateErr && updateRes.affectedRows !== 1) {
                        errorCallback(updateErr);
                    }
                    else {
                        callback(updateRes);
                    }
                });
            }
        }
    });
};
module.exports = {
    returnCharacters: returnCharacters,
    incrementCharacterClick: incrementCharacterClick,
};
