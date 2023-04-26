const express = require('express');
const bodyParser = require('body-parser');
const md5 = require('md5');
const moment = require('moment');
const dbObj = require('./db');
require('dotenv').config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pub = process.env.MARVEL_PUB_KEY;
const pri = process.env.MARVEL_PRI_KEY;

app.get('/getallcharacters', async (req: any, res: any) => {
  const origin = req.get('origin');

  res.set('Access-Control-Allow-Origin', origin);

  dbObj.returnCharacters(
    (results: any) => {
      res.set('Content-Type', 'application/json');
      res.status(200);
      res.write(JSON.stringify(results));
      res.send();
    },
    (error: any) => {
      console.error(error);
      res.status(500);
    }
  );
});

app.get('/comics', async (req: any, res: any) => {
  const origin = req.get('origin');
  const characterID = req.query.id;
  const offset = req.query.offset;

  res.set('Access-Control-Allow-Origin', origin);
  try {
    const ts = new moment().unix();
    const hash = md5(ts + pri + pub);
    const url = `http://gateway.marvel.com/v1/public/characters/${characterID}/comics?&apikey=${pub}&hash=${hash}&ts=${ts}&offset=${offset}`;
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        res.status(200);
        res.write(JSON.stringify(data));
        res.send();
      });
    //if offset is equal to 0 they have requested a new character
    if (offset == 0) {
      dbObj.incrementCharacterClick(
        characterID,
        (results: any) => {

        },
        (error: any) => {
          console.error(error);
        }
      );
    }
  } catch (err) {
    res.json([{ error: 'Comic not found' }]);
    console.error(err);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
