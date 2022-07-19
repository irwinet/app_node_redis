const express = require('express');
const axios = require('axios');
const respondeTime = require('response-time');
const redis = require('redis');

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

client.on('error', (err) => console.log('Redis Client Error', err));

const app = express();

app.use(respondeTime());

app.get('/character', async (req, res) => {

    await client.connect();

    const characters = await client.get('characters');
    if(characters)
    {
        // console.log(characters);  
        await client.disconnect();
        return res.json(JSON.parse(characters));
    }      

    const response = await axios.get('https://rickandmortyapi.com/api/character');
    // console.log(response.data);

    //await client.connect();

    await client.set('characters', JSON.stringify(response.data));
    await client.expire('characters', 120);

    await client.disconnect();

    res.json(response.data);

});

app.listen(3000);

console.log('Server on port 3000');