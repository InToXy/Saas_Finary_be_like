import { TrendingUp, Wallet, DollarSign, PieChart } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - à remplacer par de vraies données API
  const stats = [
    {
      name: 'Patrimoine Total',
      value: '€248,350',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      name: 'Performance Mensuelle',
      value: '+€3,245',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      name: 'Comptes Actifs',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Wallet,
    },
    {
      name: 'Actifs Diversifiés',
      value: '28',
      change: '+5',
      trend: 'up',
      icon: PieChart,
    },
  ];

  const recentTransactions = [
    { id: 1, description: 'Salaire', amount: '+€3,500', date: '2025-11-01', type: 'credit' },
    { id: 2, description: 'Loyer', amount: '-€1,200', date: '2025-11-01', type: 'debit' },
    { id: 3, description: 'Dividendes Apple', amount: '+€45.50', date: '2025-10-30', type: 'credit' },
    { id: 4, description: 'Achat BTC', amount: '-€500', date: '2025-10-28', type: 'debit' },
  ];

  const assetAllocation = [
    { name: 'Actions', value: 35, color: 'bg-blue-500' },
    { name: 'Immobilier', value: 30, color: 'bg-green-500' },
    { name: 'Crypto', value: 15, color: 'bg-purple-500' },
    { name: 'Liquidités', value: 12, color: 'bg-yellow-500' },
    { name: 'SCPI', value: 8, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vue d'ensemble de votre patrimoine et performances
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`mt-2 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Actifs</h3>
          <div className="space-y-4">
            {assetAllocation.map((asset) => (
              <div key={asset.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{asset.name}</span>
                  <span className="font-medium text-gray-900">{asset.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${asset.color} h-2 rounded-full`}
                    style={{ width: `${asset.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance (6 mois)</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Graphique de performance à implémenter</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
              <span className={`text-sm font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
