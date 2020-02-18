const express = require('express')
const bodyParser = require('body-parser')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const { numbers, card } = require('./routes');
const { findEquals } = require('./utils');

const version = '/api/v1';

const url = route => `${version}${route}`;

// Create server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create database instance and start server
const adapter = new FileAsync('db.json')
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (_, res) => res.json({ data: 'Hello world', time: (new Date()).getTime() }));

const App = low(adapter)
  .then(db => {
    const bingo = ['b','i','n','g','o'];
    const columns = {};
    for (let i = 0; i < bingo.length; i++) {
      columns[bingo[i]] = [];
      for (let e = 1; e < 16; e++) {
        if (i < 1) {
          columns[bingo[i]].push(e);
        } else {
          const lastNumber = columns[bingo[i - 1]][columns[bingo[i - 1]].length - 1];
          columns[bingo[i]].push(e + lastNumber);
        }
        
      }
    }

      // Set db default values
      db.defaults({
        columns,
        cards: [],
        numbers: []
      }).write();

      /* 
      Personal mixin to find in deep
      */
    db._.mixin({
      searchInDeep: (array, { exp, equalTo }) => {
        const filter = findEquals(exp, equalTo);
        const resp = array.filter(filter);
        return resp;
      }
    });
    // All Routes
    // create the cards to be rendered in the front
    app.get(url('/cards/del/:id'), card.remove(db));
    app.get(url('/cards/:id'), card.find(db));
    app.get(url('/cards'), card.getAll(db));
    app.post(url('/cards'), card.get(db));
    // get the numbers for each card
    app.get(url('/numbers/:last'), numbers.get(db));
    app.get(url('/numbers/'), numbers.get(db));
    // reset the numbers saved in the bingo
    app.get(url('/play-again'), numbers.playAgain(db));
    // check the winner with a body of the array of numbers
    app.post(url('/check-winner'), numbers.checkWinner(db));
  })
  .then(() => app);
  
module.exports = App;