#!/usr/bin/env ts-node

import axios from 'axios';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

interface APITest {
  name: string;
  test: () => Promise<void>;
  required: boolean;
}

const tests: APITest[] = [
  {
    name: 'CoinGecko - Bitcoin Price',
    required: true,
    test: async () => {
      const apiKey = process.env.COINGECKO_API_KEY;
      const url = apiKey
        ? `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur&x_cg_demo_api_key=${apiKey}`
        : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur';

      const response = await axios.get(url);
      console.log('   ✅ Bitcoin:', response.data.bitcoin.eur, 'EUR');
    },
  },
  {
    name: 'Alpha Vantage - Apple Stock',
    required: true,
    test: async () => {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('API key not configured');
      }

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`
      );

      if (response.data['Global Quote']) {
        const price = response.data['Global Quote']['05. price'];
        console.log('   ✅ Apple (AAPL):', price, 'USD');
      } else if (response.data.Note) {
        throw new Error('Rate limit reached - Alpha Vantage allows 5 calls/min on free tier');
      } else {
        throw new Error('Unexpected response format');
      }
    },
  },
  {
    name: 'Binance - Bitcoin Price (Public)',
    required: false,
    test: async () => {
      const response = await axios.get(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR'
      );
      console.log('   ✅ Bitcoin (Binance):', response.data.price, 'EUR');
    },
  },
  {
    name: 'Exchange Rate API - USD to EUR',
    required: false,
    test: async () => {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (!apiKey || apiKey === 'YOUR_KEY') {
        throw new Error('API key not configured');
      }

      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      );

      if (response.data.conversion_rates) {
        const rate = response.data.conversion_rates.EUR;
        console.log('   ✅ 1 USD =', rate, 'EUR');
      } else {
        throw new Error('Unexpected response format');
      }
    },
  },
  {
    name: 'Yahoo Finance - Google Stock (via API)',
    required: false,
    test: async () => {
      // Yahoo Finance doesn't require API key for basic quotes
      const response = await axios.get(
        'https://query1.finance.yahoo.com/v8/finance/chart/GOOGL?interval=1d&range=1d'
      );

      const price = response.data.chart.result[0].meta.regularMarketPrice;
      console.log('   ✅ Google (GOOGL):', price, 'USD');
    },
  },
  {
    name: 'Artsy API - Authentication',
    required: false,
    test: async () => {
      const clientId = process.env.ARTSY_CLIENT_ID;
      const clientSecret = process.env.ARTSY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('API credentials not configured');
      }

      const response = await axios.post('https://api.artsy.net/api/tokens/xapp_token', {
        client_id: clientId,
        client_secret: clientSecret,
      });

      if (response.data.token) {
        console.log('   ✅ Authentication successful');
      } else {
        throw new Error('Authentication failed');
      }
    },
  },
];

async function runTests() {
  console.log('\n🧪 Testing API Connections\n');
  console.log('=' .repeat(60));

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    process.stdout.write(`\n📡 ${test.name}...\n`);

    try {
      await test.test();
      passed++;
    } catch (error: any) {
      if (test.required) {
        console.log(`   ❌ FAILED: ${error.message}`);
        failed++;
      } else {
        console.log(`   ⚠️  SKIPPED: ${error.message}`);
        skipped++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Passed:  ${passed}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(`   📝 Total:   ${tests.length}`);

  if (failed > 0) {
    console.log('\n⚠️  Some required APIs failed. Please check your .env configuration.');
    console.log('   See API_SETUP_GUIDE.md for setup instructions.\n');
    process.exit(1);
  } else if (passed === 0) {
    console.log('\n⚠️  No APIs configured yet. Please set up your API keys in .env');
    console.log('   See API_SETUP_GUIDE.md for setup instructions.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All configured APIs are working!\n');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('\n❌ Test runner failed:', error.message);
  process.exit(1);
});
