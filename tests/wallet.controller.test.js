import { expect }       from 'chai';
import rimraf           from 'rimraf'
import server           from '../src/index';
import  request         from 'supertest';

import manager          from '../src/wallet/wallet.manager'
import { Glob }         from './fixtures/test.config'

const fixtures          = require('./fixtures/sign.json');


async function wallet_fixture(name) {

    return await manager.create(name)
}

async function wallet_fixture_with_key(name){
    let wallet = await manager.create(name);
    // Unlock wallet
    let unlocked = await manager.unlock(name, JSON.parse(wallet).data.password);
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

    it('POST /api/v1/wallet/create creates a wallet',async()=>{
        const response= await request(server).post('/api/v1/wallet/create');
        expect(response.status).to.equal(201)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.password).to.have.lengthOf(32);
    })

    it('PUT /api/v1/wallet/:name/lock locks an unlocked wallet', async()=>{
        const name = 'hodl'
        const unlocked_wallet = await wallet_fixture_with_key(name);
        expect(JSON.parse(unlocked_wallet).data.keys).to.have.lengthOf(1);
        
        const url = `/api/v1/wallet/${name}/lock`;
        const response= await request(server).put(url).set('Accept', 'application/json');
        expect(response.status).to.equal(202)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.status).to.equal('locked');
    })

    it('PUT /api/v1/wallet/:name/unlock/:pass locks an unlocked wallet', async()=>{
        const name = 'hodl'
        const wallet = await wallet_fixture(name);
        expect(JSON.parse(wallet).data.password).to.have.lengthOf(32);

        const url = `/api/v1/wallet/${name}/unlock/${JSON.parse(wallet).data.password}`;
        const response= await request(server).put(url).set('Accept', 'application/json');
        expect(response.status).to.equal(202)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.status).to.equal('unlocked');
    })

    it("PUT /api/v1/wallet/:name/addkey/:secret returns a list of addresses in a wallet.", async () => {
        const name = 'hodl'
        const keyed_wallet = await wallet_fixture_with_key(name);
        expect(JSON.parse(keyed_wallet).data.keys).to.have.lengthOf(1);

        const url = `/api/v1/wallet/${name}/addkey/${fixtures.seed}`;
        const response= await request(server).put(url);
        expect(response.status).to.equal(202)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.keys).to.have.lengthOf(2);
    })


    it("GET /api/v1/wallet/:name/keys returns a list of addresses in a wallet.", async () => {
        let name = 'hodl'
        let keyed_wallet = await wallet_fixture_with_key(name);
        expect(JSON.parse(keyed_wallet).data.keys).to.have.lengthOf(1);

        let url = `/api/v1/wallet/${name}/keys`;
        const response= await request(server).get(url);
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data).to.have.lengthOf(1);
    })

    it('GET /api/v1/wallet/list returns a list of valid of wallets', async()=>{
        const response= await request(server).get('/api/v1/wallet/list');
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.body).result).to.equal('success');
    })
    
    it('POST /api/v1/wallet/sign_transaction returns a signed transaction', async()=>{
        let name = 'hodl'
        let keyed_wallet = await wallet_fixture_with_key(name);
        expect(JSON.parse(keyed_wallet).data.keys).to.have.lengthOf(1);

        let body = { name: name, address: fixtures.address, message: fixtures.message }; 
        const response= await request(server)
                                .post('/api/v1/wallet/sign')
                                .send(body)
                                .set('Accept', 'application/json');
        expect(response.status).to.equal(201);
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.signature).to.equal(fixtures.signature);
    })

    it('POST /api/v1/wallet/keypair creates new signing key. Return xrp address and secret(seed)',async()=>{
        const response= await request(server).post('/api/v1/wallet/keypair');
        expect(response.status).to.equal(201)
        expect(JSON.parse(response.body).result).to.equal('success');
    })
})