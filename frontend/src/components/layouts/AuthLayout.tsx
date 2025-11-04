import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-4xl font-bold mb-4">Wealth Management</h1>
          <p className="text-primary-100 text-lg">
            Gérez votre patrimoine en toute simplicité avec notre plateforme complète
          </p>
        </div>
        <div className="text-primary-100 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Agrégation bancaire</h3>
              <p className="text-sm">Connectez tous vos comptes en un seul endroit</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Tableau de bord temps réel</h3>
              <p className="text-sm">Visualisez votre patrimoine instantanément</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Sécurité maximale</h3>
              <p className="text-sm">Chiffrement de bout en bout et conformité RGPD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
