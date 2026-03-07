import { useState } from "react";

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
}

export function usePayment() {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
  });

  const initiatePayment = async (amount: number) => {
    setState({ isProcessing: true, error: null });
    try {
      // Payment logic here
      console.log("Initiating payment for:", amount);
    } catch (error) {
      setState({
        isProcessing: false,
        error: error instanceof Error ? error.message : "Payment failed",
      });
    }
  };

  return { ...state, initiatePayment };
}
