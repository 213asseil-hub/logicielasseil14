const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

// مصفوفات مؤقتة لحفظ البيانات في الذاكرة (تتصفّر عند إعادة تشغيل السيرفر)
let stock = [];
let ventes = [];

// 1. جلب المنتجات في المخزن
app.get('/api/stock', (req, res) => {
    res.json(stock);
});

// 2. إضافة منتج جديد للمخزن
app.post('/api/stock', (req, res) => {
    const { nom, quantite, prixAchat, prixVente } = req.body;

    if (!nom || quantite === undefined || prixAchat === undefined || prixVente === undefined) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // التحقق مما إذا كان المنتج موجوداً مسبقاً (لتفادي التكرار وتحديث الكمية بدلاً من ذلك)
    const existingProd = stock.find(p => p.nom.toUpperCase() === nom.toUpperCase());
    if (existingProd) {
        existingProd.quantite += quantite;
        return res.json({ message: "تم تحديث كمية المنتج الموجود مسبقاً بنجاح!" });
    }

    // إنشاء منتج جديد بمعرّف عشوائي يحاكي معرفات قواعد البيانات
    const newProduct = {
        _id: Math.random().toString(36).substring(2, 9),
        nom: nom.toUpperCase(),
        quantite: parseInt(quantite),
        prixAchat: parseFloat(prixAchat),
        prixVente: parseFloat(prixVente)
    };

    stock.push(newProduct);
    res.status(201).json({ message: "تم إضافة المنتج بنجاح إلى المخزن!" });
});

// 3. جلب سجل المبيعات
app.get('/api/ventes', (req, res) => {
    res.json(ventes);
});

// 4. تسجيل عملية بيع جديدة وتحديث المخزن
app.post('/api/ventes', (req, res) => {
    const { nom, quantiteVendue } = req.body;

    if (!nom || !quantiteVendue) {
        return res.status(400).json({ error: "اسم المنتج والكمية المطلوبة حقول إجبارية" });
    }

    // البحث عن المنتج في المخزن
    const prod = stock.find(p => p.nom.toUpperCase() === nom.toUpperCase());

    if (!prod) {
        return res.status(404).json({ error: "المنتج غير موجود في المخزن!" });
    }

    if (prod.quantite < quantiteVendue) {
        return res.status(400).json({ error: `الكمية غير كافية! المتاح حالياً: ${prod.quantite}` });
    }

    // تحديث كمية المخزن (خصم الكمية المباعة)
    prod.quantite -= parseInt(quantiteVendue);

    // حسابات التواريخ المتوافقة مع الـ Front-end
    const maintenant = new Date();
    const dateFormatee = maintenant.toLocaleDateString('fr-FR'); // DD/MM/YYYY
    const heureFormatee = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const moisAnneeFormatee = (maintenant.getMonth() + 1) + "/" + maintenant.getFullYear(); // M/YYYY

    // حساب المبيعات والأرباح الصافية
    const totalVente = quantiteVendue * prod.prixVente;
    const totalMarge = quantiteVendue * (prod.prixVente - prod.prixAchat);

    const nouvelleVente = {
        date: dateFormatee,
        heure: heureFormatee,
        moisAnnee: moisAnneeFormatee,
        nom: nom.toUpperCase(),
        quantiteVendue: parseInt(quantiteVendue),
        totalVente: totalVente,
        totalMarge: totalMarge
    };

    ventes.push(nouvelleVente);
    res.json({ message: "تم تسجيل عملية البيع بنجاح وتحديث المخزن!" });
});

app.listen(PORT, () => {
    console.log(`السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
});
