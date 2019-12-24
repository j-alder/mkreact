export const exit = (errMsg: string): void => {
  console.error(errMsg);
  process.exit(1);
};

