import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import 'bootstrap/dist/css/bootstrap.min.css';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import ETransfer from './ETransfer';

function Transactions() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [accounts, setAccounts] = useState({
    Saving: {
      balance: 5000, // Initial balance for Saving account
      transactions: []
    },
    Chequing: {
      balance: 3550, // Initial balance for Chequing account
      transactions: []
    }
  });

  const [hasDeposit, setHasDeposit] = useState(false); // Track if any deposit has been made
  const [showETransferForm, setShowETransferForm] = useState(false); // Control visibility of E-Transfer form

  useEffect(() => {
    // Check if any deposit has been made across accounts
    const depositExists = Object.values(accounts).some(account =>
      account.transactions.some(transaction => transaction.type === 'Deposit')
    );
    setHasDeposit(depositExists);
  }, [accounts]); // Update whenever accounts change

  const handleDeposit = (accountNumber, amount) => {
    amount = parseFloat(amount);
    setAccounts((prevAccounts) => {
      const account = prevAccounts[accountNumber] || { balance: 0, transactions: [] };
      const newBalance = account.balance + amount;
      const newTransaction = {
        type: 'Deposit',
        accountNumber,
        amount,
        balance: newBalance
      };
      return {
        ...prevAccounts,
        [accountNumber]: {
          balance: newBalance,
          transactions: [...account.transactions, newTransaction]
        }
      };
    });
  };

  const handleWithdraw = (accountNumber, amount) => {
    amount = parseFloat(amount);
    setAccounts((prevAccounts) => {
      const account = prevAccounts[accountNumber] || { balance: 0, transactions: [] };
      const newBalance = account.balance - amount;
      if (newBalance < 0) {
        alert('Insufficient funds!');
        return prevAccounts;
      }
      const newTransaction = {
        type: 'Withdraw',
        accountNumber,
        amount,
        balance: newBalance
      };
      return {
        ...prevAccounts,
        [accountNumber]: {
          balance: newBalance,
          transactions: [...account.transactions, newTransaction]
        }
      };
    });
  };

  const handleETransfer = (fromAccountNumber, toAccountNumber, amount) => {
    amount = parseFloat(amount);
    setAccounts((prevAccounts) => {
      const fromAccount = prevAccounts[fromAccountNumber] || { balance: 0, transactions: [] };
      const toAccount = prevAccounts[toAccountNumber] || { balance: 0, transactions: [] };

      // Check if the from account has sufficient funds
      if (fromAccount.balance < amount) {
        alert('Insufficient funds in the ' + fromAccountNumber + ' account!');
        return prevAccounts;
      }

      // Deduct from the sender's account
      const newFromBalance = fromAccount.balance - amount;
      const fromTransaction = {
        type: 'E-Transfer Out',
        accountNumber: fromAccountNumber,
        amount,
        balance: newFromBalance
      };

      // Add to the recipient's account
      const newToBalance = toAccount.balance + amount;
      const toTransaction = {
        type: 'E-Transfer In',
        accountNumber: toAccountNumber,
        amount,
        balance: newToBalance
      };

      return {
        ...prevAccounts,
        [fromAccountNumber]: {
          balance: newFromBalance,
          transactions: [...fromAccount.transactions, fromTransaction]
        },
        [toAccountNumber]: {
          balance: newToBalance,
          transactions: [...toAccount.transactions, toTransaction]
        }
      };
    });
    // Hide the E-Transfer form after transfer
    setShowETransferForm(false);
  };

  const handleLogOut = () => {
    // Navigate back to home page
    navigate('/');
  };

  return (
    <div className="container mt-5 position-relative">
      <h3 className="text-center">Banking App</h3>
      <button
        className="btn btn-danger position-absolute top-2 end-0 m-3"
        onClick={handleLogOut}
      >
        Log Out
      </button>
      <div className="row">
        <div className="col-md-4">
          <Deposit onDeposit={handleDeposit} />
        </div>
        <div className="col-md-4">
          <Withdraw onWithdraw={handleWithdraw} />
        </div>
        <div className="col-md-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowETransferForm(!showETransferForm)}
            disabled={!hasDeposit}
          >
            E-Transfer
          </button>
        </div>
      </div>
      {showETransferForm && (
        <div className="row mt-3">
          <div className="col-md-12">
            <ETransfer onETransfer={handleETransfer} hasDeposit={hasDeposit} />
          </div>
        </div>
      )}
      <div className="row mt-3">
        <div className="col-md-12">
          <h4>Transaction History</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(accounts).flatMap(([accountName, account]) =>
                account.transactions.map((transaction, index) => (
                  <tr key={`${accountName}-${index}`}>
                    <td>{accountName}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.amount.toFixed(2)}</td>
                    <td>{transaction.balance.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
