import React, { useMemo } from 'react';
import { Project, ExpenseCategory } from '../types';
import { DollarSign, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';

interface ZoneBudgetProps {
  projects: Project[];
  expenses: ExpenseCategory[];
}

export const ZoneBudget: React.FC<ZoneBudgetProps> = ({ projects, expenses }) => {
  // Calculate aggregated financials
  const financials = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue_actual || 0), 0);
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget_total || 0), 0);
    const totalExpenses = projects.reduce((sum, p) => sum + (p.expenses_actual || 0), 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    return {
      totalRevenue,
      totalBudget,
      totalExpenses,
      profit,
      profitMargin,
      budgetUtilization,
    };
  }, [projects]);

  // Filter expenses for active projects
  const activeProjectIds = useMemo(() => new Set(projects.map(p => p.project_id)), [projects]);
  const filteredExpenses = useMemo(() =>
    expenses.filter(e => activeProjectIds.has(e.project_id)),
    [expenses, activeProjectIds]
  );

  // Aggregate expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Budget vs Expenses by Project
  const budgetComparison = useMemo(() => {
    return projects.map(p => ({
      name: p.project_name.split(' ').slice(0, 2).join(' '),
      budget: p.budget_total || 0,
      expenses: p.expenses_actual || 0,
      remaining: (p.budget_total || 0) - (p.expenses_actual || 0),
    })).sort((a, b) => b.budget - a.budget);
  }, [projects]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Budget & P/L Overview</h2>
        {financials.profit < 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertTriangle size={16} />
            <span className="font-semibold">Portfolio operating at loss</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial KPIs */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Total Revenue */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <DollarSign size={20} />
              <span className="text-xs font-semibold uppercase">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(financials.totalRevenue / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-gray-600 mt-1">Across {projects.length} events</div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingDown size={20} />
              <span className="text-xs font-semibold uppercase">Total Expenses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${(financials.totalExpenses / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Budget: ${(financials.totalBudget / 1000).toFixed(0)}k ({financials.budgetUtilization.toFixed(0)}% used)
            </div>
          </div>

          {/* Net Profit */}
          <div className={`bg-white p-4 rounded-xl border shadow-sm ${
            financials.profit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${financials.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              <DollarSign size={20} />
              <span className="text-xs font-semibold uppercase">Net Profit</span>
            </div>
            <div className={`text-2xl font-bold ${financials.profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {financials.profit >= 0 ? '+' : ''} ${(financials.profit / 1000).toFixed(0)}k
            </div>
            <div className={`text-sm mt-1 ${financials.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {financials.profitMargin.toFixed(1)}% profit margin
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <PieChart size={20} />
              <span className="text-xs font-semibold uppercase">Budget Utilization</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {financials.budgetUtilization.toFixed(0)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  financials.budgetUtilization > 90 ? 'bg-red-500' : financials.budgetUtilization > 75 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(financials.budgetUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Expense Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RePieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {expensesByCategory.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget vs Expenses by Project */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Budget vs Expenses by Project</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={budgetComparison}>
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip
              formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
            <Bar dataKey="expenses" fill="#6366f1" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
