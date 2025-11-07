import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FallbackSearchService {
  private readonly logger = new Logger(FallbackSearchService.name);

  // Base de données statique d'actions populaires
  private readonly stockDatabase = [
    // Actions US populaires
    { symbol: 'AAPL', name: 'Apple Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc Class A', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'GOOG', name: 'Alphabet Inc Class C', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'META', name: 'Meta Platforms Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'INTC', name: 'Intel Corporation', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'NFLX', name: 'Netflix Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'ZOOM', name: 'Zoom Video Communications Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'PTON', name: 'Peloton Interactive Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'SNAP', name: 'Snap Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'AVGO', name: 'Broadcom Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'CRM', name: 'Salesforce Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'ADBE', name: 'Adobe Inc', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'ORCL', name: 'Oracle Corporation', type: 'STOCK', region: 'United States', currency: 'USD' },
    { symbol: 'IBM', name: 'International Business Machines Corp', type: 'STOCK', region: 'United States', currency: 'USD' },

    // Actions françaises populaires
    { symbol: 'MC.PA', name: 'LVMH Moët Hennessy Louis Vuitton', type: 'STOCK', region: 'France', currency: 'EUR' },
    { symbol: 'SAP.PA', name: 'Safran SA', type: 'STOCK', region: 'France', currency: 'EUR' },
    { symbol: 'TTE.PA', name: 'TotalEnergies SE', type: 'STOCK', region: 'France', currency: 'EUR' },
    { symbol: 'BNP.PA', name: 'BNP Paribas SA', type: 'STOCK', region: 'France', currency: 'EUR' },
    { symbol: 'SAN.PA', name: 'Sanofi SA', type: 'STOCK', region: 'France', currency: 'EUR' },
    
    // ETFs populaires
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'ETF', region: 'United States', currency: 'USD' },
    { symbol: 'VEA', name: 'Vanguard Developed Markets ETF', type: 'ETF', region: 'United States', currency: 'USD' },

    // Cryptomonnaies populaires
    { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', region: 'Global', currency: 'USD' },
    { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', region: 'Global', currency: 'USD' },
    { symbol: 'ADA', name: 'Cardano', type: 'CRYPTO', region: 'Global', currency: 'USD' },
    { symbol: 'DOT', name: 'Polkadot', type: 'CRYPTO', region: 'Global', currency: 'USD' },
    { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', region: 'Global', currency: 'USD' },
    { symbol: 'AVAX', name: 'Avalanche', type: 'CRYPTO', region: 'Global', currency: 'USD' },
  ];

  /**
   * Search for assets in the fallback database
   */
  search(query: string, type?: string): Array<{ symbol: string; name: string; type: string; region: string; currency: string }> {
    const queryLower = query.toLowerCase().trim();
    
    if (queryLower.length < 1) {
      return [];
    }

    // Filtrer par type si spécifié
    let filteredDatabase = this.stockDatabase;
    if (type) {
      filteredDatabase = this.stockDatabase.filter(item => item.type === type);
    }

    // Recherche par symbole ou nom
    const results = filteredDatabase.filter(item => 
      item.symbol.toLowerCase().includes(queryLower) ||
      item.name.toLowerCase().includes(queryLower)
    );

    // Trier par pertinence : correspondance exacte du symbole > début du symbole > début du nom > autres
    results.sort((a, b) => {
      const aSymbolExact = a.symbol.toLowerCase() === queryLower;
      const bSymbolExact = b.symbol.toLowerCase() === queryLower;
      const aSymbolStarts = a.symbol.toLowerCase().startsWith(queryLower);
      const bSymbolStarts = b.symbol.toLowerCase().startsWith(queryLower);
      const aNameStarts = a.name.toLowerCase().startsWith(queryLower);
      const bNameStarts = b.name.toLowerCase().startsWith(queryLower);

      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;
      if (aSymbolStarts && !bSymbolStarts) return -1;
      if (!aSymbolStarts && bSymbolStarts) return 1;
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      
      return a.name.localeCompare(b.name);
    });

    this.logger.log(`Fallback search for "${query}" (type: ${type}): found ${results.length} results`);
    return results.slice(0, 10); // Limiter à 10 résultats
  }

  /**
   * Check if the service has data for a specific symbol
   */
  hasSymbol(symbol: string): boolean {
    return this.stockDatabase.some(item => item.symbol.toLowerCase() === symbol.toLowerCase());
  }

  /**
   * Get all available symbols for a specific type
   */
  getSymbolsByType(type: string): string[] {
    return this.stockDatabase
      .filter(item => item.type === type)
      .map(item => item.symbol);
  }
}