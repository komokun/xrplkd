import { createWallet, listWallets, lockWallet, unlockWallet, 
    addKey, walletKeys, signTransaction, createKeyPair } from './wallet/wallet.controller';

const appRoutes = router => {
    router.post('/wallet/create', createWallet);
    router.post('/wallet/lock', lockWallet);
    router.post('/wallet/unlock', unlockWallet);
    router.put('/wallet/:name/addkey/:secret', addKey);
    router.get('/wallet/:name/keys', walletKeys);
    router.get('/wallet/list', listWallets);
    router.post('/wallet/sign', signTransaction);
    router.post('/wallet/keypair', createKeyPair);
};

export default appRoutes;