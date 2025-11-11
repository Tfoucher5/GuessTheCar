/* eslint-disable no-undef */
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/bot/game';

async function testGameLifecycle() {
    const channelId = '1406980794852966532';
    const userId = '573543227525824516';

    let response = await axios.post(API_URL, {
        action: 'start',
        channelId,
        user: userId,
        timestamp: new Date().toISOString()
    });
    console.log('Start response:', response.data);

    response = await axios.post(API_URL, {
        action: 'abandon',
        channelId,
        user: userId,
        timestamp: new Date().toISOString()
    });
    console.log('Abandon response:', response.data);
}

testGameLifecycle().catch(console.error);
