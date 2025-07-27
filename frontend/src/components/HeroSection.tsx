import { useWallet } from "@/hooks/useWallet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import Decimal from "decimal.js";
import makeBlockie from "ethereum-blockies-base64";
import { BadgeDollarSign, FileText, Wallet } from "lucide-react";
import { useTheme } from "next-themes";

type Token = {
  name: string;
  balance: Decimal;
  contract: string | null;
};

const HeroSection = () => {
  const { isConnected, isCorrectNetwork } = useWallet();
  const { theme } = useTheme();

  const [walletAddress, setWalletAddress] = useState("");
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [balanceMON, setBalanceMON] = useState<Decimal | null>(null);
  const [txCount, setTxCount] = useState<number | null>(null);
  const [contractCount, setContractCount] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const DECIMALS = 18;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (x < 0) x = 0;
    else if (x > rect.width) x = rect.width;
    if (y < 0) y = 0;
    else if (y > rect.height) y = rect.height;

    setMousePosition({ x, y });
  };

  const handleAnalyze = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setBalanceMON(null);
    setTxCount(null);
    setContractCount(null);
    setTokens([]);

    toast({
      title: "Scanning wallet...",
      description: `Looking up ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    });

    try {
      const [balanceRes, txRes, contractRes, tokensRes] = await Promise.all([
        fetch(`https://backend-vg07.onrender.com/api/balance/${walletAddress}`),
        fetch(`https://backend-vg07.onrender.com/api/txcount/${walletAddress}`),
        fetch(`https://backend-vg07.onrender.com/api/contractcount/${walletAddress}`),
        fetch(`https://backend-vg07.onrender.com/api/tokens/${walletAddress}`),
      ]);

      const balanceData = await balanceRes.json();
      const raw = String(balanceData.balanceMON ?? "0").replace(/,/g, "");
      const balanceDecimal = new Decimal(raw).div(new Decimal(10).pow(DECIMALS));
      setBalanceMON(balanceDecimal);

      const txData = await txRes.json();
      setTxCount(txData.txCount ?? null);

      const contractData = await contractRes.json();
      setContractCount(contractData.contractCount ?? null);

      const tokensData = await tokensRes.json();
      const simplifiedTokens: Token[] = tokensData.map((t: any) => {
        const raw = String(t.balance || "0").replace(/,/g, "");
        const parsed = new Decimal(raw).div(new Decimal(10).pow(DECIMALS));
        return {
          name: t.name || "Unknown",
          balance: parsed,
          contract: t.contract || null,
        };
      });

      setTokens(simplifiedTokens);

      toast({
        title: "Analysis complete",
        description: `Balance: ${balanceDecimal.toFixed(4)} MON`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to analyze wallet. Check API/backend.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasResults = balanceMON !== null || txCount !== null || contractCount !== null;

  // Helper classes for colors based on theme
  const textPrimary = theme === "light" ? "text-black" : "text-white";
  const textSecondary = theme === "light" ? "text-gray-700" : "text-violet-300";
  const iconColor = theme === "light" ? "text-gray-700" : "text-violet-400";

  return (
    <section
      className={`relative flex flex-col items-center justify-center pt-12 px-6
        transition-all duration-500 ease-in-out
        min-h-[calc(100vh-200px)] overflow-hidden`}
      onMouseMove={handleMouseMove}
      style={{ paddingBottom: hasResults ? "2rem" : "10rem" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-violet-950/10"></div>

      <div
        className="absolute pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: "translate(-50%, -50%)",
          width: 384,
          height: 384,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 70%, transparent 100%)",
          filter: "blur(3rem)",
          opacity: 0.8,
          pointerEvents: "none",
          willChange: "transform",
        }}
      ></div>

      <div
        className={`relative z-10 text-center max-w-4xl mx-auto w-full transition-all duration-700 ease-in-out
          ${hasResults ? "mt-4" : "mt-20"}`}
      >
        <h1 className="text-6xl md:text-8xl font-bold text-violet-600 mb-6">Monalyze</h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6">
          Scan your insights on Monad Testnet - track your tokens, transactions, activity, NFTs, and
          more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto mb-6">
          <Input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground px-4 py-6 text-lg min-w-[300px] sm:flex-1"
            disabled={loading}
          />
          <Button
            size="lg"
            onClick={handleAnalyze}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold"
            style={{ boxShadow: "var(--glow-primary)" }}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        {/* Wallet summary */}
        {hasResults && (
          <div
            className={`mb-8 px-6 py-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-violet-800 shadow-xl max-w-3xl mx-auto space-y-6 animate-fade-in
              ${textPrimary}`}
          >
            <div className="flex items-center gap-4">
              <img
                src={makeBlockie(walletAddress)}
                alt="Blockie"
                className="w-12 h-12 rounded-full border border-white/20"
              />
              <div className="text-left">
                <p className={`text-sm ${textSecondary}`}>Wallet</p>
                <p className={`font-mono text-md break-all ${textPrimary}`}>{walletAddress}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <Wallet className={`mx-auto mb-2 ${iconColor}`} size={28} />
                <p className={`text-2xl font-bold ${textPrimary}`}>{balanceMON?.toFixed(4) ?? "—"}</p>
                <p className={`text-sm ${textSecondary}`}>Balance (MON)</p>
              </div>
              <div>
                <FileText className={`mx-auto mb-2 ${iconColor}`} size={28} />
                <p className={`text-2xl font-bold ${textPrimary}`}>{txCount ?? "—"}</p>
                <p className={`text-sm ${textSecondary}`}>Transactions</p>
              </div>
              <div>
                <BadgeDollarSign className={`mx-auto mb-2 ${iconColor}`} size={28} />
                <p className={`text-2xl font-bold ${textPrimary}`}>{contractCount ?? "—"}</p>
                <p className={`text-sm ${textSecondary}`}>Contracts Interacted</p>
              </div>
            </div>
          </div>
        )}

        {/* Token Table */}
        {tokens.length > 0 && (
          <div className="max-w-5xl mx-auto overflow-x-auto rounded-xl bg-white/5 backdrop-blur-md border border-violet-800 shadow-lg">
            <table className="w-full text-white text-sm">
              <thead className="border-b border-violet-700">
                <tr>
                  <th className="px-6 py-3 text-left text-violet-300">#</th>
                  <th className="px-6 py-3 text-left text-violet-300">Token</th>
                  <th className="px-6 py-3 text-left text-violet-300">Balance</th>
                  <th className="px-6 py-3 text-left text-violet-300">Contract</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={token.contract ?? index} className="hover:bg-violet-800/30">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{token.name}</td>
                    <td className="px-6 py-4">{token.balance.toFixed(4)}</td>
                    <td className="px-6 py-4 font-mono text-violet-400 max-w-[160px] truncate">
                      {token.contract ? (
                        <a
                          href={`https://testnet.monadexplorer.com/address/${token.contract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {token.contract.slice(0, 6)}...{token.contract.slice(-4)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
