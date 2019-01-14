import {
  LedgerWallet,
  TrezorWallet,
  BitBoxWallet,
  SecalotWallet
} from './hardware';
import WalletInterface from './WalletInterface';
import { MnemonicWallet } from './software';
import { MewConnectWallet, FinneyWallet } from './hybrid';

export {
  LedgerWallet,
  TrezorWallet,
  BitBoxWallet,
  SecalotWallet,
  MewConnectWallet,
  FinneyWallet,
  WalletInterface,
  MnemonicWallet
};
