const debug =require('debug')('server:debug');
import config from 'config';
import express from 'express';
import  bodyParser from 'body-parser';
import cors from 'cors';
import appRouter from './app.routes';


const app=express();
const router = express.Router();
// support json encoded bodies in the req
app.use(bodyParser.urlencoded({ extended: true }));

//sets the limit of json bodies in the req body.
app.use(bodyParser.json());

//allow cors
app.use(cors());

app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Content-Type'
    );
    res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT');
    next();
});

app.use('/api/v1/', router);
appRouter(router);

const listen =app.listen(config.get('port'),()=>{
    debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
    console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
})

module.exports= app;
module.exports.port=listen.address().port;