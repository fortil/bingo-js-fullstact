const createNewBingoNumber = (list) => {
  const bingoNumbers = new Array(75).fill(1).map((_, i) => i + 1);
  const numResponse = bingoNumbers[Math.floor(Math.random() * bingoNumbers.length)];
  if (!list.includes(numResponse)) {
    return numResponse;
  } else {
    return createNewBingoNumber(bingoNumbers);
  }
}

const get = db => (req, res) => {
  const lastNumber = req.params.last ? +req.params.last : null;
  const numbers = db.get('numbers').value();
  let numResponse = numbers.length ? numbers[numbers.length - 1] : null;
  if (lastNumber && numResponse) {
    const idx = numbers.findIndex(n => n === lastNumber);
    if (idx && idx > -1 && idx < numbers.length - 1) {
      numResponse = numbers[idx];
    }
    if (idx === numbers.length - 1) {
      numResponse = createNewBingoNumber(numbers);
    }
  }

  // create numbers if not exist
  if (!numResponse) {
    numResponse = createNewBingoNumber([]);
  } else {
    if (!lastNumber) {
      return res.json({ data: db.get('numbers').value(), time: (new Date()).getTime() })
    }
  }


  db.get('numbers')
    .push(numResponse)
    .last()
    .write().then(() => {
      res.json({ data: numResponse, time: (new Date()).getTime() })
    });
}

const playAgain = db => (req, res) => {
  db.set('numbers', []).write().then(() => {
    res.json({ data: 'ok', time: (new Date()).getTime() })
  })
}

const checkWinner = db => (req, res) => {
  let numbers = req.body.numbers ? req.body.numbers : null;
  console.log('====>', req.body.numbers)
  
  if (!numbers || !numbers.length) {
    res.json({ data: 'loser', time: (new Date()).getTime() });
  } else {
    numbers = numbers.sort();
    const dbNumbers = (db.get('numbers').value()).sort();
    if (JSON.stringify(numbers)===JSON.stringify(dbNumbers)) {
      res.json({ data: 'winner', time: (new Date()).getTime() });
    } else {
      res.json({ data: 'loser', time: (new Date()).getTime() });
    }
  }
}

module.exports = {
  checkWinner,
  playAgain,
  get,
}