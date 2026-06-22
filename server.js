const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// ابحث عن const PORT = 3000; واستبدلها بهذا السطر:
const PORT = process.env.PORT || 3000;
// إعدادات أساسية
app.use(cors());
app.use(express.json());

// السطر السحري: يخبر Node.js بأن يعرض ملفات الـ HTML والـ CSS من مجلد public تلقائياً
app.use(express.static(path.join(__dirname, 'public')));

// مسارات مؤقتة لحفظ البيانات في ذاكرة السيرفر قبل ربط قاعدة البيانات
let stock = [];
let ventes = [];

// جلب المنتجات
app.get('/api/stock', (req, res) => {
    res.json(stock);
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`السيرفر يعمل بنجاح على الرابط: http://localhost:${PORT}`);
});