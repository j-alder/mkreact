const { exit } = require('./error');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  let response: string;
  rl.setPrompt(question);
  rl.prompt();
  return new Promise((resolve, reject) => {
    rl.on('line', (input: string) => {
      response = input;
      rl.close();
    });
    rl.on('close', () => {
      resolve(response);
    });
  });
}

export function yesNo(question: string, def: boolean = false): boolean {
  question = `${question} [${def === true ? 'Y' : 'y'}|${def === false ? 'N' : 'n'}] `;
  return ask(question);
}

export function multiChoice(question: string, options: Array<string>, def: string|null = null): Promise<string|null> {
  options = options.map((o: string, i: number) => `  ${i}. ${o}`);
  if (def) question += ` (default: ${def})`;
  question += '\n' + options.join('\n') + '\n' + `[0-${options.length-1}]: `;
  return ask(question)
    .then((res: string) => {
      if (res !== '') {
        const index = parseInt(res);
        return options[index] || def;
      }
      return def;
    })
    .catch((err: Error) => exit(`An error occurred: ${err}`));
}

