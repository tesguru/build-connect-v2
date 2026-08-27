import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  RUB: "₽",
  BRL: "R$",
  ZAR: "R",
  CHF: "Fr",
  SEK: "kr",
  NZD: "NZ$",
  SGD: "S$",
  HKD: "HK$",
  KRW: "₩",
  TRY: "₺",
  MXN: "$",
  PHP: "₱",
};

function getSymbol(currency: string) {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
}

type CurrencyState = {
  currency: string;
  currencySymbol: string;
  setCurrency: (currency: string) => void;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      currencySymbol: "$",
      setCurrency: (currency: string) => {
        const symbol = getSymbol(currency);
        set({ currency, currencySymbol: symbol });
      },
    }),
    {
      name: "currency-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
