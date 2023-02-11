// modulos externos
import inquirer from "inquirer";
import chalk from "chalk";

// modulos do node
import fs from "fs";

// modulos internos
import checkAccount from "./utils/checkAccount.js";
import getAccount from "./utils/getAccount.js";

console.log(chalk.bgCyan.black("Iniciamos o Accounts"));

function operation() {
  inquirer.prompt([
    { 
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: [
        'Criar Conta',
        'Consultar Saldo',
        'Depositar',
        'Sacar',
        'Realizar Transferência',
        'Sair',
      ]
    }
  ])
  .then(answer => {
    const action = answer['action'];

    if (action === 'Criar Conta') {
      createAccount();
    } else if (action === 'Depositar') {
      deposit();
    } else if (action === 'Consultar Saldo') {
      getAccountBalance();
    } else if (action === 'Sacar') {
      withdraw();
    } else if (action === 'Realizar Transferência') {
      transferAmount();
    } else if (action === 'Sair') {
      console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
      process.exit();
    }
  })
  .catch(err => console.log(err));
}

// create a account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta',
    }
  ])
  .then(answer => {
    const accountName = answer['accountName']
    console.info(accountName);

    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }

    if (fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(chalk.bgRed.black("Esta conta já existe, escolha outro nome"));

      return buildAccount();
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err => {
      console.log(err);
    }));

    console.log(chalk.green("Parabéns, a sua conta foi criada"));
    return operation();
  })
  .catch(err => console.log(err));
}

// add an amount to user account
function deposit() {
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta',
    }
  ])
  .then(answer => {
    const accountName = answer['accountName'];

    // verify if account exists
    if(!checkAccount(accountName)) {
      return deposit();
    }

    inquirer.prompt([{
      name: 'amount',
      message: 'Quanto você deseja depositar?',
    }])
    .then(answer => {
      const amount = answer['amount'];

      // add an amount
      addAmount(accountName, amount);
      operation();
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
    console.log(err);
  });

  console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`));
}

// show account balance
function getAccountBalance() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }])
  .then(answer => {
    const accountName = answer['accountName'];

    // verify if account exists
    if (!checkAccount(accountName)) {
      return getAccountBalance();
    }

    const accountData = getAccount(accountName);

    console.log(chalk.bgBlue.black(`Olá, ${accountName}! O saldo da sua conta é R$${accountData.balance}`));
    return operation();
  })
  .catch(err => console.log(err));
}

// withdraw an amount from user account
function withdraw() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?'
  }])
  .then(answer => {
    const accountName = answer['accountName'];

    if (!checkAccount(accountName)) {
      return withdraw();
    }

    inquirer.prompt([{
      name: 'ammount',
      message: 'Quanto você deseja sacar?',
    }])
    .then(answer => {
      const ammount = answer['ammount'];

      removeAmmount(accountName, ammount);
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}

function removeAmmount(accountName, ammount) {
  const accountData = getAccount(accountName);

  if (!ammount) {
    console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
    return withdraw();
  }

  if (accountData.balance < ammount) {
    console.log(chalk.bgRed.black("Valor indisponível"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(ammount);

  fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
    console.log(err);
  });

  console.log(chalk.green(`Foi realizado o saque de R$${ammount} da sua conta`));

  return operation();
}

// transfer an amount to a user
function transferAmount() {
  inquirer.prompt([{
    name: 'accountName',
    message: 'Qual o nome da sua conta?',
  }])
  .then(answer => {
    const accountName = answer['accountName'];

    if (!checkAccount(accountName)) {
      return transferAmount();
    }

    inquirer.prompt([{
      name: 'recipientAccountName',
      message: 'Para qual conta que você deseja transferir?'
    }])
    .then(answer => {
      const recipientAccountName = answer['recipientAccountName'];

      if (!checkAccount(recipientAccountName)) {
        return transferAmount();
      }

      performTransfer(accountName, recipientAccountName);
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}

function performTransfer(accountName, recipientAccountName) {
  const accountData = getAccount(accountName);
  const recipientAccountData = getAccount(recipientAccountName);

  inquirer.prompt([{
    name: 'amount',
    message: 'Quanto deseja transferir?',
  }])
  .then(answer => {
    const ammount = answer['amount'];

    if (!ammount) {
      console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente"));
      return transferAmount();
    }

    if (accountData.balance < ammount) {
      console.log(chalk.bgRed.black("Valor indisponível"));
      return transferAmount();
    }

    // 
    accountData.balance = parseFloat(accountData.balance) - parseFloat(ammount);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
      console.log(err);
    });

    //
    recipientAccountData.balance = parseFloat(recipientAccountData.balance) + parseFloat(ammount);

    fs.writeFileSync(`accounts/${recipientAccountName}.json`, JSON.stringify(recipientAccountData), (err) => {
      console.log(err);
    });

    console.log(chalk.green(`O valor de ${ammount} foi transferido para a conta ${recipientAccountName}`));

    operation();
  })
  .catch(err => console.log(err));
}

operation();