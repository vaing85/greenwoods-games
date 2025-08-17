const { ethers } = require('ethers');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

// Cryptocurrency Service for Phase 8
class CryptoService {
  constructor() {
    this.providers = {
      ethereum: new ethers.JsonRpcProvider(process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id'),
      bitcoin: process.env.BITCOIN_NETWORK || 'testnet'
    };
    
    this.supportedCurrencies = ['BTC', 'ETH', 'USDT', 'USDC'];
    this.priceCache = new Map();
    this.lastPriceUpdate = 0;
    this.PRICE_CACHE_DURATION = 60000; // 1 minute
  }

  // Get real-time cryptocurrency prices
  async getCryptoPrices() {
    const now = Date.now();
    
    if (now - this.lastPriceUpdate < this.PRICE_CACHE_DURATION && this.priceCache.size > 0) {
      return Object.fromEntries(this.priceCache);
    }

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,tether,usd-coin',
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_market_cap: true
          }
        }
      );

      const prices = {
        BTC: {
          price: response.data.bitcoin.usd,
          change24h: response.data.bitcoin.usd_24h_change,
          marketCap: response.data.bitcoin.usd_market_cap
        },
        ETH: {
          price: response.data.ethereum.usd,
          change24h: response.data.ethereum.usd_24h_change,
          marketCap: response.data.ethereum.usd_market_cap
        },
        USDT: {
          price: response.data.tether.usd,
          change24h: response.data.tether.usd_24h_change,
          marketCap: response.data.tether.usd_market_cap
        },
        USDC: {
          price: response.data['usd-coin'].usd,
          change24h: response.data['usd-coin'].usd_24h_change,
          marketCap: response.data['usd-coin'].usd_market_cap
        }
      };

      // Update cache
      this.priceCache.clear();
      Object.entries(prices).forEach(([key, value]) => {
        this.priceCache.set(key, value);
      });
      this.lastPriceUpdate = now;

      return prices;
    } catch (error) {
      console.error('Error fetching crypto prices:', error.message);
      
      // Return cached prices if available
      if (this.priceCache.size > 0) {
        return Object.fromEntries(this.priceCache);
      }
      
      // Fallback prices
      return {
        BTC: { price: 45000, change24h: 0, marketCap: 0 },
        ETH: { price: 3000, change24h: 0, marketCap: 0 },
        USDT: { price: 1, change24h: 0, marketCap: 0 },
        USDC: { price: 1, change24h: 0, marketCap: 0 }
      };
    }
  }

  // Validate Bitcoin address
  validateBitcoinAddress(address) {
    try {
      bitcoin.address.toOutputScript(address, 
        this.providers.bitcoin === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  // Validate Ethereum address
  validateEthereumAddress(address) {
    return ethers.isAddress(address);
  }

  // Get Bitcoin balance (requires Bitcoin Core RPC or third-party API)
  async getBitcoinBalance(address) {
    try {
      // Using BlockCypher API for demo (replace with your preferred service)
      const network = this.providers.bitcoin === 'mainnet' ? 'main' : 'test3';
      const response = await axios.get(
        `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/balance`
      );
      
      return {
        confirmed: response.data.balance / 100000000, // Convert satoshis to BTC
        unconfirmed: response.data.unconfirmed_balance / 100000000,
        total: response.data.total_received / 100000000
      };
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error.message);
      return { confirmed: 0, unconfirmed: 0, total: 0 };
    }
  }

  // Get Ethereum balance
  async getEthereumBalance(address) {
    try {
      const balance = await this.providers.ethereum.getBalance(address);
      return {
        eth: ethers.formatEther(balance),
        wei: balance.toString()
      };
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error.message);
      return { eth: '0', wei: '0' };
    }
  }

  // Generate deposit address (simplified - in production, use proper key management)
  generateDepositAddress(currency) {
    try {
      if (currency === 'BTC') {
        const network = this.providers.bitcoin === 'mainnet' 
          ? bitcoin.networks.bitcoin 
          : bitcoin.networks.testnet;
        
        const keyPair = bitcoin.ECPair.makeRandom({ network });
        const { address } = bitcoin.payments.p2pkh({ 
          pubkey: keyPair.publicKey, 
          network 
        });
        
        return {
          address,
          privateKey: keyPair.toWIF(), // Store securely in production!
          currency: 'BTC'
        };
      }
      
      if (currency === 'ETH') {
        const wallet = ethers.Wallet.createRandom();
        return {
          address: wallet.address,
          privateKey: wallet.privateKey, // Store securely in production!
          currency: 'ETH'
        };
      }
      
      throw new Error(`Unsupported currency: ${currency}`);
    } catch (error) {
      console.error('Error generating deposit address:', error.message);
      throw error;
    }
  }

  // Convert crypto amount to USD
  async convertToUSD(amount, currency) {
    const prices = await this.getCryptoPrices();
    const price = prices[currency]?.price || 0;
    return amount * price;
  }

  // Convert USD to crypto amount
  async convertFromUSD(usdAmount, currency) {
    const prices = await this.getCryptoPrices();
    const price = prices[currency]?.price || 1;
    return usdAmount / price;
  }

  // Estimate transaction fees
  async estimateTransactionFee(currency, amount = 0) {
    try {
      if (currency === 'BTC') {
        // Bitcoin fee estimation (simplified)
        const response = await axios.get('https://mempool.space/api/v1/fees/recommended');
        return {
          slow: response.data.economyFee / 100000000, // Convert to BTC
          medium: response.data.hourFee / 100000000,
          fast: response.data.fastestFee / 100000000
        };
      }
      
      if (currency === 'ETH') {
        // Ethereum gas estimation
        const gasPrice = await this.providers.ethereum.getGasPrice();
        const gasLimit = 21000; // Standard ETH transfer
        
        const feeWei = gasPrice * BigInt(gasLimit);
        const feeEth = ethers.formatEther(feeWei);
        
        return {
          slow: parseFloat(feeEth) * 0.8,
          medium: parseFloat(feeEth),
          fast: parseFloat(feeEth) * 1.2
        };
      }
      
      return { slow: 0, medium: 0, fast: 0 };
    } catch (error) {
      console.error('Error estimating transaction fee:', error.message);
      return { slow: 0, medium: 0, fast: 0 };
    }
  }

  // Process crypto deposit (webhook handler)
  async processDeposit(transactionData) {
    const { txHash, address, amount, currency, confirmations } = transactionData;
    
    try {
      // Minimum confirmations required
      const minConfirmations = {
        BTC: 1,
        ETH: 12,
        USDT: 12,
        USDC: 12
      };

      if (confirmations >= (minConfirmations[currency] || 1)) {
        // Credit user account
        return {
          success: true,
          txHash,
          amount,
          currency,
          usdValue: await this.convertToUSD(amount, currency),
          status: 'confirmed'
        };
      } else {
        return {
          success: false,
          txHash,
          amount,
          currency,
          status: 'pending',
          confirmationsNeeded: minConfirmations[currency] - confirmations
        };
      }
    } catch (error) {
      console.error('Error processing deposit:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  // Create withdrawal request
  async createWithdrawal(userId, address, amount, currency) {
    try {
      // Validate address
      const isValidAddress = currency === 'BTC' 
        ? this.validateBitcoinAddress(address)
        : this.validateEthereumAddress(address);
        
      if (!isValidAddress) {
        throw new Error('Invalid withdrawal address');
      }

      // Check minimum withdrawal amount
      const minimums = { BTC: 0.001, ETH: 0.01, USDT: 10, USDC: 10 };
      if (amount < minimums[currency]) {
        throw new Error(`Minimum withdrawal: ${minimums[currency]} ${currency}`);
      }

      // Estimate fees
      const fees = await this.estimateTransactionFee(currency, amount);
      
      const withdrawal = {
        id: `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        address,
        amount,
        currency,
        estimatedFee: fees.medium,
        netAmount: amount - fees.medium,
        status: 'pending',
        createdAt: new Date(),
        requiresApproval: amount > (currency === 'BTC' ? 0.1 : currency === 'ETH' ? 1 : 1000)
      };

      return withdrawal;
    } catch (error) {
      console.error('Error creating withdrawal:', error.message);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(address, currency, limit = 10) {
    try {
      if (currency === 'BTC') {
        const network = this.providers.bitcoin === 'mainnet' ? 'main' : 'test3';
        const response = await axios.get(
          `https://api.blockcypher.com/v1/btc/${network}/addrs/${address}/full?limit=${limit}`
        );
        
        return response.data.txs?.map(tx => ({
          hash: tx.hash,
          amount: tx.total / 100000000,
          confirmations: tx.confirmations,
          timestamp: new Date(tx.confirmed),
          type: tx.total > 0 ? 'received' : 'sent'
        })) || [];
      }
      
      if (currency === 'ETH') {
        // Simplified - would need Etherscan API or similar
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error.message);
      return [];
    }
  }
}

module.exports = CryptoService;
