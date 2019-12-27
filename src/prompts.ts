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
    rl.on('close', () => resolve(response));
    rl.on('error', () => reject());
  });
}

export async function yesNo(question: string, def: boolean = false): Promise<boolean> {
  question = `${question} [${def === true ? 'Y' : 'y'}|${def === false ? 'N' : 'n'}] `;
  await ask(question)
    .then((input: string) => input === 'y' || input === 'Y' || def);
}

function fmtOptions(options: Array<string>): string {
  let result = '\n';
  for (let i = 0, len = options.length; i < len; i++) {
    result += `  ${i}. ${options[i]}` + '\n';
  }
  return result += `[0-${options.length-1}]: `;
}

export async function multiChoice(question: string, options: Array<string>, def: string|null = null): Promise<string|null> {
  question += (def ? ` (default: ${def})` : '') + fmtOptions(options);
  await ask(question)
    .then((res: string) => {
      if (res !== '') {
        const index = parseInt(res);
        return options[index] || def;
      }
      return def;
    })
}
