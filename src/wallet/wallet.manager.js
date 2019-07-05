import { SafeKeeper }      from '../crypto/password.safe'
import { Password, Keys }  from '../crypto/xrpl.keys'
import { Result }          from './wallet.result'
import { WalletInfo }      from './wallet.info'

import config     from 'config';

const pvault    = require('../crypto/password.vault');
const Vault     = pvault(config.get('wallet_dir')); // Wallet vault folder

let message = '' // a string detailing the result of the operation.
let data = null; // a json of return data.
let keys = 'keys'


const WalletManager = {

   application: () => {
      return Result('success', {}, '');
   },

   create: (name) => {

      if(name.trim() === ''){
         name = 'default';
      }

      if (!check_if_name_is_valid(name)) { 
         return Result('failure', { reason: 'invalid' }, `The submitted name '${name}' cannot be used as wallet name`);
      }

      // console.log('Does name exist ? ', check_if_wallet_with_same_name_exists(name));
      if (check_if_wallet_with_same_name_exists(name)) { 
         return Result('failure', { reason: 'duplicate' }, `A wallet with name '${name}' already exists.`);
      }

      const password = Password.generate();
      new Vault(name, password, { create: true });
      message = `Wallet '${name}' has been created with password ${password}. Ensure password is kept safely.`
      return Result('success', { wallet: name, password: password }, message);
   },

   add_key: (name, secret) => {

      if (!check_if_wallet_with_same_name_exists(name)) { 
         return Result('failure', {}, `A wallet with name '${name}' does not exists.`);
      }

      if (!check_if_wallet_is_unlocked(name)) { 
         return Result('failure', {}, `Wallet '${name}' is locked. \nPlease unlock with password before using.`);
      }

      try {

         const pubkey = Keys.address(secret);
         let wallet = new Vault(name, SafeKeeper.get(name), { create: false });
         let list = [];
         // Get and validate list.
         list = wallet.get(keys);
         list === null ? list = [] : list;
         Array.isArray(list) ? list : list = []; 
         // Persist
         list.push(secret);
         wallet.set(keys, list);
         // Derive all public keys.
         return Result('success', {wallet: name, keys: WalletInfo.get_public_keys(name)}, `Added ${pubkey} to wallet '${name}'.`);
      } catch (error) {
         return Result('failure', {}, `Failed to add key to wallet '${name}'. : ${error}`);
      }
  },

   verify: (name, pubkey) => {
      return WalletInfo.get_public_keys(name).includes(pubkey) ? 
            Result('success', {}, `${pubkey} is in wallet '${name}'`) :  
            Result('failure', {}, `${pubkey} is NOT in wallet '${name}'`)
   },

   unlock: (name, password) => {

      try {
         
         SafeKeeper.set(name, password); return Result('success', {status: SafeKeeper.status(name)}, `Wallet '${name}' ${SafeKeeper.status(name)}`);
      } catch (error) { return Result('failure', {status: SafeKeeper.status(name)}, `Internal system error.`); }
   },

   lock: (name) => {

      try {
         
         SafeKeeper.unset(name); return Result('success', {status: SafeKeeper.status(name)}, `Wallet '${name}' ${SafeKeeper.status(name)}`);
      } catch (error) { return Result('failure', {status: SafeKeeper.status(name)}, `Internal system error.`); }
   },

   lock_all: () => {
      
      try {
         
         SafeKeeper.lockall(); return Result('success', {}, `Wallet(s) locked`);
      } catch (error) { return Result('failure', {}, `Internal system error.`); }
   },

   list: () => {
   
      data = WalletInfo.get_list();
      message = `${data.length} valid wallet(s) found.`
      return Result('success', data, message);
   },

   // Add password verification.
   status: (name) => { return Result({name: name, status: SafeKeeper.status(name)}); },

   // Wallet name. Use as Safekeeper 'key'
   public_keys: (name) => { 

      let keys = WalletInfo.get_public_keys(name);
      return Result('success', keys, `${keys.length} valid public key(s) found.`);
   },

   sign_transaction: (name, address, message) => { 


      if (!check_if_wallet_is_unlocked(name)) { 
         return Result('failure', {}, `Wallet '${name}' is locked. \nPlease unlock with password before using.`);
      }

      const secret = WalletInfo.get_secret(name, address);
      if(secret === null) {   
         return Result('failure', {}, `Provided public key NOT in wallet '${name}'.`);
      }
      const signature = Keys.sign(secret, message);
      return Result('success', { signature: signature }, message);
   },

   sign_digest: () => { return Result(data, {}, message); }
};

function check_if_wallet_is_unlocked(name){  return SafeKeeper.status(name) === 'unlocked' ? true : false;  }

function check_if_name_is_valid(name){ return (!/[^a-z]/.test(name)); };

function check_if_wallet_with_same_name_exists(name){ 

   // console.log('Wallet name ', name);
   // console.log('Wallet list full ', WalletInfo.get_list());
   // console.log('Wallet list ', WalletInfo.get_wallet_name_list());
   return WalletInfo.get_wallet_name_list().includes(name.trim()); 
};

export default WalletManager;