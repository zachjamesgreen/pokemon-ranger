import { useMemo, useState } from 'react';
import styled from 'styled-components';

const NATURE_MODIFIERS = [
  {
    name: 'Negative Nature',
    modifier: 0.9,
  },
  {
    name: 'Neutral Nature',
    modifier: 1,
  },
  {
    name: 'Positive Nature',
    modifier: 1.1,
  }
]

function calculateStat(level, base, iv, ev, modifier) {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * modifier);
}

function calculateDamageValues(level, power, attack, defense, modifier) {
  return [...Array(16).keys()].map(randomValue => (
    Math.floor((Math.floor(((Math.floor((2 * level) / 5) + 2) * power * Math.floor(attack / defense)) / 50) + 2) * modifier * (randomValue / 100 + 0.85))
  ));
}

export default function Home() {
  const [level, setLevel] = useState(5);
  const [baseStat, setBaseStat] = useState(20);
  const [evs, setEVs] = useState(0);
  const [movePower, setMovePower] = useState(50);
  const [modifier, setModifier] = useState(1)
  const [opponentStat, setOpponentStat] = useState(20);

  const results = useMemo(() => {
    return NATURE_MODIFIERS.map(natureModifierData => {
      const possibleStats = [...Array(32).keys()].map(possibleIV => calculateStat(level, baseStat, possibleIV, evs, natureModifierData.modifier));

      // Combine stats into ranges of like values.
      const rangeSegments = possibleStats.reduce((acc, statValue, iv) => {
        const lastValue = acc[acc.length - 1];

        if (lastValue?.stat === statValue) {
          return [
            ...acc.slice(0, acc.length - 1),
            {
              ...lastValue,
              to: iv,  
            }
          ]; 
        } else {
          return [...acc, {
            stat: statValue,
            from: iv,
            to: iv
          }];
        }
      }, []);

      return {
        name: natureModifierData.name,
        rangeSegments: rangeSegments.map(rangeSegment => {
          const damageValues = calculateDamageValues(level, movePower, rangeSegment.stat, opponentStat, modifier);

          return {
            ...rangeSegment,
            damageValues,
            minDamage: Math.min(...damageValues),
            maxDamage: Math.max(...damageValues),
          };
        }),
      };
    });
  }, [level, baseStat, evs, movePower, modifier, opponentStat]);

  return (
    <Container>
      <div>
        <InputSection>
          <InputSubheader>Pokemon</InputSubheader>
          <InputRow>
            <label>Level</label>
            <input defaultValue={level} onChange={event => setLevel(event.target.value)}/>
          </InputRow>
          
          <InputRow>
            <label>Offensive Base Stat</label>
            <input defaultValue={baseStat} onChange={event => setBaseStat(event.target.value)}/>
          </InputRow>
          
          <InputRow>
            <label>Offensive Stat EVs</label>
            <input defaultValue={evs} onChange={event => setEVs(event.target.value)}/>
          </InputRow>

          <InputSubheader>Move</InputSubheader>
          <InputRow>
            <label>Move Power</label>
            <input defaultValue={movePower} onChange={event => setMovePower(event.target.value)}/>
          </InputRow>
          <InputRow>
            <label>Modifier</label>
            <input defaultValue={modifier} onChange={event => setModifier(event.target.value)}/>
          </InputRow>

          <InputSubheader>Opponent</InputSubheader>
          <InputRow>
            <label>Defensive Stat</label>
            <input defaultValue={opponentStat} onChange={event => setOpponentStat(event.target.value)}/>
          </InputRow>
        </InputSection>
      </div>
    <div>
      <ResultsHeader>Results</ResultsHeader>
        {results.map(({ name, rangeSegments }) => (
        <>
          <ResultsSubheader>{name}</ResultsSubheader>
          <ResultsGrid>
            <ResultsGridHeader>
              <div>IVs</div>
              <div>Stat</div>
              <div>Damage</div>
            </ResultsGridHeader>
            {rangeSegments.map(({ from, to, stat, damageValues, minDamage, maxDamage }) => (
              <>
                <ResultsRow>
                  <div>{from === to ? from : `${from} - ${to}`}</div>
                  <div>{stat}</div>
                  <div>{minDamage === maxDamage ? minDamage : `${minDamage} - ${maxDamage}`}</div>
                </ResultsRow>
                <ResultsDamageRow>{damageValues.join(', ')}</ResultsDamageRow>
              </>
            ))}
          </ResultsGrid>
        </>
      ))}
    </div>
   </Container>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > div {
    padding: 1rem;
  }
`;

const InputSection = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const InputRow = styled.div`
  display: contents;

  & > label {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 700;
    line-height: 1.75;
  }

  & > input {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem 0;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    border: 1px solid #999;
  }
`;

const InputSubheader = styled.div`
  grid-column: 1 / -1;
  font-size: 1.25rem;
  font-weight: 700;
  color: #666;
  margin: 0.5rem 0;
`;

const ResultsHeader = styled.h2`
  font-size: 1.25rem;
  color: #333;
  font-weight: 700;
  margin: 0.5rem 0;
`;

const ResultsSubheader = styled.h3`
  font-size: 1rem;
  color: #666;
  font-weight: 700;
  margin: 0.25rem 0;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 2rem;
`;

const ResultsGridHeader = styled.div`
  display: contents;

  & > div {
    background-color: #eaeaea;
    padding: 0.25rem 0.5rem;
    font-weight: 700;
  }
`;

const ResultsRow = styled.div`
  display: contents;
  
  & > div {
    padding: 0.25rem 0.5rem 0 0.5rem;
  }
`;

const ResultsDamageRow = styled.div`
  grid-column: 1 / -1;
  color: #666;
  font-size: 0.825rem;
  padding: 0.25rem 0.5rem;
`;