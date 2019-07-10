import mkdirp       from "mkdirp"
import path         from 'path'

import config       from 'config';


const vaultFolder   = path.join(config.get('vault_dir'));
const walletFolder  = path.join(config.get('wallet_dir'));

export const Glob = {
   
   all: () => { return `${vaultFolder}` + `,` + `${walletFolder}`+ '}'; },
   contents: () => { return '{' + `${vaultFolder}/*` + `,` + `${walletFolder}/*`+ '}'; },

   init: () => { mkdirp(config.get('vault_dir')); mkdirp(config.get('wallet_dir')); }
}
