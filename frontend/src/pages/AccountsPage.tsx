import { Plus } from 'lucide-react';

export default function AccountsPage() {
  const accounts = [
    { id: 1, name: 'Compte Courant BNP', type: 'Banque', balance: 5250.0, currency: 'EUR' },
    { id: 2, name: 'Livret A', type: 'Épargne', balance: 12000.0, currency: 'EUR' },
    { id: 3, name: 'PEA Boursorama', type: 'Actions', balance: 45000.0, currency: 'EUR' },
    { id: 4, name: 'Portefeuille Crypto', type: 'Crypto', balance: 8500.0, currency: 'EUR' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Comptes</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez tous vos comptes financiers</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Ajouter un compte</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">{account.type}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: account.currency,
                }).format(account.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
