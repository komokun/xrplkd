import { expect }   from 'chai'
import rimraf       from 'rimraf'

import manager      from '../src/wallet/wallet.manager'
import { Keys }     from '../src/crypto/xrpl.keys'

import { Glob }        from '../config/fs.config'
const fixtures      = require('./fixtures/sign.json');

async function new_wallet_fixture(...names) {

    Array.from(names).forEach(async (name) => {
        await manager.create(name).then((result) => { expect(result.result).to.equal('success');});
    });
}

async function wallet_fixture_with_key(name){

    let wallet = await manager.create(name);
    // Unlock wallet
    let unlocked = await manager.unlock(name, wallet.data.password);
    // Add first key to wallet
    return await manager.add_key(name, fixtures.seed);
}

const delay = ms => new Promise(_ => setTimeout(_, ms));

describe("Wallet Core Tests", function() {

    this.timeout(11000); // This works only if ES6 is not used to instance the function.

    Glob.init();
    /**
     * Delete the test/ directory before each test
     */
    afterEach(done => {
        rimraf(Glob.contents(), done);
    });

    after(done => {
        rimraf(Glob.all(), done);
    })

    it("Creates a new wallet.", async () => {
        const name = 'default';

        const result = await manager.create(name);
        expect(result.result).to.equal('success');
        expect(result.data.password).to.have.lengthOf(32);
    })

    it("Tries to create a duplicate named wallet.", async () => {
        const name = 'default';

        const first = await manager.create(name);
        expect(first.result).to.equal('success');

        const second = await manager.create(name);
        expect(second.result).to.equal('failure');
        expect(second.data.reason).to.equal('duplicate');
    })

    
    it("Creates a new wallet with no name provided.", async () => {
        const name = '';

        const result = await manager.create(name);
        
        expect(result.result).to.equal('success');
        expect(result.data.wallet).to.equal('default');
        expect(result.data.password).to.have.lengthOf(32);
    })

    it("Locks a wallet.", async () => {
 
        new_wallet_fixture('bag');
        const result = await manager.lock('bag');
        expect(result.result).to.equal('success');
        expect(result.data.status).to.equal('locked');
    })
 
    it("Unlocks a valid wallet.", async () => {
        
        new_wallet_fixture('bag');
        const result = await manager.unlock('bag', 'password');
        expect(result.result).to.equal('success');
        expect(result.data.status).to.equal('unlocked');
    })

    it("Locks... Unlock ... Locks a valid wallet.", async () => {
        
        new_wallet_fixture('bag');
        let result = await manager.lock('bag');
        expect(result.data.status).to.equal('locked');

        result = await manager.unlock('bag', 'password');
        expect(result.data.status).to.equal('unlocked');

        result = await manager.lock('bag');
        expect(result.data.status).to.equal('locked');

    })

    it("Should list all existing, valid wallets.", async () => {

        new_wallet_fixture('bag', 'hodl');
        const result = await manager.list();
        let res = result;
        expect(res.result).to.equal('success');
        expect(res.data).to.have.lengthOf(2); 
        expect(JSON.stringify(res.data[0])).to.equal(JSON.stringify({wallet: 'bag', status: 'locked'}));
    })

    it("Should reject when opening/unlocking a wallet that doesn't exist.", async () => {

        const result = await manager.unlock('bag', 'password');
        expect(result.data.status).to.equal('does_not_exist');
    })

    
    it("Verify locktime.", async () => {

        const result = await manager.create('bag');
        let res = result;
        expect(res.result).to.equal('success');
        expect(res.data.password).to.have.lengthOf(32);

        let unlocked = await manager.unlock('bag', res.data.password);
        expect(unlocked.data.status).to.equal('unlocked');

        //await delay(2000)

        // Get latest status for wallet.
        let locked = await manager.lock('bag');
        expect(locked.data.status).to.equal('locked');

    })

    it("Add two private keys.", async () => {

        let name = 'bag'
        // Generate two keypairs
        const first_keys = await Keys.pairs();
        expect(first_keys.result).to.equal('success');
        const second_keys = await Keys.pairs();
        expect(second_keys.result).to.equal('success');
        // Create wallet
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, wallet.data.password);
        //let wallet = unlocked.data;
        expect(unlocked.data.status).to.equal('unlocked');
        // Add first key to wallet
        const first_key_added = await manager.add_key(name, first_keys.data.secret);
        expect(first_key_added.result).to.equal('success');
        expect(first_key_added.data.keys).to.have.lengthOf(1);
        // Lock wallet
        await manager.lock(name);
        // Unlock wallet
        unlocked = null;
        unlocked = await manager.unlock(name, wallet.data.password);
        expect(unlocked.data.status).to.equal('unlocked');
        // Add second key to wallet
        const second_key_added = await manager.add_key(name, second_keys.data.secret);
        expect(second_key_added.result).to.equal('success');
        expect(second_key_added.data.keys).to.have.lengthOf(2);
    })

    it("Remove a private key from a wallet.", async () => {

        let name = 'bag'
        // Generate two keypairs
        const keys = await Keys.pairs();
        expect(keys.result).to.equal('success');
        // Create wallet
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, wallet.data.password);
        expect(unlocked.data.status).to.equal('unlocked');
        // Add key to wallet
        const key_added = await manager.add_key(name, keys.data.secret);
        expect(key_added.result).to.equal('success');
        expect(key_added.data.keys).to.have.lengthOf(1);
        // Remove key from wallet
        //const key_removed = await manager.remove_key(name, pubkey);

    })

    it("Sign a transaction.", async () => {

        // Create wallet
        let name = 'bag'
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, wallet.data.password);
        expect(unlocked.data.status).to.equal('unlocked');
        // Add first key to wallet
        const key_added = await manager.add_key(name, fixtures.seed);
        expect(key_added.result).to.equal('success');
        expect(key_added.data.keys).to.have.lengthOf(1);

        const signed = await manager.sign_transaction(name, fixtures.address, fixtures.message)
        expect(signed.result).to.equal('success');
        expect (signed.data.signature).to.equal(fixtures.signature);
    })

    it("List addresses in wallet.", async () => {
        let name = 'hodl'
        let keyed_wallet = await wallet_fixture_with_key(name);
        expect(keyed_wallet.data.keys).to.have.lengthOf(1);

        const keys = await manager.public_keys(name)
        expect(keys.result).to.equal('success');
        expect(keys.data).to.have.lengthOf(1);
    })

    it("Sign a digest.", async () => {
    })

});