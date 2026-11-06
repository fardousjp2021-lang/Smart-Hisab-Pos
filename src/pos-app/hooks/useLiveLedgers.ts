import { useState } from 'react';

export function useLiveLedgers(active: boolean) {
  return {
    purchases: [],
    purchaseReturns: [],
    expenses: [],
    loading: false,
    error: null,
  };
}
