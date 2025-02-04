const axios = require('axios');

const API_BASE_URL = 'https://api-rd.zargates.com/api/v1/offer-manager';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmRmMmQxNS00NTU2LTQzOTgtODE5OC1lMWE3N2QyNTI1OWYiLCJzZXNzaW9uSWQiOiJkOTEzMjI4MS01ODU1LTQ1YTMtYjFlMy1hNGQ5MGI1NTM1MzMiLCJpYXQiOjE3Mzg2MjA1MDIsImV4cCI6MTczOTgzMDEwMn0.EDcA7LwqGO8f9Zqa75SncKcLvdq8FeHzFG-mtY1RinE';

async function checkAndSendRequest() {
    try {
        const response = await axios.get(`${API_BASE_URL}/tradeable-types?filter=MARKETPLACE`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        const items = Array.isArray(response.data) ? response.data : response.data.items;
        
        if (!Array.isArray(items)) {
            console.error('Ошибка: Неверный формат данных', response.data);
            return;
        }
        
        for (const item of items) {
            if (item.min_price >= 1 && item.min_price <= 300) {
                const postData = {
                    price: item.min_price,
                    quantity: 1,
                    tradeable_item_type_id: item.id
                };
                
                await axios.post(`${API_BASE_URL}/deal`, postData, {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('POST-запрос отправлен:', postData);
            }
        }
    } catch (error) {
        console.error('Ошибка:', error.response ? error.response.data : error.message);
    }
}

setInterval(checkAndSendRequest, 5000);

