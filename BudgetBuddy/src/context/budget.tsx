import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO string
}

interface BudgetState {
  expenses: Expense[];
  totalBudget: number;
  streak: number;
  maxStreak: number;
  lastLoggedDate: string | null; // YYYY-MM-DD
  equippedItem: string | null;
}

interface BudgetContextValue extends BudgetState {
  addExpense: (amount: number, category: string, note: string) => void;
  setTotalBudget: (amount: number) => void;
  equipItem: (id: string | null) => void;
  deleteExpense: (id: string) => void;
  clearExpenses: () => void;
  remaining: number;
  spent: number;
}

const STORAGE_KEY = '@budgetbuddy_v1';

const defaultState: BudgetState = {
  expenses: [],
  totalBudget: 1070,
  streak: 0,
  maxStreak: 0,
  lastLoggedDate: null,
  equippedItem: null,
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BudgetState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setState({ ...defaultState, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = (next: BudgetState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addExpense = useCallback((amount: number, category: string, note: string) => {
    setState((prev) => {
      const today = todayStr();
      let newStreak = prev.streak;

      if (prev.lastLoggedDate === today) {
        // already logged today — streak unchanged
      } else if (prev.lastLoggedDate === yesterdayStr()) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }

      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      const newExpense: Expense = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount,
        category,
        note,
        date: new Date().toISOString(),
      };

      const next: BudgetState = {
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        streak: newStreak,
        maxStreak: newMaxStreak,
        lastLoggedDate: today,
      };
      persist(next);
      return next;
    });
  }, []);

  const setTotalBudget = useCallback((amount: number) => {
    setState((prev) => {
      const next = { ...prev, totalBudget: amount };
      persist(next);
      return next;
    });
  }, []);

  const equipItem = useCallback((id: string | null) => {
    setState((prev) => {
      const next = { ...prev, equippedItem: id };
      persist(next);
      return next;
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, expenses: prev.expenses.filter((e) => e.id !== id) };
      persist(next);
      return next;
    });
  }, []);

  const clearExpenses = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, expenses: [] };
      persist(next);
      return next;
    });
  }, []);

  if (!loaded) return null;

  const now = new Date();
  const monthExpenses = state.expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = state.totalBudget - spent;

  return (
    <BudgetContext.Provider
      value={{ ...state, addExpense, setTotalBudget, equipItem, deleteExpense, clearExpenses, remaining, spent }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}
