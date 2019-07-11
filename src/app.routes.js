import { createWallet, listWallets, lockWallet, unlockWallet, 
    addKey, walletKeys, signTransaction, createKeyPair, 
    signMessage, appStatus } from './wallet/wallet.controller';

const appRoutes = router => {
    
    router.get('/', appStatus);
    router.post('/wallet/create', createWallet);
    router.put('/wallet/:name/lock', lockWallet);
    router.put('/wallet/:name/unlock/:pass', unlockWallet);
    router.put('/wallet/:name/addkey/:secret', addKey);
    router.get('/wallet/:name/keys', walletKeys);
    router.get('/wallet/list', listWallets);
    router.post('/wallet/:name/sign/transaction', signTransaction);
    router.post('/wallet/:name/sign/message', signMessage);
    router.get('/wallet/keypair', createKeyPair);
};

export default appRoutes;