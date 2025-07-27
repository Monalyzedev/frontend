import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Coins,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/web3";
import { ethers } from "ethers";

type Token = {
  address: string;
  symbol: string;
  name: string;
  logo: string;
  balance?: string; // string formatted
  price?: number;
  value?: string; // formatted value in $
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
};

const tokensList: Token[] = [
  {
    address: "0x0000000000000000000000000000000000000000", // token natif Monad
    symbol: "MON",
    name: "Monad",
    logo: "https://img.bgstatic.com/multiLang/coinPriceLogo/monad.png",
  },
  {
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    symbol: "WMON",
    name: "Wrapped Monad",
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
  },
];

// Prix fictif statique (à remplacer par une vraie API si besoin)
async function fetchTokenPrice(tokenAddress: string): Promise<number> {
  if (tokenAddress === "0x0000000000000000000000000000000000000000") return 1.85;
  return 1;
}

/**
 * Récupère le solde d'un token natif ou ERC20 via MonadScan API (similaire à Etherscan)
 * @param tokenAddress : adresse du token, "0x0" pour natif
 * @param userAddress : adresse wallet utilisateur
 * @returns solde en string (wei ou base token)
 */
async function fetchTokenBalanceAPI(tokenAddress: string, userAddress: string): Promise<string> {
  const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  const BASE_URL = "https://api.monadscan.io/api"; // <-- URL officielle MonadScan (ajuste si différente)

  // Params communs
  const params = new URLSearchParams({
    module: "account",
    address: userAddress,
    tag: "latest",
    apikey: API_KEY || "",
  });

  // Action différente selon token natif ou ERC20
  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    params.append("action", "balance");
    // Pas de contractaddress pour natif
  } else {
    params.append("action", "tokenbalance");
    params.append("contractaddress", tokenAddress);
  }

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    // MonadScan API répond aussi avec status "1" pour succès et "0" sinon
    if (data.status === "1" && data.result) {
      return data.result;
    }
    throw new Error(data.message || "API returned error");
  } catch (error) {
    console.error("fetchTokenBalanceAPI error:", error);
    return "0";
  }
}

const Portfolio = () => {
  const { account, isConnected } = useWallet();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [tokensError, setTokensError] = useState<string | null>(null);

  const [nfts, setNFTs] = useState<any[]>([]);
  const [nftsLoading, setNFTsLoading] = useState(false);
  const [nftsError, setNFTsError] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTokenBalances = async () => {
    if (!account) return;

    setTokensLoading(true);
    setTokensError(null);

    try {
      const results = await Promise.all(
        tokensList.map(async (token) => {
          const balanceRaw = await fetchTokenBalanceAPI(token.address, account);
          const decimals = 18; // Monad tokens ont 18 décimales

          // formatUnits peut lancer si balanceRaw invalide, try catch possible si besoin
          const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);

          const price = await fetchTokenPrice(token.address);
          const valueNum = parseFloat(balanceFormatted) * price;

          const changeType = valueNum > 0 ? "positive" : "negative";
          const change = valueNum > 0 ? "+3.0%" : "-1.2%";

          return {
            ...token,
            balance: parseFloat(balanceFormatted).toFixed(4),
            price,
            value: valueNum.toFixed(2),
            change,
            changeType,
          };
        })
      );
      setTokens(results);
    } catch (error) {
      setTokensError("Failed to load tokens");
      console.error(error);
    } finally {
      setTokensLoading(false);
    }
  };

  const fetchNFTs = async () => {
    if (!account) return;

    setNFTsLoading(true);
    setNFTsError(null);

    try {
      const res = await fetch(`https://api-devnet.magiceden.io/rpc/getTokensByOwner/${account}`);
      if (!res.ok) throw new Error("Failed to fetch NFTs");
      const data = await res.json();
      setNFTs(data.results || []);
    } catch (error) {
      setNFTsError("Failed to load NFTs");
      console.error(error);
    } finally {
      setNFTsLoading(false);
    }
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTokenBalances(), fetchNFTs()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isConnected) {
      refreshAll();
    } else {
      setTokens([]);
      setNFTs([]);
      setTokensError(null);
      setNFTsError(null);
    }
  }, [isConnected, account]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view your portfolio
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const totalValue = tokens.reduce((acc, t) => acc + parseFloat(t.value || "0"), 0).toFixed(2);
  const totalChange = "+3.8%";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Wallet: {formatAddress(account!)}</p>
          </div>
          <Button
            onClick={refreshAll}
            disabled={isRefreshing}
            variant="outline"
            className="mt-4 sm:mt-0 hover:text-white hover:bg-violet-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">${totalValue}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {totalChange}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{tokens.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Different assets</p>
                  {tokensError && <p className="text-red-600 mt-2">{tokensError}</p>}
                </div>
                <Coins className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total NFTs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{nfts.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Collectibles</p>
                  {nftsError && <p className="text-red-600 mt-2">{nftsError}</p>}
                </div>
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              NFTs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                {tokensLoading && <p>Loading tokens...</p>}
                {!tokensLoading && tokens.length === 0 && <p>No tokens found.</p>}
                <div className="space-y-4">
                  {tokens.map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={token.logo} alt={token.symbol} />
                          <AvatarFallback>{token.symbol.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-sm text-muted-foreground">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {token.balance} {token.symbol}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">${token.value}</p>
                          <Badge
                            variant={token.changeType === "positive" ? "default" : "destructive"}
                            className={
                              token.changeType === "positive"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : token.changeType === "negative"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }
                          >
                            {token.changeType === "positive" && (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            )}
                            {token.changeType === "negative" && (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {token.change}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfts" className="mt-6">
            {nftsLoading && <p>Loading NFTs...</p>}
            {!nftsLoading && nfts.length === 0 && <p>No NFTs found.</p>}
            {!nftsLoading && nfts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <Card
                    key={nft.mintAddress || nft.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={nft.image || nft.img || nft.metadata?.image}
                        alt={nft.name || nft.title || "NFT Image"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 truncate">
                        {nft.name || nft.title || "NFT"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {nft.collection || nft.creator || "Unknown Collection"}
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 hover:text-white hover:bg-violet-600"
                        onClick={() =>
                          window.open(
                            `https://testnet.monadexplorer.com/address/${account}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Portfolio;
