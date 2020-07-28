/**
 * Print error and exit with status 1
 * @param errMsg - message to display before exiting
 */
export function exit(errMsg: string): void {
  console.error(errMsg);
  process.exit(1);
};
