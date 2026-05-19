/**
 * PatrickHub Pricing Engine
 * Logic:
 * 1. Base Cost (B) - Price Admin charges the Agent.
 * 2. Agent Price (A) - Price Agent sets for the Customer.
 * 3. Platform Fee (F) - Fixed transaction fee added at checkout.
 * 4. Total Price (T) - What the customer pays (A + F).
 * 5. Agent Margin (M) - Profit for the agent (A - B).
 */

export const calculatePricing = (baseCost: number, agentPrice: number, platformFee: number) => {
  const totalPrice = agentPrice + platformFee;
  const agentMargin = agentPrice - baseCost;
  
  return {
    baseCost,
    agentPrice,
    platformFee,
    totalPrice,
    agentMargin,
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);
};
