import { Keys }         from '../crypto/xrpl.keys'
import { SafeKeeper }   from '../crypto/password.safe'
import { Files }        from '../utils/file.utils'
import config           from 'config';

const path        = require('path')

const pvault      = require('../crypto/password.vault');
const Vault       = pvault(config.get('wallet_dir'));

let keys = 'keys'

export const WalletInfo = {

   get_secret: (name, address) => {

      /*SafeKeeper.get(name) Returns password for pvt key list*/
      let wallet = new Vault(name, SafeKeeper.get(name), { create: false });
      // Read private key list; then derive and populate public key list
      let s = null;
      wallet.get(keys).forEach((secret) => {
         if (address.trim() === Keys.address(secret).trim()){
            s = secret;
         }
      });
      return s;
   },

   get_public_keys: (name) => {

      let pubkeys = [];
      /*SafeKeeper.get(name) Returns password for pvt key list*/
      let wallet = new Vault(name, SafeKeeper.get(name), { create: false });
      // Read private key list; then derive and populate public key list
      wallet.get(keys).forEach((secret) => {
         pubkeys.push(Keys.address(secret))
      });

      return pubkeys;
   },

   get_list: () => {
      let names = []
      let files = Files.getByExt(config.get('wallet_dir'), config.get('wallet_ext'));
      files.forEach((file) => {
         names.push({ wallet: path.basename(file).replace(/\.[^/.]+$/, ""), 
            status:  SafeKeeper.status(path.basename(file).replace(/\.[^/.]+$/, "")) });
      })
   
      return names;      
   }
}