const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات أساسية
app.use(cors());
app.use(express.json());

// تشغيل الملفات الثابتة من المجلد الرئيسي مباشرة (تم التعديل هنا)
app.use(express.static(path.join(__dirname)));

// مسارات مؤقتة لحفظ البيانات (للتجربة حالياً)
let stock = [];
let ventes = [];

// API لجلب المنتجات
app.get('/api/stock', (req, res) => {
    res.json(stock);
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
});
