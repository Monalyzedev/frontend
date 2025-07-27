import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowUpDown, 
  Settings, 
  Info,
  ChevronDown,
  Wallet,
  AlertTriangle,
  Zap
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// Mock tokens data
const initialTokens = [
  {
    symbol: "MON",
    name: "Monad",
    balance: "1,234.56",
    logo: "https://img.bgstatic.com/multiLang/coinPriceLogo/monad.png",
    address: "--",
    price: 1.85 // Prix en USD pour le calcul
  },
  {
    symbol: "WMON",
    name: "Wrapped Monad",
    balance: "0.85",
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
    address: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
    price: 2500.00
  },
  {
    symbol: "CHOG",
    name: "Chog",
    balance: "850.00",
    logo: "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/5d1206c2-042c-4edc-9f8b-dcef2e9e8f00/public",
    address: "0xE0590015A873bF326bd645c3E1266d4db41C4E6B",
    price: 1.00
  },
  {
    symbol: "DAK",
    name: "Molandak",
    balance: "383.28",
    logo: "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/27759359-9374-4995-341c-b2636a432800/public",
    address: "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714",
    price: 0.999
  },
  {
    symbol: "YAKI",
    name: "Moyaki",
    balance: "2345.34",
    logo: "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/6679b698-a845-412b-504b-23463a3e1900/public",
    address: "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50",
    price: 0.999
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "50.00",
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public",
    address: "0x5D876D73f4441D5f2438B1A3e2A51771B337F27A",
    price: 0.999
  },
  {
    symbol: "USDT",
    name: "USD Tether",
    balance: "50.00",
    logo: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/images.png/public",
    address: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
    price: 0.999
  },
];

const Swap = () => {
  const { account, isConnected } = useWallet();
  const [tokens, setTokens] = useState(initialTokens);
  const [fromToken, setFromToken] = useState(initialTokens[0]);
  const [toToken, setToToken] = useState(initialTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isSwapping, setIsSwapping] = useState(false);

  // Calculer le taux de change basé sur les prix USD
  const exchangeRate = fromToken.price / toToken.price;

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number(value))) {
      const convertedAmount = Number(value) * exchangeRate;
      setToAmount(convertedAmount.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    const currentFromToken = tokens.find(t => t.symbol === fromToken.symbol);
    const maxAmount = currentFromToken?.balance.replace(",", "") || "0";
    handleFromAmountChange(maxAmount);
  };

  const handleSwap = () => {
    if (!fromAmount || !toAmount) {
      toast({
        title: "Invalid amounts",
        description: "Please enter valid amounts to swap.",
        variant: "destructive",
      });
      return;
    }

    const fromAmountNum = parseFloat(fromAmount);
    const toAmountNum = parseFloat(toAmount);
    
    // Vérifier si l'utilisateur a assez de fonds
    const currentFromToken = tokens.find(t => t.symbol === fromToken.symbol);
    const currentFromBalance = parseFloat(currentFromToken?.balance.replace(",", "") || "0");
    
    if (fromAmountNum > currentFromBalance) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${fromToken.symbol} to complete this swap.`,
        variant: "destructive",
      });
      return;
    }
    setIsSwapping(true);
    
    // Simulate swap transaction
    setTimeout(() => {
      // Mettre à jour les balances des tokens
      setTokens(prevTokens => 
        prevTokens.map(token => {
          if (token.symbol === fromToken.symbol) {
            const newBalance = currentFromBalance - fromAmountNum;
            return {
              ...token,
              balance: newBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })
            };
          }
          if (token.symbol === toToken.symbol) {
            const currentToBalance = parseFloat(token.balance.replace(",", "") || "0");
            const newBalance = currentToBalance + toAmountNum;
            return {
              ...token,
              balance: newBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 6 
              })
            };
          }
          return token;
        })
      );
      
      // Mettre à jour les tokens sélectionnés avec les nouvelles balances
      setFromToken(prev => {
        const updatedToken = tokens.find(t => t.symbol === prev.symbol);
        return updatedToken ? { ...updatedToken } : prev;
      });
      
      setToToken(prev => {
        const updatedToken = tokens.find(t => t.symbol === prev.symbol);
        return updatedToken ? { ...updatedToken } : prev;
      });
      
      setIsSwapping(false);
      toast({
        title: "Swap successful!",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      setFromAmount("");
      setToAmount("");
    }, 3000);
  };

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
                Please connect your wallet to start swapping tokens
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Swap Tokens</h1>
            <p className="text-muted-foreground">
              Trade tokens instantly on Monad Testnet
            </p>
          </div>

          {/* Swap Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Swap</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:text-white hover:bg-violet-600">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Swap Settings</DialogTitle>
                      <DialogDescription>
                        Adjust your swap preferences
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Slippage Tolerance
                        </label>
                        <div className="flex gap-2">
                          {["0.1", "0.5", "1.0"].map((value) => (
                            <Button
                              key={value}
                              variant={slippage === value ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSlippage(value)}
                              className="flex-1 hover:text-white hover:bg-violet-600"
                            >
                              {value}%
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">From</span>
                  <span className="text-muted-foreground">
                    Balance: {tokens.find(t => t.symbol === fromToken.symbol)?.balance || fromToken.balance}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="text-lg font-medium"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMaxClick}
                      className="hover:text-white hover:bg-violet-600"
                    >
                      MAX
                    </Button>
                    <Select
                      value={fromToken.symbol}
                      onValueChange={(value) => {
                        const token = tokens.find(t => t.symbol === value);
                        if (token) setFromToken(token);
                      }}
                    >
                      <SelectTrigger className="w-24 hover:text-white hover:bg-violet-600">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={fromToken.logo} />
                            <AvatarFallback>{fromToken.symbol.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{fromToken.symbol}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="w-64" side="bottom" sideOffset={8} align="start" avoidCollisions={false}>
                        {tokens.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol} className="hover:bg-violet-600 hover:text-white">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={token.logo} />
                                <AvatarFallback>{token.symbol.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-muted-foreground">{token.name}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwapTokens}
                  className="rounded-full hover:text-white hover:bg-violet-600"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="text-muted-foreground">
                    Balance: {tokens.find(t => t.symbol === toToken.symbol)?.balance || toToken.balance}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      readOnly
                      className="text-lg font-medium bg-muted/50"
                    />
                  </div>
                  <Select
                    value={toToken.symbol}
                    onValueChange={(value) => {
                      const token = tokens.find(t => t.symbol === value);
                      if (token) setToToken(token);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={toToken.logo} />
                          <AvatarFallback>{toToken.symbol.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{toToken.symbol}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="w-64" side="bottom" sideOffset={8} align="start" avoidCollisions={false}>
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={token.logo} />
                              <AvatarFallback>{token.symbol.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-xs text-muted-foreground">{token.name}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Swap Info */}
              {fromAmount && toAmount && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span>1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slippage</span>
                    <span>{slippage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span>~0.001 MON</span>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                disabled={!fromAmount || !toAmount || isSwapping}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                style={{ boxShadow: 'var(--glow-primary)' }}
              >
                {isSwapping ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Swap Tokens
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Recent Swaps */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent swaps</p>
                <p className="text-xs">Your swap history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Swap;