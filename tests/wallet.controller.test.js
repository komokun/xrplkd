import { expect } from 'chai';
import rimraf       from 'rimraf'
import server from '../src/index';
import  request  from 'supertest';

import manager      from '../src/wallet/wallet.manager'

import { Glob }        from './fixtures/test.config'
const fixtures      = require('./fixtures/sign.json');


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

    after(done => {
        rimraf(Glob.all(), done);
    })

    it('GET /api/v1/wallet/ returns an array of wallets', async()=>{
        const response= await request(server).get('/api/v1/wallet/list');
        //console.log(response.body);
        expect(response.status).to.equal(200)
        expect(JSON.parse(response.body).result).to.equal('success');
    })

    
    it('POST /api/v1/wallet/create creates a wallet',async()=>{
        const response= await request(server).post('/api/v1/wallet/create');
        expect(response.status).to.equal(201)
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.password).to.have.lengthOf(32);
    })

    
    it('POST /api/v1/wallet/sign_transaction returns a signed transaction', async()=>{
        let name = 'hodl'
        let keyed_wallet = await wallet_fixture_with_key(name);
        //console.log('Keyed Wallet : ', keyed_wallet);
        expect(JSON.parse(keyed_wallet).data.keys).to.have.lengthOf(1);

        let body = { name: name, address: fixtures.address, message: fixtures.message }; 
        const response= await request(server)
                                .post('/api/v1/wallet/sign')
                                .send(body)
                                .set('Accept', 'application/json');

//        console.log('Response Body : ', response.body);
        expect(response.status).to.equal(201);
        expect(JSON.parse(response.body).result).to.equal('success');
        expect(JSON.parse(response.body).data.signature).to.equal(fixtures.signature);

    })

})