const express = require('express');
const axios = require('axios');
const app = express();

const tradeableItemTypeId = "7d937180-cb21-4f6d-a587-f55c76347906";
const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZmRmMmQxNS00NTU2LTQzOTgtODE5OC1lMWE3N2QyNTI1OWYiLCJzZXNzaW9uSWQiOiI0YzE3N2JiYi01ZmI2LTQwYmMtOGFhNi0xMTY5MmE1ZTM2NjMiLCJpYXQiOjE3Mzg0NzQ4MDMsImV4cCI6MTczOTY4NDQwM30.LqpJmhlLj5zTGm_00AF2udrH8oLgRdFnymQ2arXbTPs";

let targetPrice = null;

// Функция для проверки текущей цены
async function checkPrice() {
    if (!targetPrice) return;

    try {
        const response = await axios.get(
            `https://api-rd.zargates.com/api/v1/offer-manager/offers/price-levels?page=1&limit=10&tradeable_item_type_id=${tradeableItemTypeId}`,
            {
                headers: { Authorization: `Bearer ${bearerToken}` }
            }
        );

        const priceLevelsData = response.data;
        if (priceLevelsData.status && priceLevelsData.data.length > 0) {
            const currentPrice = Math.min(...priceLevelsData.data.map(item => item.price));
            if (currentPrice <= targetPrice) {
                console.log(`Цена достигла целевой: ${targetPrice}. Отправляем POST-запрос...`);
                await axios.post(
                    '/buy',
                    { price: targetPrice },
                    { headers: { Authorization: `Bearer ${bearerToken}` } }
                );
                targetPrice = null; // Сбрасываем целевую цену
            }
        }
    } catch (error) {
        console.error('Ошибка при проверке цены:', error);
    }
}

// Устанавливаем интервал для проверки цены каждые 5 секунд
setInterval(checkPrice, 5000);

// API для установки целевой цены
app.post('/set-target-price', express.json(), (req, res) => {
    const { price } = req.body;
    if (typeof price === 'number' && price > 0) {
        targetPrice = price;
        res.send({ status: true, message: `Целевая цена установлена: ${price}` });
    } else {
        res.status(400).send({ status: false, message: "Некорректная цена" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});