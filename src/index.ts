import { ICandle } from './types';

const getRoundNumber = (num: number) => Math.round(num * 100) / 100;

const calcSimpleMovingAverage = (
  data: number[],
  period: number
): Array<number> => {
  const movingAverage: number[] = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i; j >= 0 && count < period; j--) {
      sum += data[j];
      count++;
    }
    movingAverage.push(getRoundNumber(sum / count));
  }
  return movingAverage;
};

const calcSMASlope = (data: number[], period: number) => {
  if (data.length < period) {
    throw new Error('Not enough data points');
  }

  const values = data.slice(data.length - period);
  const sumX = (period * (period - 1)) / 2;
  const sumY = values.reduce((acc, val, i) => acc + val * (period - i), 0);

  const xBar = sumX / period;
  const yBar = sumY / period;

  const numerator = values.reduce(
    (acc, val, i) => acc + (i - xBar) * (val - yBar),
    0
  );
  const denominator = values.reduce(
    (acc, val, i) => acc + (i - xBar) * (i - xBar),
    0
  );

  return numerator / denominator;
};

const calcLineSlope = (
  data: { o: number; l: number; h: number; c: number }[],
  period: number
) => {
  /**
   * CALCULATING THE SLOPE OF LINE FROM THE FIRST CANDLE TO LAST TO DETERMINE IF THE PRICE IS RISING OR NOT
   * x1 = 0 (the starting point)
   * y1 = close of first candle
   * x2 = last element of SMA array
   * y2 = close of last candle
   * slope = (y2 - y1) / (x2 - x1)
   */

  const slope = (data[data.length - 1].c - data[0].c) / (data.length / period);
  return slope;
};

const csvToJSON = (csv: string, headers: string[]) => {
  const lines = csv.split('\n');

  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentline = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }
  return result; //JSON
};

const isCandleGreen = (candle: {
  t?: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}) => candle.c > candle.o;

const isCandleRed = (candle: ICandle) => candle.c < candle.o;

const isTrafficLightPair = (previousCandle: ICandle, nextCandle: ICandle) =>
  isCandleGreen(previousCandle) !== isCandleGreen(nextCandle);

/** Runs the call back function every 1 min starting from the next 1st minute */
const runEveryNew1stMin = (fn: () => any) => {
  const time = new Date(),
    secondsRemaining = (60 - time.getSeconds()) * 1000;

  setTimeout(function () {
    setInterval(fn, 60000);
  }, secondsRemaining);
};

/** Runs the call back function every 5 mins starting from the next 5th minute */
const runEveryNew5thMin = (fn: () => void): void => {
  const now = new Date();
  const secondsUntilNext5thMin =
    (300 - (now.getSeconds() + 60 * (now.getMinutes() % 5))) * 1000;
  setTimeout(() => {
    fn();
    setInterval(fn, 300000); // Run every 5 minutes after the first execution
  }, secondsUntilNext5thMin);
};

/**
 * @param n specifies the interval in minutes between executions
 * @param newNthMin target new minute from which execution should start (exxample: the next 1st, 5th, 15th ... minute)
 * @param fn call back to run every interval
 */
const runEveryNewNthMin = (
  n: number,
  newNthMin: number,
  fn: () => void
): void => {
  const now = new Date();
  let nextExecution = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    newNthMin,
    0
  );
  if (now.getTime() > nextExecution.getTime()) {
    nextExecution = new Date(nextExecution.getTime() + n * 60 * 1000);
  }
  const millisecondsUntilNextExecution =
    nextExecution.getTime() - now.getTime();

  setTimeout(() => {
    fn();
    setInterval(fn, n * 60 * 1000);
  }, millisecondsUntilNextExecution);
};

export {
  calcLineSlope,
  calcSMASlope,
  calcSimpleMovingAverage,
  csvToJSON,
  getRoundNumber,
  isCandleGreen,
  isCandleRed,
  isTrafficLightPair,
  runEveryNew1stMin,
  runEveryNew5thMin,
  runEveryNewNthMin,
};
