import { useState } from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { Calendar, TrendingUp, DollarSign, Repeat, Edit2, Trash2, Plus } from 'lucide-react';

interface RecurringInvestment {
  id: string;
  assetName: string;
  assetType: string;
  symbol?: string;
  monthlyAmount: number;
  currentPrice: number;
  estimatedShares: number;
  nextInvestmentDate: string;
  totalInvested: number;
  isActive: boolean;
}

export function RecurringInvestmentsPage() {
  // Mock data - à remplacer par des appels API
  const [investments] = useState<RecurringInvestment[]>([
    {
      id: '1',
      assetName: 'Apple Inc.',
      assetType: 'STOCK',
      symbol: 'AAPL',
      monthlyAmount: 500,
      currentPrice: 178.50,
      estimatedShares: 2.8,
      nextInvestmentDate: '2025-12-01',
      totalInvested: 6000,
      isActive: true,
    },
    {
      id: '2',
      assetName: 'Vanguard S&P 500 ETF',
      assetType: 'ETF',
      symbol: 'VOO',
      monthlyAmount: 300,
      currentPrice: 425.30,
      estimatedShares: 0.7,
      nextInvestmentDate: '2025-12-01',
      totalInvested: 3600,
      isActive: true,
    },
    {
      id: '3',
      assetName: 'Bitcoin',
      assetType: 'CRYPTO',
      symbol: 'BTC',
      monthlyAmount: 200,
      currentPrice: 43250.00,
      estimatedShares: 0.0046,
      nextInvestmentDate: '2025-12-01',
      totalInvested: 2400,
      isActive: true,
    },
  ]);

  const totalMonthlyInvestment = investments.reduce((sum, inv) => sum + inv.monthlyAmount, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const activeInvestments = investments.filter((inv) => inv.isActive).length;

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'STOCK':
        return 'bg-blue-100 text-blue-800';
      case 'ETF':
        return 'bg-green-100 text-green-800';
      case 'CRYPTO':
        return 'bg-purple-100 text-purple-800';
      case 'COMMODITY':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investissements Programmés</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos investissements récurrents (Dollar Cost Averaging)
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Nouvel investissement</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Investissements actifs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{activeInvestments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Repeat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensuel total</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalMonthlyInvestment.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total investi</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalInvested.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prochain investissement</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {new Date(investments[0]?.nextInvestmentDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mes investissements programmés</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant mensuel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix actuel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parts estimées
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total investi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prochain achat
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investment.assetName}
                          </div>
                          {investment.symbol && (
                            <div className="text-sm text-gray-500">{investment.symbol}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getAssetTypeColor(
                          investment.assetType
                        )}`}
                      >
                        {investment.assetType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {investment.monthlyAmount.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {investment.currentPrice.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {investment.estimatedShares.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {investment.totalInvested.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {new Date(investment.nextInvestmentDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          investment.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {investment.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Qu'est-ce que le Dollar Cost Averaging (DCA) ?
          </h3>
          <p className="text-blue-800">
            Le DCA est une stratégie d'investissement consistant à investir régulièrement un montant
            fixe, indépendamment du prix de l'asset. Cette méthode permet de lisser le prix d'achat
            moyen dans le temps et de réduire l'impact de la volatilité du marché.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
