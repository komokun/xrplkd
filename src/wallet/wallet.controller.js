import Manager from './wallet.manager'
import { Keys }  from '../crypto/xrpl.keys'


export const createWallet = (req, res, next) => {

    let name = '';
    if (req.body.name) { name = req.body.name; }
    
    Manager.create(name)
    .then( (result) => {

        (result.result === 'failure') ? res.status(403) : res.status(201); 
        res.json(result);
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const lockWallet = (req, res, next) => {

    const name = req.params.name;

    Manager.lock(name)
    .then( (result) => {
        res.status(202); 
        res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const unlockWallet = (req, res, next) => {

    const name = req.params.name;
    const pass = req.params.pass;

    Manager.unlock(name, pass)
    .then( (result) => {
        res.status(202); 
        res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const listWallets = (req, res, next) => {

    Manager.list()
    .then( (result) => {
       res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const addKey = (req, res, next) => {

    const name = req.params.name;
    const secret = req.params.secret;

    Manager.add_key(name, secret)
    .then( (result) => {
       res.status(202); 
       res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const walletKeys = (req, res, next) => {

    const name = req.params.name;
    
    Manager.public_keys(name)
    .then( (result) => {
        res.status(200); 
        res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const signTransaction = (req, res, next) => {

    const name = req.params.name;
    const input = {
        address: req.body.address,
        message: req.body.message,
    };

    Manager.sign_transaction(name, input.address, input.message)
    .then( (result) => {
        res.status(201); 
        res.json(result);
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const createKeyPair = (req, res, next) => {

    Keys.pairs()
    .then( (result) => {
        res.status(201); 
        res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};

export const appStatus = (req, res, next) => {


    Manager.application()
    .then( (result) => {
        res.status(200); 
        res.json(result); 
    })
    .catch( (err) => {
        res.json({
            error: err
        });
    })
};
