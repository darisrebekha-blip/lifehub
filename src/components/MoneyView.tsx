import React, { useState } from 'react';
import { FinanceData, TransactionItem } from '../types';

interface MoneyViewProps {
  finance: FinanceData;
  currencySymbol?: string;
  onAddTransaction: (transaction: Omit<TransactionItem, 'id' | 'date'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateBudget: (newBudget: number) => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({
  finance,
  currencySymbol = '$',
  onAddTransaction,
  onDeleteTransaction,
  onUpdateBudget
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(finance.monthlyBudget.toString());

  const curr = currencySymbol;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Food');

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: num,
      type,
      category: category.trim() || 'General'
    });

    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setIsEditingBudget(false);
    }
  };

  const spentPct =
    finance.monthlyBudget > 0
      ? Math.min(100, Math.round((finance.spent / finance.monthlyBudget) * 100))
      : 0;
  const remainingBudget = finance.monthlyBudget - finance.spent;

  // Calculate total income
  const totalIncome = finance.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header Overview Card */}
      <section className="bg-[#1c2028] p-5 rounded-xl micro-border space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#dfe2ee]">Finance & Budget</h1>
            <p className="text-xs text-[#c2c6d6]">Monthly Financial Tracking</p>
          </div>
          <button
            id="money-log-transaction-btn"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#4edea3] text-[#003824] px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold hover:bg-[#4edea3]/90 cursor-pointer shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Log Money</span>
          </button>
        </div>

        {/* Budget Metric Bar */}
        <div className="grid grid-cols-3 gap-2 bg-[#181c24] p-3.5 rounded-xl micro-border text-center">
          <div>
            <p className="text-[10px] text-[#c2c6d6] uppercase font-semibold">Total Spent</p>
            <p className="text-base font-bold text-[#ffb95f]">{curr}{finance.spent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#c2c6d6] uppercase font-semibold">Remaining</p>
            <p className="text-base font-bold text-[#4edea3]">
              {curr}{Math.max(0, remainingBudget).toLocaleString()}
            </p>
          </div>
          <div className="relative group cursor-pointer" onClick={() => setIsEditingBudget(true)}>
            <p className="text-[10px] text-[#c2c6d6] uppercase font-semibold flex items-center justify-center gap-1">
              <span>Budget</span>
              <span className="material-symbols-outlined text-[12px]">edit</span>
            </p>
            <p className="text-base font-bold text-[#adc6ff]">
              {curr}{finance.monthlyBudget.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#c2c6d6]">Budget Utilization ({spentPct}%)</span>
            <span className={spentPct > 90 ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}>
              {spentPct > 100 ? 'Over Budget' : 'On Track'}
            </span>
          </div>
          <div className="h-2 w-full bg-[#31353e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPct > 90 ? 'bg-[#ffb4ab]' : 'bg-[#ffb95f]'
              }`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Edit Budget Modal */}
      {isEditingBudget && (
        <form
          onSubmit={handleSaveBudget}
          className="bg-[#181c24] p-4 rounded-xl micro-border space-y-3"
        >
          <h3 className="text-xs font-bold text-[#adc6ff]">Update Monthly Target Budget</h3>
          <input
            id="edit-monthly-budget-input"
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-sm text-[#dfe2ee] outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-3 py-1.5 text-xs text-[#c2c6d6]"
            >
              Cancel
            </button>
            <button
              id="save-monthly-budget-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#adc6ff] text-[#00285d] rounded-lg"
            >
              Save Target
            </button>
          </div>
        </form>
      )}

      {/* Inline Log Transaction Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTransaction}
          className="bg-[#181c24] p-4 rounded-xl micro-border space-y-3"
        >
          <h3 className="text-xs font-bold text-[#4edea3]">Log Income or Expense</h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[#ca8100] text-[#3e2400]'
                  : 'bg-[#31353e] text-[#c2c6d6]'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-[#4edea3] text-[#003824]'
                  : 'bg-[#31353e] text-[#c2c6d6]'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Description
              </label>
              <input
                id="transaction-description-input"
                type="text"
                placeholder="e.g. Lunch, Subscriptions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
                Amount ({curr})
              </label>
              <input
                id="transaction-amount-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#c2c6d6] mb-1">
              Category
            </label>
            <input
              id="transaction-category-input"
              type="text"
              placeholder="e.g. Food, Tools, Income"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0e16] border border-[#424754] rounded-lg px-3 py-2 text-xs text-[#dfe2ee] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#c2c6d6]"
            >
              Cancel
            </button>
            <button
              id="submit-transaction-btn"
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-[#4edea3] text-[#003824] rounded-lg"
            >
              Record Entry
            </button>
          </div>
        </form>
      )}

      {/* Transaction History List */}
      <section className="bg-[#1c2028] p-4 rounded-xl micro-border space-y-3">
        <h2 className="text-sm font-bold text-[#dfe2ee]">Recent Transactions</h2>
        <div className="space-y-2">
          {finance.transactions.length === 0 ? (
            <p className="text-xs text-[#8c909f] text-center py-4">No transactions logged yet.</p>
          ) : (
            finance.transactions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#181c24] rounded-lg micro-border group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.type === 'income'
                        ? 'bg-[#4edea3]/15 text-[#4edea3]'
                        : 'bg-[#ffb95f]/15 text-[#ffb95f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#dfe2ee]">{item.title}</p>
                    <p className="text-[10px] text-[#8c909f]">
                      {item.category} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      item.type === 'income' ? 'text-[#4edea3]' : 'text-[#ffb95f]'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}{curr}{item.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onDeleteTransaction(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#8c909f] hover:text-[#ffb4ab] p-1"
                    title="Delete entry"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
