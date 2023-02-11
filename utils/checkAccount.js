// modulos externos
import chalk from "chalk";

// modulos internos
import fs from "fs";

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black("Esta conta não existe! Tente novamente"));
    return false;
  }

  return true;
}

export default checkAccount;