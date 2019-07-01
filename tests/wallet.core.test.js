import { expect }   from 'chai'
import rimraf       from 'rimraf'

import manager      from '../src/wallet/wallet.manager'
import { Keys }     from '../src/crypto/xrpl.keys'

import { Glob }        from './fixtures/test.config'
const fixtures      = require('./fixtures/sign.json');

async function new_wallet_fixture(...names) {

    Array.from(names).forEach(async (name) => {
        await manager.create(name).then((result) => { expect(JSON.parse(result).result).to.equal('success');});
    });
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
        let res = JSON.parse(result);
        expect(res.result).to.equal('success');
        expect(res.data.password).to.have.lengthOf(32);
    })

    it("Locks a wallet.", async () => {
 
        new_wallet_fixture('bag');
        const result = await manager.lock('bag');
        let res = JSON.parse(result);
        expect(res.result).to.equal('success');
        expect(res.data.status).to.equal('locked');
    })
 
    it("Unlocks a valid wallet.", async () => {
        
        new_wallet_fixture('bag');
        const result = await manager.unlock('bag', 'password');
        let res = JSON.parse(result);
        expect(res.result).to.equal('success');
        expect(res.data.status).to.equal('unlocked');
    })

    it("Locks... Unlock ... Locks a valid wallet.", async () => {
        
        new_wallet_fixture('bag');
        let result = await manager.lock('bag');
        expect(JSON.parse(result).data.status).to.equal('locked');

        result = await manager.unlock('bag', 'password');
        expect(JSON.parse(result).data.status).to.equal('unlocked');

        result = await manager.lock('bag');
        expect(JSON.parse(result).data.status).to.equal('locked');
    })

    it("Should list all existing, valid wallets.", async () => {

        new_wallet_fixture('bag', 'hodl');
        const result = await manager.list();
        let res = JSON.parse(result);
        expect(res.result).to.equal('success');
        expect(res.data).to.have.lengthOf(2); 
        expect(JSON.stringify(res.data[0])).to.equal(JSON.stringify({wallet: 'bag', status: 'locked'}));
    })

    it("Should reject when opening/unlocking a wallet that doesn't exist.", async () => {

        const result = await manager.unlock('bag', 'password');
        expect(JSON.parse(result).data.status).to.equal('does_not_exist');
    })

    
    it("Verify locktime.", async () => {

        const result = await manager.create('bag');
        let res = JSON.parse(result);
        expect(res.result).to.equal('success');
        expect(res.data.password).to.have.lengthOf(32);

        let res1 = await manager.unlock('bag', res.data.password);
        expect(JSON.parse(res1).data.status).to.equal('unlocked');

        //await delay(2000)

        // Get latest status for wallet.
        let res2 = await manager.lock('bag');
        expect(JSON.parse(res2).data.status).to.equal('locked');

    })

    it("Add two private keys.", async () => {

        let name = 'bag'
        // Generate two keypairs
        const first_keys = await Keys.pairs();
        expect(JSON.parse(first_keys).result).to.equal('success');
        const second_keys = await Keys.pairs();
        expect(JSON.parse(second_keys).result).to.equal('success');
        // Create wallet
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, JSON.parse(wallet).data.password);
        //let wallet = JSON.parse(unlocked).data;
        expect(JSON.parse(unlocked).data.status).to.equal('unlocked');
        // Add first key to wallet
        const first_key_added = await manager.add_key(name, JSON.parse(first_keys).data.secret);
        expect(JSON.parse(first_key_added).result).to.equal('success');
        expect(JSON.parse(first_key_added).data.keys).to.have.lengthOf(1);
        // Lock wallet
        await manager.lock(name);
        // Unlock wallet
        unlocked = null;
        unlocked = await manager.unlock(name, JSON.parse(wallet).data.password);
        expect(JSON.parse(unlocked).data.status).to.equal('unlocked');
        // Add second key to wallet
        const second_key_added = await manager.add_key(name, JSON.parse(second_keys).data.secret);
        expect(JSON.parse(second_key_added).result).to.equal('success');
        expect(JSON.parse(second_key_added).data.keys).to.have.lengthOf(2);
    })

    it("Remove a private key from a wallet.", async () => {

        let name = 'bag'
        // Generate two keypairs
        const keys = await Keys.pairs();
        expect(JSON.parse(keys).result).to.equal('success');
        // Create wallet
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, JSON.parse(wallet).data.password);
        expect(JSON.parse(unlocked).data.status).to.equal('unlocked');
        // Add key to wallet
        const key_added = await manager.add_key(name, JSON.parse(keys).data.secret);
        expect(JSON.parse(key_added).result).to.equal('success');
        expect(JSON.parse(key_added).data.keys).to.have.lengthOf(1);
        // Remove key from wallet
        //const key_removed = await manager.remove_key(name, pubkey);

    })

    it("Sign a transaction.", async () => {

        // Create wallet
        let name = 'bag'
        const wallet = await manager.create(name);
        // Unlock wallet
        let unlocked = await manager.unlock(name, JSON.parse(wallet).data.password);
        expect(JSON.parse(unlocked).data.status).to.equal('unlocked');
        // Add first key to wallet
        const key_added = await manager.add_key(name, fixtures.seed);
        expect(JSON.parse(key_added).result).to.equal('success');
        expect(JSON.parse(key_added).data.keys).to.have.lengthOf(1);

        const signed = await manager.sign_transaction(name, fixtures.address, fixtures.message)
        expect(JSON.parse(signed).result).to.equal('success');
        expect (JSON.parse(signed).data.signature).to.equal(fixtures.signature);
    })

    it("Sign a digest.", async () => {
    })
});