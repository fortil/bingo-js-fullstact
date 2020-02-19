import React, { useState, useEffect } from 'react';
import './App.css';

const HOST = 'http://localhost:8080/api/v1';

function RenderCard({ card, id, numbers }) {
  const getTd = (bingoKeys, i) => {
    const tds = [];
    for (let e = 0; e < card[bingoKeys[0]].length; e++) {
      const num = card[bingoKeys[e]][i];
      const isNum = numbers.includes(num);
      tds.push(<td key={`${e}-${i}${id}`} className={isNum ? 'is-number' : ''}>{num}</td>);
    }
    return tds;
  }
  const getTr = () => {
    const bingoKeys = Object.keys(card);
    const tds = [];
    for (let i = 0; i < bingoKeys.length; i++) {
      tds.push(<tr key={`${i}${id}`} >{getTd(bingoKeys, i)}</tr>);
    }
    return tds;
  }
  const getTh = () => Object.keys(card).map((e, i) => <th key={i + '-' + id}>{e}</th>)
  return (<table>
    <thead>
      <tr>{getTh()}</tr>
    </thead>
    <tbody>
      {getTr()}
    </tbody>
  </table>);
}

function App() {
  const [start, getStart] = useState(false);
  const [card, setCard] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [couldWin, setCouldWin] = useState(false);
  const [ImWinner, setImWinner] = useState(false);
  const [ownNumbers, setOwnNumbers] = useState([]);

  const click = () => {
    getStart(true);
  }
  const getNumber = () => {
    const lastNumber = numbers.length ? numbers[numbers.length - 1] : null
    fetch(`${HOST}/numbers${lastNumber ? `/${lastNumber}` : '/'}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(r => r.json()).then(({ data }) => {
      const newNumbers = numbers.concat(data);
      const count = newNumbers.filter(n => ownNumbers.includes(n));
      if (count.length >= 24) {
        setCouldWin(true);
      }
      setNumbers(newNumbers);
    });
  }
  const checkWinner = () => {
    fetch(`${HOST}/check-winner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numbers: ownNumbers })
    }).then(r => r.json()).then(({ data }) => {
      setImWinner(data === 'winner');
      if (data === 'winner') {
        window.alert('You won!!!');
      } else {
        window.alert('You lost!!!'); 
      }
      fetch(`${HOST}/play-again`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(r => r.json()).then(() => {
        setImWinner(false);
        setOwnNumbers([]);
        setCouldWin(false);
        setNumbers([]);
        setCard(null);
        getStart(false);
      });

    });
  }

  useEffect(() => {
    if (start) {
      fetch(`${HOST}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(r => r.json()).then(({ data }) => {
        setCard(data);
        const bingoKeys = Object.keys(data.card);
        const nums = [];
        for (let i = 0; i < bingoKeys.length; i++) {
          const letter = data.card[bingoKeys[i]];
          nums.push(...letter);
        }
        setOwnNumbers(nums.filter(e => !!e));
      });
    }
  }, [start]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bingo!</h1>
      </header>
      <body>
        { !start ? <button onClick={click}>Start bingo</button> : ''}
        { start && card ? <div className="card"><RenderCard {...card} numbers={numbers} /></div> : ''}
        { start && card ? <button onClick={getNumber}>Get a number</button> : ''}
        { start && card && numbers ? <div className={'text'}>The numbers got are: <br></br><div className={'numbers'}>{numbers.join(',')}</div></div>: ''}
        { start && card && couldWin ? <button onClick={checkWinner}>Check winner!</button> : ''}
      </body>
    </div>
  );
}

export default App;
