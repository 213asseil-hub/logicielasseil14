// ابحث عن const API_URL = "http://localhost:3000/api"; واستبدلها بهذا السطر السحري:
const API_URL = window.location.origin + "/api";
// --- 1. إدارة صفحة المخزن (inventory.html) ---
if (document.getElementById('prod-name')) {
    const formStock = document.querySelector('form');
    const tableStockBody = document.querySelector('table tbody');

    // جلب المنتجات من السيرفر وعرضها في الجدول
    async function afficherStock() {
        try {
            const res = await fetch(`${API_URL}/stock`);
            const stock = await res.json();
            
            tableStockBody.innerHTML = '';
            stock.forEach(prod => {
                const marge = prod.prixVente - prod.prixAchat;
                const row = `
                    <tr>
                        <td>${prod._id ? prod._id.slice(-5) : 'N/A'}</td>
                        <td>${prod.nom.toUpperCase()}</td>
                        <td>${prod.quantite}</td>
                        <td>${prod.prixAchat.toFixed(2)} DA</td>
                        <td>${prod.prixVente.toFixed(2)} DA</td>
                        <td style="color: green; font-weight: bold;">${marge.toFixed(2)} DA</td>
                    </tr>
                `;
                tableStockBody.innerHTML += row;
            });
        } catch (err) {
            console.error("Erreur de chargement du stock:", err);
        }
    }

    // إرسال منتج جديد لحفظه في السيرفر
    formStock.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nom = document.getElementById('prod-name').value;
        const qty = parseInt(document.getElementById('prod-qty').value);
        const achat = parseFloat(document.getElementById('prod-purchase').value);
        const vente = parseFloat(document.getElementById('prod-sell').value);

        const res = await fetch(`${API_URL}/stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, quantite: qty, prixAchat: achat, prixVente: vente })
        });

        const data = await res.json();
        if(res.ok) {
            alert(data.message);
            formStock.reset();
            afficherStock();
        } else {
            alert("Erreur: " + data.error);
        }
    });

    afficherStock();
}

// --- 2. إدارة صفحة البيع (index.html) ---
if (document.getElementById('sale-product')) {
    const formVente = document.querySelector('form');
    const datalist = document.getElementById('products-list');
    const tableVentesBody = document.querySelector('table tbody');

    // تحديث قائمة المنتجات القابلة للبيع تلقائياً
    async function chargerDatalist() {
        const res = await fetch(`${API_URL}/stock`);
        const stock = await res.json();
        datalist.innerHTML = '';
        stock.forEach(prod => {
            if (prod.quantite > 0) {
                datalist.innerHTML += `<option value="${prod.nom.toUpperCase()}">`;
            }
        });
    }

    // جلب سجل المبيعات من السيرفر وعرضه
    async function afficherVentes() {
        const res = await fetch(`${API_URL}/ventes`);
        const ventes = await res.json();
        
        tableVentesBody.innerHTML = '';
        ventes.forEach(vente => {
            const row = `
                <tr>
                    <td>${vente.date} ${vente.heure}</td>
                    <td>${vente.nom.toUpperCase()}</td>
                    <td>${vente.quantiteVendue}</td>
                    <td>${vente.totalVente.toFixed(2)} DA</td>
                    <td style="color: blue; font-weight: bold;">${vente.totalMarge.toFixed(2)} DA</td>
                </tr>
            `;
            tableVentesBody.innerHTML += row;
        });
    }

    // تسجيل عملية بيع جديدة في السيرفر وتحديث المخزن
    formVente.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nomCherche = document.getElementById('sale-product').value;
        const qtyAcheter = parseInt(document.getElementById('sale-qty').value);

        const res = await fetch(`${API_URL}/ventes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom: nomCherche, quantiteVendue: qtyAcheter })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            formVente.reset();
            chargerDatalist();
            afficherVentes();
        } else {
            alert(data.error);
        }
    });

    chargerDatalist();
    afficherVentes();
}

// --- 3. إدارة صفحة لوحة التحكم (dashboard.html) ---
if (document.getElementById('total-journalier')) {
    async function chargerDashboard() {
        const res = await fetch(`${API_URL}/ventes`);
        const ventes = await res.json();

        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        const maintenant = new Date();
        const moisActuel = (maintenant.getMonth() + 1) + "/" + maintenant.getFullYear();

        let chiffreAffaireJour = 0, gainJour = 0, chiffreAffaireMois = 0, gainMois = 0;

        ventes.forEach(vente => {
            if (vente.date === aujourdhui) {
                chiffreAffaireJour += vente.totalVente;
                gainJour += vente.totalMarge;
            }
            if (vente.moisAnnee === moisActuel) {
                chiffreAffaireMois += vente.totalVente;
                gainMois += vente.totalMarge;
            }
        });

        document.getElementById('total-journalier').innerText = chiffreAffaireJour.toFixed(2) + " DA";
        document.getElementById('gain-journalier').innerText = gainJour.toFixed(2) + " DA";
        document.getElementById('total-mensuel').innerText = chiffreAffaireMois.toFixed(2) + " DA";
        document.getElementById('gain-mensuel').innerText = gainMois.toFixed(2) + " DA";
    }
    chargerDashboard();
}