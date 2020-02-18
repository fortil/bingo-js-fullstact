const shortid = require('shortid')

const findCard = (db, id) => {
  return db.read('cards')
    .find(id ? { id } : { id: null })
    .value()
}

const getRandomWidthOut = (list, noThat) => {
  const num = list[Math.floor(Math.random() * list.length)];
  if (noThat.includes(num)) {
    return getRandomWidthOut(list, noThat);
  } else {
    return num;
  }
};

const createCard = (db) => {
    const columns = db.get('columns').value();
    const bingoKeys = Object.keys(columns);
    const card = {};
    for (let e = 0; e < 5; e++) {
      for (let i = 0; i < bingoKeys.length; i++) {
        const letters = columns[bingoKeys[i]];
        const currentNumbers = card[bingoKeys[i]] || [];
        let num = getRandomWidthOut(letters, currentNumbers);
        if (!card[bingoKeys[i]]) {
          card[bingoKeys[i]] = [num];
        } else {
          card[bingoKeys[i]].push(num);
        }
      }
    }

    for (let i = 0; i < bingoKeys.length; i++) {
      const numbers = card[bingoKeys[i]];
      card[bingoKeys[i]] = numbers.sort();
      if (bingoKeys[i] === 'n') {
        card[bingoKeys[i]][2] = null;
      }
    }
    return db.get('cards')
      .push({ id: shortid.generate(), card })
      .last()
      .write().then(card => card)
}

const getAll = db => (_, res) => {
  const cards = db.read('cards').value()
  res.json({ data: cards, time: (new Date()).getTime() })
}

const get = db => (_, res) => {
  createCard(db).then(card => {
    res.json({ data: card, time: (new Date()).getTime() });
  })
}

const find = db => (req, res) => {
  let card = {}
  if (req.params.id) {
    card = findCard(db, req.params.id)
  }
  res.json({ data: card, time: (new Date()).getTime() })
}

const remove = db => (req, res) => {
  if (!req.params || !req.params.id) {
    return res.status(400).json('Doesnt exist any body or name on request')
  }

  db.read('cards')
    .remove({ id: req.params.id })
    .last()
    .write()
    .then(card => {
      res.json({ data: card, time: (new Date()).getTime() })
    })
}

module.exports = {
  remove,
  getAll,
  find,
  get
}