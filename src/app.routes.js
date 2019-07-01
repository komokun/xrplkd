import { createWallet, listWallets, lockWallet, unlockWallet, 
    signTransaction, createKeyPair } from './wallet/wallet.controller';

const appRoutes = router => {
    router.post('/wallet/create', createWallet);
    router.post('/wallet/lock', lockWallet);
    router.post('/wallet/unlock', unlockWallet);
    router.get('/wallet/list', listWallets);
    router.post('/wallet/sign', signTransaction);
    router.post('/wallet/keypair', createKeyPair);
};

export default appRoutes;