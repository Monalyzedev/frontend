import { useState, useEffect } from 'react';
import { connectWallet, getConnectedAccount, switchToMonadTestnet, MONAD_TESTNET } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Vérifier la connexion au chargement
  useEffect(() => {
    checkConnection();
    
    // Écouter les changements de compte et de réseau
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      const connectedAccount = await getConnectedAccount();
      setAccount(connectedAccount);
      
      if (connectedAccount) {
        await checkNetwork();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
    }
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      // Convertir le chainId en nombre pour comparaison
      const currentChainId = parseInt(chainId, 16);
      const targetChainId = parseInt(MONAD_TESTNET.chainId, 16);
      setIsCorrectNetwork(currentChainId === targetChainId);
    } catch (error) {
      console.error('Erreur lors de la vérification du réseau:', error);
      setIsCorrectNetwork(false);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    setAccount(accounts[0] || null);
    if (accounts[0]) {
      checkNetwork();
    } else {
      setIsCorrectNetwork(false);
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Convertir le chainId en nombre pour comparaison
    const currentChainId = parseInt(chainId, 16);
    const targetChainId = parseInt(MONAD_TESTNET.chainId, 16);
    setIsCorrectNetwork(currentChainId === targetChainId);
    // Recharger la page pour éviter les problèmes de state
    // window.location.reload(); // Commenté pour éviter le rechargement automatique
  };

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not detected",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      setIsCorrectNetwork(true);
      
      toast({
        title: "Wallet connected",
        description: "Successfully connected to Monad Testnet!",
      });
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Connection error",
        description: error.message || "Unable to connect to wallet.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    try {
      await switchToMonadTestnet();
      setIsCorrectNetwork(true);
      toast({
        title: "Network switched",
        description: "Successfully connected to Monad Testnet!",
      });
    } catch (error: any) {
      console.error('Erreur lors du changement de réseau:', error);
      toast({
        title: "Network error",
        description: error.message || "Unable to switch network.",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsCorrectNetwork(false);
    
    // Révoquer les permissions pour forcer une vraie déconnexion
    if (window.ethereum && window.ethereum.request) {
      window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      }).catch((error) => {
        // Si wallet_revokePermissions n'est pas supporté, ignorer silencieusement
        console.log('Revoking permissions not supported');
      });
    }
    
    toast({
      title: "Wallet disconnected",
      description: "You have been successfully disconnected.",
    });
  };

  return {
    account,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    isConnected: !!account,
  };
};