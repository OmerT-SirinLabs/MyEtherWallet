import SirinConnection from 'sirin_wallet_web_sdk';
import ethTx from 'ethereumjs-tx';
import WalletInterface from '@/wallets/WalletInterface';
import { MEW_CONNECT as mewConnectType } from '../../bip44/walletTypes';
import {
  getSignTransactionObject,
  sanitizeHex,
  getBufferFromHex
} from '../../utils';
import * as ethUtil from 'ethereumjs-util';

const SIGNALER_URL = 'https://1e89310a.ngrok.io'; //'http://connect.sirinlabs.com:80';
const IS_HARDWARE = true;

// TODO: add listener and ui notification on RtcConnectedEvent and RtcClosedEvent
class SirinWalletInterface extends WalletInterface {
  constructor(pubkey, isHardware, identifier, txSigner, msgSigner, conn) {
    super(pubkey, true, identifier);
    this.txSigner = txSigner;
    this.msgSigner = msgSigner;
    this.isHardware = isHardware;
    this.conn = conn;
  }
  getConnection() {
    return this.conn;
  }
  signTransaction(txParams) {
    return super.signTransaction(txParams, this.txSigner);
  }
  signMessage(msg) {
    return super.signMessage(msg, this.msgSigner);
  }
}

class SirinWallet {
  constructor() {
    console.log('create sirinwallet');
    this.identifier = mewConnectType;
    this.isHardware = IS_HARDWARE;
    this.conn = new SirinConnection.Initiator();
  }
  async init(qrcode) {
    this.conn.on('codeDisplay', qrcode);
    const txSigner = async tx => {
      return new Promise(resolve => {
        this.conn.sendRtcMessage('signTx', JSON.stringify(tx));
        this.conn.once('signTx', result => {
          tx = new ethTx(sanitizeHex(result));
          resolve(getSignTransactionObject(tx));
        });
      });
    };
    const msgSigner = async msg => {
      return new Promise(resolve => {
        const msgHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(msg));
        this.conn.sendRtcMessage('signMessage', {
          hash: msgHash.toString('hex'),
          text: msg
        });
        this.conn.once('signMessage', data => {
          resolve(getBufferFromHex(sanitizeHex(data.sig)));
        });
      });
    };
    const address = await signalerConnect(SIGNALER_URL, this.conn);

    return new SirinWalletInterface(
      sanitizeHex(address),
      this.isHardware,
      this.identifier,
      txSigner,
      msgSigner,
      this.conn
    );
  }
}
const createWallet = async qrcode => {
  console.log('creatin wallet');
  const _SirinWallet = new SirinWallet();
  console.log(qrcode);
  const _tWallet = await _SirinWallet.init(qrcode);
  return _tWallet;
};
const signalerConnect = (url, conn) => {
  console.log('connect to service');
  return new Promise(resolve => {
    console.log('send event initiatorStart');
    conn.initiatorStart(url);
    conn.on('RtcConnectedEvent', () => {
      console.log('connected, now asking for address');
      conn.sendRtcMessage('address', '');
      conn.once('address', data => {
        resolve(data.address);
      });
    });
  });
};

export default createWallet;
