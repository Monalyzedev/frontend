// Configuration du réseau Monad Testnet
export const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 en hexadécimal
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'], // URL RPC par défaut pour Monad Testnet
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

// Fonction pour ajouter le réseau Monad Testnet à MetaMask
export const addMonadTestnetToWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [MONAD_TESTNET],
    });
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    throw error;
  }
};

// Fonction pour changer vers le réseau Monad Testnet
export const switchToMonadTestnet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_TESTNET.chainId }],
    });
    return true;
  } catch (error: any) {
    // Si le réseau n'existe pas, l'ajouter
    if (error.code === 4902) {
      return await addMonadTestnetToWallet();
    }
    console.error('Error switching network:', error);
    throw error;
  }
};

// Fonction pour connecter le wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    // Vérifier si on est sur le bon réseau
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });
    
    if (chainId !== MONAD_TESTNET.chainId) {
      await switchToMonadTestnet();
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};

// Fonction pour obtenir l'adresse du wallet connecté
export const getConnectedAccount = async () => {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error retrieving account:', error);
    return null;
  }
};

// Fonction pour formater l'adresse (afficher seulement le début et la fin)
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};