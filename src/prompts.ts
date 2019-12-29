const { exit } = require('./error');
const readline = require('readline');

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.setPrompt(question);
  rl.prompt();
  return new Promise((resolve) => {
    let response: string;
    rl.on('line', (input: string) => {
      response = input;
      rl.close();
    });
    rl.on('close', () => resolve(response));
  });
}

export async function yesNo(question: string, def: boolean = false): Promise<boolean> {
  question = `${question} [${def === true ? 'Y' : 'y'}|${def === false ? 'N' : 'n'}] `;
  return ask(question)
    .then((res: string) => {
      if (res === 'y' || res === 'Y') {
        return true;
      } else if (res === 'n' || res === 'N') {
        return false;
      } else {
        return def;
      }
    });
}

function fmtOptions(options: Array<string>): string {
  let result = '\n';
  for (let i = 0, len = options.length; i < len; i++) {
    result += `  ${i}. ${options[i] || 'none'}` + '\n';
  }
  return result += `[0-${options.length-1}]: `;
}

export async function multiChoice(
  question: string,
  options: Array<string>,
  def: string|null = null
): Promise<string|null> {
  question += (def ? ` (default: ${def})` : '') + fmtOptions(options);
  return ask(question)
    .then((res: string) => {
      if (res !== '') {
        const index = parseInt(res);
        return options[index] || def;
      }
      return def;
    });
}

