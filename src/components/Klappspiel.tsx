import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { FunctionComponent } from 'react';

type Hatch = {
  open: Boolean,
  value: number
}
type HatchesProps = {
  hatches: (Hatch & {closeable: Boolean})[],
  onClick: (idx: number) => void
}

/*
const probability = () => {
  for (var i = 1; i <=6; i++) {
    for (var j = 1; j <=6; j++) {
      let [d1Used, d2Used] = [false, false]
      for (let k = 1; k <=9; k++) {
        const [closeable, d1, d2] = canBeClosed(i, j, 1) 
 
      }

    }
  }
}
*/
// Return a list of possible moves, each move closes one or two hatches.
const allMoves = (die1: number, die2: number) => {
  const inRange = (v: number) => v > 0 && v < 10 
  const isWholeNumber = (v: number) => v % 1 === 0 
  return [
    [die1 + die2], [die1 * die2],
    [die1 - die2], [die2 - die1],
    [die1 / die2], [die2 / die1],
    [die1, die2]
  ].filter((v) => v.every(inRange) && v.every(isWholeNumber))
}

// python like range
const range = (size:number, startAt:number = 0):ReadonlyArray<number> => {
  return Array.from({length: size}, (x, i) => i + startAt);
}

const validMoves = (die1: number, die2: number, openHatches: number[]) => {
  const intersect = <T,>(a: Array<T>, b: Array<T>) => a.filter((x: T) => b.includes(x))
  return allMoves(die1, die2).filter((move) => {
    // check that all hatches are open
    return intersect(move, openHatches).length > 0
  })
}


const Hatches: FunctionComponent<HatchesProps> = ({hatches, onClick}) => {
  let divs = []
  for (let i = 0; i < hatches.length; i++) {
    const text = hatches[i].open ? "offen" : "zu"
    const style = hatches[i].closeable ? {color: "green"} : {}
    let klappe = <div key={i} style={style} onClick={() => onClick(i)}>{i+1}: {text}</div>
    divs.push(klappe)
  }
  return <>{divs}</>;
} 

export const KlappSpiel = () => {
  const [moveNr, setMoveNr] = useState(1)
  const [die1, setDie1] = useState({value: 1, hasBeenUsed: false})
  const [die2, setDie2] = useState({value: 1, hasBeenUsed: false})
  const roll = () => {
    setDie1({value: Math.ceil(Math.random() * 6), hasBeenUsed: false})
    setDie2({value: Math.ceil(Math.random() * 6), hasBeenUsed: false})
  }
  useEffect(() => {
    console.log("roll")
    roll()
  }, []) // roll when mounted
  
  const [hatchesState, setHatchesState] = useState(range(9, 1).map(v => ({value: v, open: true})))

  // Compute closable hatches
  const hatches = useCallback(() => {
    const openHatches = hatchesState.filter(h => h.open).map(h => h.value)
    const unique = (v: number, i: number, a: number[]) => a.indexOf(v) === i
    const closableValues = validMoves(
      die1.hasBeenUsed ? 0 : die1.value, 
      die2.hasBeenUsed ? 0 : die2.value, 
      openHatches
    ).flat().filter(unique)
    return hatchesState.map(h => ({...h, closeable: closableValues.includes(h.value)}))
  }, [hatchesState, die1, die2])

  const lost = useCallback(() => {
    const someOpen = hatches().some(h => h.open)
    const canMove = hatches().some(h => h.closeable)
    const canReroll = die1.hasBeenUsed && die2.hasBeenUsed
    return !canMove && someOpen && !canReroll
  }, [hatches, die1, die2])

  // handle click on hatch
  const handleClick = (idx: number) => {
    const hatch = hatches()[idx]
    if (hatch.closeable) {
      let newHatchesState = [...hatchesState]
      newHatchesState[idx].open = false
      setHatchesState(newHatchesState)
      // mark die as used
      if (die1.value === hatch.value) {
        setDie1({...die1, hasBeenUsed: true})
      }
      else if (die2.value === hatch.value) {
        setDie2({...die2, hasBeenUsed: true})
      } else {
        setDie1({...die1, hasBeenUsed: true})
        setDie2({...die2, hasBeenUsed: true})
      }
    }
  }
  // Reroll automatically if both dice have been used.
  useEffect(() => {
    if (die1.hasBeenUsed && die2.hasBeenUsed && !lost()) {
      console.log('reroll')
      roll()
      setMoveNr(moveNr + 1)
    }
  }, [die1, die2, lost, moveNr])

  const reset = () => {
    let newHatchesState = [...hatchesState]
    newHatchesState.map(h => h.open = true)
    setHatchesState(newHatchesState)
    roll()
    setMoveNr(1)
  }

  const youLost = lost() ? <div style={{color: "red"}}>You Lost!</div> : <></>
  console.log(hatches())
  return (
    <>
    <h1> Klappspiel Version 0.1</h1>
    <p>{allMoves(die1.value, die2.value)}</p>
    <div>
      <Hatches 
        hatches={hatches()}
        onClick={handleClick} 
      />
    </div>
    <p>Würfel: {die1.hasBeenUsed ? "X" : die1.value} | {die2.hasBeenUsed ? "X" : die2.value}</p>
    <p>Runde: {moveNr}</p>
    {youLost}
    <button onClick={reset}>Reset</button>
    </>
  );
}