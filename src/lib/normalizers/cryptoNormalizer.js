export function normalizeCoinRankingCoins(coins) {
  return coins.map(coin => {
    const change = Number(coin.change);

    return {
      symbol: coin.symbol,
      name: coin.name,
      price: Number(coin.price),
      change,
      percent: `${change.toFixed(2)}%`,
      changeType:
        change > 0 ? 'up' :
        change < 0 ? 'down' :
        'neutral',
      lastUpdated: new Date().toISOString()
    };
  });
}
