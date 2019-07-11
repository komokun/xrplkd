import { Result } from '../wallet/wallet.result';


var generator = require('generate-password');
const keypairs = require('ripple-keypairs');
const RippledWsClientSign = require('rippled-ws-client-sign') 

export const Password = {

   generate: function () {
      return generator.generate({
         length: 32,
         numbers: true,
         uppercase: true
      });
   }
};


export const Keys = {

   pairs: function () {
      const seed = keypairs.generateSeed();
      const keypair = keypairs.deriveKeypair(seed);

      let data = {address: keypairs.deriveAddress(keypair.publicKey), secret: seed}
      return Result('success', data, '');
   },

   keypair: function (secret) {
      return keypairs.deriveKeypair(secret);
   },

   address: function (secret) {
      const keypair = keypairs.deriveKeypair(secret);

      return keypairs.deriveAddress(keypair.publicKey);
   },
   
   sign_message: function (secret, message) {

      let privkey = keypairs.deriveKeypair(secret).privateKey;

      const messageHex = (new Buffer(message, 'utf8')).toString('hex')
      const signature = keypairs.sign(messageHex, privkey);

      return signature;
   },

   sign_transaction: async function (secret, transaction) {

      return await new RippledWsClientSign(transaction, secret);
   },      

};
