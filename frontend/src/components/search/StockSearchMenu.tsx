import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Building2, X } from 'lucide-react';
import api from '../../services/api';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region?: string;
  currency?: string;
  provider: string;
}

interface StockSearchMenuProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function StockSearchMenu({ 
  onSelect, 
  placeholder = "Rechercher des actions et ETFs...",
  className = ""
}: StockSearchMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchAssets = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Recherche pour les stocks et ETFs
      const [stockResponse, etfResponse] = await Promise.all([
        api.get(`/aggregation/search?query=${encodeURIComponent(query)}&type=STOCK`),
        api.get(`/aggregation/search?query=${encodeURIComponent(query)}&type=ETF`)
      ]);

      const allResults = [
        ...stockResponse.data.map((r: any) => ({ ...r, type: 'STOCK' })),
        ...etfResponse.data.map((r: any) => ({ ...r, type: 'ETF' }))
      ];

      // Filtrer les doublons par symbol et trier par pertinence
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.symbol, item])).values()
      ).sort((a, b) => {
        // Priorité: correspondance exacte du symbol > nom commençant par query > autres
        const queryLower = query.toLowerCase();
        const aSymbolMatch = a.symbol.toLowerCase() === queryLower;
        const bSymbolMatch = b.symbol.toLowerCase() === queryLower;
        const aNameMatch = a.name.toLowerCase().startsWith(queryLower);
        const bNameMatch = b.name.toLowerCase().startsWith(queryLower);

        if (aSymbolMatch && !bSymbolMatch) return -1;
        if (!aSymbolMatch && bSymbolMatch) return 1;
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      });

      setSearchResults(uniqueResults.slice(0, 10)); // Limiter à 10 résultats
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAssets(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setSearchQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'ETF':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'STOCK':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Building2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAssetBadge = (type: string) => {
    const badges = {
      STOCK: { text: 'Action', color: 'bg-green-100 text-green-800' },
      ETF: { text: 'ETF', color: 'bg-blue-100 text-blue-800' }
    };
    
    const badge = badges[type as keyof typeof badges] || { text: type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input de recherche */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
        >
          {searchResults.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              {searchQuery.length < 2 ? (
                "Tapez au moins 2 caractères pour rechercher"
              ) : isLoading ? (
                "Recherche en cours..."
              ) : (
                "Aucun résultat trouvé"
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </div>
              {searchResults.map((result, index) => (
                <button
                  key={`${result.symbol}-${result.provider}`}
                  onClick={() => handleSelect(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getAssetIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.name}
                          </p>
                          {getAssetBadge(result.type)}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-blue-600 font-mono">
                            {result.symbol}
                          </p>
                          {result.region && (
                            <span className="text-xs text-gray-500">
                              • {result.region}
                            </span>
                          )}
                          {result.currency && (
                            <span className="text-xs text-gray-500">
                              • {result.currency}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Source: {result.provider}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Aide clavier */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-40 mt-1 w-full">
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 rounded-b-md border-t">
            <span className="inline-flex items-center space-x-4">
              <span>↑↓ Naviguer</span>
              <span>↵ Sélectionner</span>
              <span>Esc Fermer</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}