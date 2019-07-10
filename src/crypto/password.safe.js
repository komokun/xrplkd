/**
 * The purpose of SafeKeeper is to store encrypted passwords of individual wallets.
 * When the user unlocks a wallet using a wallet specific password, the encryption 
 * of the password is then stored by SafeKeeper only for the duration of the time set
 * by the LockTimer function.
 * 
 *
 * The SafeKeeper vault lives only for the lifetime of the running process.
 * 
 */

const fs = require('fs');
const path = require('path');

const pvault    = require('./password.vault');
const Vault     = pvault(config.get('vault_dir')); // Vault folder

import config from 'config';

let pass = new Vault('pword_vault', 'password', { create: true });
let wdir = config.get('vault_dir');
let wext = config.get('vault_ext');

export const SafeKeeper = {

   set: function (key, password) { // key = wallet name;

      pass.set(key, password); LockTimer(key); 
   },

   get: function (key) {

      return pass.get(key);
   },

   unset: function(key) {

      pass.unset(key);
   },

   lockall: function() {

      pass.keys().forEach((key) => {
         pass.unset(key);
      });
   },

   status: function(key) {
      if(fs.existsSync(path.join(config.get('wallet_dir'), `${key}.${wext}`))){

         return pass.get(key) === null ? 'locked' : 'unlocked';            
      } else {

         return `does_not_exist`;
      }
   }
};

const delay = ms => new Promise(_ => setTimeout(_, ms));

async function LockTimer(key) {
  
   await delay(60000);
   SafeKeeper.unset(key);
}