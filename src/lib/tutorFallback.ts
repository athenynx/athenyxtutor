import { GradeLevel, SubjectId } from '../types';

const ARITHMETIC_OPERATOR =
  /(\+|-|−|×|x|\*|÷|\/|plus|minus|times|multiplied by|divided by)/i;
const NUMBER = '(-?\\d+(?:\\.\\d+)?)';

function solveArithmetic(question: string): string | null {
  const expression = new RegExp(
    `(?:what(?:'s| is)|calculate|solve|evaluate)\\s+${NUMBER}\\s*${ARITHMETIC_OPERATOR.source}\\s*${NUMBER}`,
    'i'
  );
  const standaloneExpression = new RegExp(
    `^\\s*${NUMBER}\\s*${ARITHMETIC_OPERATOR.source}\\s*${NUMBER}\\s*[?=]?\\s*$`,
    'i'
  );
  const match = question.match(expression) || question.match(standaloneExpression);

  if (!match) return null;

  const left = Number(match[1]);
  const operator = match[2].toLowerCase();
  const right = Number(match[3]);
  let result: number;

  if (operator === '+' || operator === 'plus') result = left + right;
  else if (operator === '-' || operator === '−' || operator === 'minus') result = left - right;
  else if (['×', 'x', '*', 'times', 'multiplied by'].includes(operator)) result = left * right;
  else {
    if (right === 0) {
      return 'We cannot divide by zero. Try dividing by a number greater than zero.';
    }
    result = left / right;
  }

  if (!Number.isFinite(result)) return null;
  const formattedResult = Number(result.toFixed(6)).toString();
  return `${left} ${operator} ${right} = ${formattedResult}.`;
}

export function getTutorFallback(
  question: string,
  _grade: GradeLevel | number,
  _subject: SubjectId | string
): string | null {
  const arithmeticAnswer = solveArithmetic(question);
  if (arithmeticAnswer) return arithmeticAnswer;

  const normalized = question.toLowerCase();

  if (normalized.includes('sky') && normalized.includes('blue')) {
    return 'Air molecules scatter shorter blue wavelengths of sunlight more than longer red wavelengths. This scattering sends blue light across the sky toward our eyes.';
  }

  if (
    normalized.includes('moon') &&
    (normalized.includes('shape') || normalized.includes('phase'))
  ) {
    return 'The Moon keeps its shape. As it orbits Earth, we see different amounts of its sunlit half. Those changing views are called the Moon’s phases.';
  }

  if (
    normalized.includes('noun') ||
    normalized.includes('verb') ||
    normalized.includes('adjective')
  ) {
    return 'A noun names a person, place, animal, or thing. A verb tells an action or state. An adjective describes a noun. For example, in “The fluffy cat sleeps,” “cat” is a noun, “sleeps” is a verb, and “fluffy” is an adjective.';
  }

  return null;
}
