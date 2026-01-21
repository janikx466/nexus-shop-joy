// Currency formatting utilities for PKR (Pakistani Rupees)

export const formatPKR = (amount: number): string => {
  return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatRs = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Generate unique Order ID in format: LUXRE-ORD-{YYYYMMDD}-{RANDOM4}
export const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate random 4 character alphanumeric
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `LUXRE-ORD-${dateStr}-${random}`;
};
