import Manager from './wallet.manager'
import { Keys }  from '../crypto/xrpl.keys'


export const createWallet = (req, res, next) => {

    Manager.create(req.body.name)
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

export const lockWallet = (req, res, next) => {

    Manager.lock(req.body.name)
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

    let input = {
        name: req.body.name,
        password: req.body.password,
    };

    Manager.unlock(input.name, input.password)
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

    let input = {
        name: req.body.name,
        secret: req.body.secret,
    };

    Manager.add_key(input.name, input.secret)
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

export const signTransaction = (req, res, next) => {

    let input = {
        name: req.body.name,
        address: req.body.address,
        message: req.body.message,
    };

    Manager.sign_transaction(input.name, input.address, input.message)
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
