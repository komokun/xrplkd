import { createWallet, listWallets } from './wallet/wallet.controller';

const appRoutes = router => {
    router.post('/wallet/create', createWallet);
    router.get('/wallet/list', listWallets);
};

export default appRoutes;