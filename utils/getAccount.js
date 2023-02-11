// modulos internos
import fs from "fs";

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r'
  });

  return JSON.parse(accountJSON);
}

export default getAccount;