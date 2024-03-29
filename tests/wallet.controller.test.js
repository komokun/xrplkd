import { expect }       from 'chai';
import rimraf           from 'rimraf'
import server           from '../src/index';
import  request         from 'supertest';

import manager          from '../src/wallet/wallet.manager'
import { Glob }         from '../config/fs.config'

const fixtures          = require('./fixtures/sign.json');


async function wallet_fixture(name) {

    return await manager.create(name)
}

async function wallet_fixture_with_key(name){
    const wallet = await manager.create(name);
    // Unlock wallet
    await manager.unlock(name, wallet.data.password);
    // Add first key to wallet
    return await manager.add_key(name, fixtures.seed);
}

describe('Wallets API Tests',()=>{

    Glob.init();

    afterEach(done => {
        rimraf(Glob.contents(), done);
    });

    after(done => {
        rimraf(Glob.all(), done);
    })

    it('GET /api/v1 check application status',async()=>{
        const response= await request(server).get('/api/v1');
        expect(response.status).to.equal(200)
        expect(response.body.result).to.equal('success');
    })

    it('POST /api/v1/wallet/create creates a wallet',async()=>{
        const response= await request(server).post('/api/v1/wallet/create')
                                             .send({name: 'bag'})
                                             .set('Accept', 'application/json');
        expect(response.status).to.equal(201)
        expect(response.body.result).to.equal('success');
        expect(response.body.data.password).to.have.lengthOf(32);
    })

    it('POST /api/v1/wallet/create creates a wallet with a duplicated name',async()=>{
        const first = await request(server).post('/api/v1/wallet/create')
                                             .send({name: 'bag'})
                                             .set('Accept', 'application/json');
        expect(first.status).to.equal(201)
        expect(first.body.result).to.equal('success');

        const second = await request(server).post('/api/v1/wallet/create')
                                             .send({name: 'bag'})
                                             .set('Accept', 'application/json');
        expect(second.status).to.equal(403)
        expect(second.body.result).to.equal('failure');
        expect(second.body.data.reason).to.equal('duplicate');
    })

    it('PUT /api/v1/wallet/:name/lock locks an unlocked wallet', async()=>{
        const name = 'hodl'
        const unlocked_wallet = await wallet_fixture_with_key(name);
        expect(unlocked_wallet.data.keys).to.have.lengthOf(1);
        
        const url = `/api/v1/wallet/${name}/lock`;
        const response= await request(server).put(url).set('Accept', 'application/json');
        expect(response.status).to.equal(202)
        expect(response.body.result).to.equal('success');
        expect(response.body.data.status).to.equal('locked');
    })

    it('PUT /api/v1/wallet/:name/unlock/:pass unlocks a wallet', async()=>{
        const name = 'hodl'
        const wallet = await wallet_fixture(name);
        expect(wallet.data.password).to.have.lengthOf(32);

        const url = `/api/v1/wallet/${name}/unlock/${wallet.data.password}`;
        const response= await request(server).put(url).set('Accept', 'application/json');
        expect(response.status).to.equal(202)
        expect(response.body.result).to.equal('success');
        expect(response.body.data.status).to.equal('unlocked');

    })

    it("PUT /api/v1/wallet/:name/addkey/:secret add key to specified wallet.", async () => {
        const name = 'hodl'
        const keyed_wallet = await wallet_fixture_with_key(name);
        expect(keyed_wallet.data.keys).to.have.lengthOf(1);

        const url = `/api/v1/wallet/${name}/addkey/${fixtures.seed}`;
        const response= await request(server).put(url);
        expect(response.status).to.equal(202)
        expect(response.body.result).to.equal('success');
        expect(response.body.data.keys).to.have.lengthOf(2);
    })


    it("GET /api/v1/wallet/:name/keys returns a list of addresses in a wallet.", async () => {
        const name = 'hodl'
        const keyed_wallet = await wallet_fixture_with_key(name);
        expect(keyed_wallet.data.keys).to.have.lengthOf(1);

        const url = `/api/v1/wallet/${name}/keys`;
        const response= await request(server).get(url);
        expect(response.status).to.equal(200)
        expect(response.body.result).to.equal('success');
        expect(response.body.data).to.have.lengthOf(1);
    })

    it('GET /api/v1/wallet/list returns a list of valid of wallets', async()=>{
        const response= await request(server).get('/api/v1/wallet/list');
        expect(response.status).to.equal(200)
        expect(response.body.result).to.equal('success');
    })
    
    it('POST /api/v1/wallet/sign/transaction returns a signed transaction blob and id', async()=>{
        const name = 'hodl'
        const keyed_wallet = await wallet_fixture_with_key(name);
        expect(keyed_wallet.data.keys).to.have.lengthOf(1);

        const url = `/api/v1/wallet/${name}/sign/transaction`;

        const transaction = {
            TransactionType: 'Payment',
            Account: fixtures.address,
            Fee: 10,
            Destination: 'rPnZovFzRPYGc4zoQPZVxjZmiyPHaiZ5gH',
            DestinationTag: 1337,
            Amount: 1.05 * 1000000, // Amount in drops, so multiply (6 decimal positions)
            Sequence: 110
        }
        const body = { address: fixtures.address, transaction: transaction }; 
        
        const response= await request(server)
                                .post(url)
                                .send(body)
                                .set('Accept', 'application/json');

        expect(response.status).to.equal(201);
        expect(response.body.result).to.equal('success');
    })

    it('POST /api/v1/wallet/sign/message returns a signed message', async()=>{
        const name = 'hodl'
        const keyed_wallet = await wallet_fixture_with_key(name);
        expect(keyed_wallet.data.keys).to.have.lengthOf(1);

        const url = `/api/v1/wallet/${name}/sign/message`;
        const body = { address: fixtures.address, message: fixtures.message }; 
        const response= await request(server)
                                .post(url)
                                .send(body)
                                .set('Accept', 'application/json');
        expect(response.status).to.equal(201);
        expect(response.body.result).to.equal('success');
        expect(response.body.data.signature).to.equal(fixtures.signature);
    })

    it('GET /api/v1/wallet/keypair creates new signing key. Return xrp address and secret(seed)',async()=>{
        const response= await request(server).get('/api/v1/wallet/keypair');
        expect(response.status).to.equal(201)
        expect(response.body.result).to.equal('success');
    })
})