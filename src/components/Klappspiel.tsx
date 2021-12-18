import * as React from 'react';
import { useState, useEffect } from 'react';
import { FunctionComponent } from 'react';

type Klappe = {
  open: Boolean
}
type KlappenProps = {
  klappen: Klappe[],
  die1: number,
  die2: number,
  onClick: (idx: number) => void
}

const canBeClosed = (die1: number, die2: number, klappenValue: number) => {
  if (((die1 + die2) === klappenValue) ||
     ((die1 * die2) === klappenValue) ||
     ((die1 / die2) === klappenValue) ||
     ((die2 / die1) === klappenValue) ||
     ((die1 - die2) === klappenValue) ||
     ((die2 - die1) === klappenValue)) 
  {
    return [true, true, true]
  };
  const die1Usable = die1 === klappenValue
  const die2Usable = die2 === klappenValue
  return [die1Usable || die2Usable, die1Usable, die2Usable]
}

const Klappen: FunctionComponent<KlappenProps> = (props) => {
  console.log("renderKlappen", props)
  const klappen = props.klappen
  const onclick = props.onClick
  let divs = []
  for (let i = 0; i < klappen.length; i++) {
    const text = klappen[i].open ? "offen" : "zu"
    const [closeable, d1, d2] = canBeClosed(props.die1, props.die2, i+1)
    const style = klappen[i].open && closeable ? {color: "green"} : {}
    let klappe = <div key={i} style={style} onClick={() => onclick(i)}>{i+1}: {text}</div>
    divs.push(klappe)
  }
  return <>{divs}</>;
} 

export const KlappSpiel = () => {
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);
  const roll = () => {
    setDie1(Math.ceil(Math.random() * 6))
    setDie2(Math.ceil(Math.random() * 6))
  }
  useEffect(roll, [])
  

  const [klappenPrev, setKlappenPrev] = useState(Array<Klappe>(9).fill({open: true})) 
  const [klappen, setKlappen] = useState([...klappenPrev]) 
  const onclick = (idx: number) => {
    const klappe = klappen[idx]
    const [closeable, die1Used, die2Used] = canBeClosed(die1, die2, idx + 1)
    if (klappe.open && closeable) {
      let newKlappen = [...klappen]
      newKlappen[idx] = {open: false}
      setKlappen(newKlappen)
      if (die1Used) {
        setDie1(0)
      }
      if (die2Used) {
        setDie2(0)
      }
    }
  }

  const [lost, setLost] = useState(false);

  useEffect(() => {
    let lost = true
    for (let i = 0; i < klappen.length; i++) {
      const [closeable, d1, d2] = canBeClosed(die1, die2, i+1)
      if (klappen[i].open && closeable) {
        lost = false;
      }
    }
    if (die1 === 0 && die2 === 0) {
      roll()
    } else if (lost) {
      setLost(true)
    }
    console.log(die1, die2, lost, klappen.map((k, i) => {
      const [closeable, d1, d2] = canBeClosed(die1, die2, i+1)
      return closeable
    }))
  }, [die1, die2])

  const reset = () => {
    setLost(false)
    setKlappen(klappen.map(() => ({open: true})))
    roll()
  }

  const youLost = lost ? <div style={{color: "red"}}>You Lost!</div> : <></>

  return (
    <>
    <h1> Klappspiel Version 0.1</h1>
    <div> 
      <Klappen die1={die1} die2={die2} klappen={klappen} onClick={onclick}/>
    </div>
    <p>Würfel: {die1} | {die2}</p>
    {youLost}
    <button onClick={reset}>Reset</button>
    </>
  );
}