import chalk from 'chalk';
import * as JsDiff from 'diff';

// warning!
// t.deepEqual() tests attribute order while prettyDiff() does not
export function deepEqual(t, actual, expected) {
  t.deepEqual(actual, expected, prettyDiff(actual, expected));
}

export function prettyDiff(actual, expected) {
  const diff = JsDiff.diffJson(expected, actual).map(part => {
    if (part.added) return chalk.green(part.value.replace(/.+/g, '    - $&'));
    if (part.removed) return chalk.red(part.value.replace(/.+/g, '    + $&'));
    return chalk.gray(part.value.replace(/.+/g, '    | $&'));
  }).join('');
  return `\n${diff}\n`;
}
