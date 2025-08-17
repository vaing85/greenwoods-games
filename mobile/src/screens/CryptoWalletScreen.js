import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CryptoWalletScreen = ({ navigation }) => {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [balances, setBalances] = useState({});
  const [selectedTab, setSelectedTab] = useState('wallet');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Withdrawal form state
  const [withdrawalForm, setWithdrawalForm] = useState({
    currency: 'BTC',
    address: '',
    amount: ''
  });

  const supportedCurrencies = [
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDT', name: 'Tether', icon: '₮' },
    { code: 'USDC', name: 'USD Coin', icon: '$' }
  ];

  useEffect(() => {
    fetchCryptoPrices();
    fetchBalances();
  }, []);

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/crypto/prices');
      const data = await response.json();
      if (data.success) {
        setCryptoPrices(data.prices);
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    }
  };

  const fetchBalances = async () => {
    try {
      // Mock balances for demo - in production, fetch from user's actual wallets
      setBalances({
        BTC: 0.05423,
        ETH: 1.234,
        USDT: 1250.00,
        USDC: 850.50
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCryptoPrices(), fetchBalances()]);
    setRefreshing(false);
  };

  const validateAddress = async (address, currency) => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/crypto/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, currency })
      });
      const data = await response.json();
      return data.success && data.isValid;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  };

  const handleWithdraw = async () => {
    const { currency, address, amount } = withdrawalForm;
    
    if (!address || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > (balances[currency] || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    
    try {
      const isValidAddress = await validateAddress(address, currency);
      if (!isValidAddress) {
        Alert.alert('Error', 'Invalid address for selected currency');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/phase8/crypto/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123', // Replace with actual user ID
          address,
          amount: parseFloat(amount),
          currency
        })
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Withdrawal request submitted successfully');
        setWithdrawalForm({ currency: 'BTC', address: '', amount: '' });
        fetchBalances(); // Refresh balances
      } else {
        Alert.alert('Error', data.error || 'Withdrawal failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const generateDepositAddress = async (currency) => {
    try {
      const response = await fetch('http://localhost:5000/api/phase8/crypto/generate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Deposit Address',
          `Your ${currency} deposit address:\n\n${data.address}`,
          [{ text: 'Copy', onPress: () => {/* Copy to clipboard */} }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate deposit address');
    }
  };

  const renderWalletTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Your Crypto Wallet</Text>
      
      {supportedCurrencies.map((currency) => {
        const balance = balances[currency.code] || 0;
        const price = cryptoPrices[currency.code] || 0;
        const usdValue = balance * price;
        
        return (
          <View key={currency.code} style={styles.currencyItem}>
            <View style={styles.currencyHeader}>
              <Text style={styles.currencyIcon}>{currency.icon}</Text>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.code}</Text>
              </View>
              <View style={styles.currencyBalance}>
                <Text style={styles.balanceAmount}>{balance.toFixed(6)}</Text>
                <Text style={styles.balanceUsd}>${usdValue.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.currencyActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.depositButton]}
                onPress={() => generateDepositAddress(currency.code)}
              >
                <Icon name="add" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={() => {
                  setWithdrawalForm({...withdrawalForm, currency: currency.code});
                  setSelectedTab('withdraw');
                }}
              >
                <Icon name="remove" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderWithdrawTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Withdraw Crypto</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.currencySelector}>
          {supportedCurrencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyOption,
                withdrawalForm.currency === currency.code && styles.selectedCurrency
              ]}
              onPress={() => setWithdrawalForm({...withdrawalForm, currency: currency.code})}
            >
              <Text style={styles.currencyOptionText}>{currency.code}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={styles.input}
          value={withdrawalForm.address}
          onChangeText={(address) => setWithdrawalForm({...withdrawalForm, address})}
          placeholder={`Enter ${withdrawalForm.currency} address`}
          multiline
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={withdrawalForm.amount}
          onChangeText={(amount) => setWithdrawalForm({...withdrawalForm, amount})}
          placeholder="0.00"
          keyboardType="numeric"
        />
        
        <Text style={styles.availableBalance}>
          Available: {(balances[withdrawalForm.currency] || 0).toFixed(6)} {withdrawalForm.currency}
        </Text>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Processing...' : 'Submit Withdrawal'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPricesTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Live Crypto Prices</Text>
      
      {supportedCurrencies.map((currency) => {
        const price = cryptoPrices[currency.code] || 0;
        const change24h = Math.random() * 10 - 5; // Mock 24h change
        const isPositive = change24h >= 0;
        
        return (
          <View key={currency.code} style={styles.priceItem}>
            <View style={styles.priceHeader}>
              <Text style={styles.currencyIcon}>{currency.icon}</Text>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyName}>{currency.name}</Text>
                <Text style={styles.currencyCode}>{currency.code}</Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>${price.toFixed(2)}</Text>
                <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
                  {isPositive ? '+' : ''}{change24h.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Wallet</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'wallet', label: 'Wallet', icon: 'account-balance-wallet' },
          { key: 'withdraw', label: 'Withdraw', icon: 'send' },
          { key: 'prices', label: 'Prices', icon: 'trending-up' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Icon name={tab.icon} size={20} color={selectedTab === tab.key ? '#4CAF50' : '#666'} />
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'wallet' && renderWalletTab()}
      {selectedTab === 'withdraw' && renderWithdrawTab()}
      {selectedTab === 'prices' && renderPricesTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#16213e',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  currencyItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#4CAF50',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  currencyCode: {
    fontSize: 12,
    color: '#999',
  },
  currencyBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  balanceUsd: {
    fontSize: 12,
    color: '#999',
  },
  currencyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  depositButton: {
    backgroundColor: '#4CAF50',
  },
  withdrawButton: {
    backgroundColor: '#FF5722',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  change: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  selectedCurrency: {
    backgroundColor: '#4CAF50',
  },
  currencyOptionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  availableBalance: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CryptoWalletScreen;
