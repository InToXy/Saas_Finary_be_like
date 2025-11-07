import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

export function AuthTest() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [testResult, setTestResult] = useState<string>('');

  const testAuth = async () => {
    try {
      setTestResult('Testing...');
      console.log('🧪 Test d\'authentification');
      console.log('User:', user);
      console.log('Token:', accessToken?.substring(0, 10) + '...');
      console.log('isAuthenticated:', isAuthenticated);

      // Test simple API call
      const response = await api.get('/assets');
      console.log('✅ API Response:', response.status, response.data?.length, 'assets');
      setTestResult(`✅ Success: ${response.data?.length || 0} assets found`);
    } catch (error: any) {
      console.error('❌ API Error:', error);
      setTestResult(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  const testAssetCreation = async () => {
    try {
      setTestResult('Testing asset creation...');
      
      const testAsset = {
        type: 'STOCK',
        name: 'Test Apple',
        symbol: 'AAPL',
        quantity: 1,
        purchasePrice: 150,
        currentPrice: 175
      };

      console.log('🧪 Test de création d\'asset:', testAsset);
      
      const response = await api.post('/assets', testAsset);
      console.log('✅ Asset created:', response.data);
      setTestResult(`✅ Asset created successfully: ${response.data.name}`);
    } catch (error: any) {
      console.error('❌ Asset creation error:', error);
      setTestResult(`❌ Asset Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔧 Debug Authentication</h3>
      
      <div className="space-y-2 text-sm mb-4">
        <div>Status: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
          {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        </span></div>
        <div>User: {user?.email || 'None'}</div>
        <div>Token: {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}</div>
      </div>

      <div className="space-x-2 mb-4">
        <button 
          onClick={testAuth}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Test API Access
        </button>
        <button 
          onClick={testAssetCreation}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Test Asset Creation
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-2 rounded text-xs">
          {testResult}
        </div>
      )}
    </div>
  );
}