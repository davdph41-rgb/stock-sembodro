const DEFAULT_STOCK = [
    { name: "French Fries", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Chicken Wings", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Prawn Mayo", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Mekencis", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Beef Burger", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Fish & Chips", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 },
    { name: "Mix Platters", stockAwal: 0, reservasi: 0, sesi1: 0, sesi2: 0, manual: 0 }
];

/* ========================================
   MEMUAT & MENYIMPAN DATA
======================================== */
function loadStock() {
    try {
        const saved = localStorage.getItem("stockData");
        if (saved === null) return structuredClone(DEFAULT_STOCK);
        const data = JSON.parse(saved);
        if (!Array.isArray(data)) throw new Error("Format data tidak valid");
        return data;
    } catch (error) {
        alert("Data stok tidak bisa dibaca. Data awal akan digunakan.");
        return structuredClone(DEFAULT_STOCK);
    }
}

function loadTransactions() {
    try {
        const saved = localStorage.getItem("stockTransactions");
        const data = saved ? JSON.parse(saved) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

let stockData = loadStock();
let transactions = loadTransactions();

function saveData() {
    localStorage.setItem("stockData", JSON.stringify(stockData));
    localStorage.setItem("stockTransactions", JSON.stringify(transactions));
}

/* ========================================
   LOGIKA STOK
======================================== */
function calculateStock(item) {
    return item.stockAwal - item.reservasi - item.sesi1 - item.sesi2 - item.manual;
}

/* ========================================
   RENDER DAFTAR MENU
======================================== */
function renderStock() {
    const stockList = document.getElementById("stockList");
    stockList.innerHTML = "";

    stockData.forEach((item, index) => {
        const stockSaatIni = calculateStock(item);
        const card = document.createElement("div");
        card.className = "stock-item stock-detail-card";

        const title = document.createElement("h3");
        title.className = "menu-name";
        title.textContent = item.name;

        const currentLabel = document.createElement("p");
        currentLabel.className = "current-stock-label";
        currentLabel.textContent = "STOK SAAT INI";

        const currentStock = document.createElement("div");
        currentStock.className = "current-stock";
        currentStock.textContent = stockSaatIni + " PCS";

        const details = document.createElement("div");
        details.className = "stock-details";

        const detailRows = [
            ["Stok Awal", item.stockAwal],
            ["Reservasi", -item.reservasi],
            ["Sesi 1", -item.sesi1],
            ["Sesi 2", -item.sesi2],
            ["Manual", -item.manual]
        ];

        detailRows.forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "stock-detail-row";
            const rowLabel = document.createElement("span");
            rowLabel.textContent = label;
            const rowValue = document.createElement("span");
            rowValue.textContent = value;
            row.appendChild(rowLabel);
            row.appendChild(rowValue);
            details.appendChild(row);
        });

        const editButton = document.createElement("button");
        editButton.className = "card-edit-btn";
        editButton.textContent = "Edit Stok Awal";
        editButton.addEventListener("click", () => {
            const input = prompt("Masukkan stok awal baru untuk " + item.name, item.stockAwal);
            if (input === null) return;
            
            const newStock = Number(input);
            if (input.trim() === "" || !Number.isSafeInteger(newStock) || newStock < 0) {
                alert("Stok harus berupa bilangan bulat nol atau lebih.");
                return;
            }

            const totalPengurangan = item.reservasi + item.sesi1 + item.sesi2 + item.manual;
            if (newStock < totalPengurangan) {
                alert("Stok awal tidak boleh lebih kecil daripada total pengurangan.\n\nTotal pengurangan: " + totalPengurangan + " pcs.");
                return;
            }

            item.stockAwal = newStock;
            saveData();
            renderStock();
            renderDailyReport();
            alert("Stok awal berhasil diperbarui!");
        });

        const transactionButton = document.createElement("button");
        transactionButton.className = "card-transaction-btn";
        transactionButton.textContent = "+ Transaksi";
        
        // Memanggil fungsi Modal
        transactionButton.addEventListener("click", () => {
            openTransactionModal(index);
        });

        card.appendChild(title);
        card.appendChild(currentLabel);
        card.appendChild(currentStock);
        card.appendChild(details);
        card.appendChild(editButton);
        card.appendChild(transactionButton);
        stockList.appendChild(card);
    });

    updateTotal();
}

function updateTotal() {
    const total = stockData.reduce((sum, item) => sum + calculateStock(item), 0);
    document.getElementById("totalStock").textContent = total;
    document.getElementById("menuCount").textContent = stockData.length + " Menu";
}

/* ========================================
   FUNGSI MODAL TRANSAKSI
======================================== */
function openTransactionModal(menuIndex) {
    // Set menu yang dipilih
    document.getElementById("transactionMenu").value = menuIndex;
    
    // Kosongkan inputan sebelumnya
    document.getElementById("transactionAmount").value = "";
    document.getElementById("transactionNote").value = "";
    
    // Tampilkan modal
    document.getElementById("transactionModal").style.display = "block";
}

function closeTransactionModal() {
    // Sembunyikan modal
    document.getElementById("transactionModal").style.display = "none";
    
    // Reset form
    document.getElementById("transactionForm").reset();
}

// Menutup modal jika klik di luar area kotak modal
window.addEventListener("click", (event) => {
    const modal = document.getElementById("transactionModal");
    if (event.target === modal) {
        closeTransactionModal();
    }
});

/* ========================================
   TAMBAH MENU BARU
======================================== */
function addMenu() {
    const nameInput = document.getElementById("menuName");
    const stockInput = document.getElementById("menuStock");

    const name = nameInput.value.trim();
    const stock = Number(stockInput.value);

    if (name === "") {
        alert("Masukkan nama menu terlebih dahulu.");
        return;
    }

    if (stockInput.value.trim() === "" || !Number.isSafeInteger(stock) || stock < 0) {
        alert("Stok harus berupa bilangan bulat nol atau lebih.");
        return;
    }

    const alreadyExists = stockData.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
        alert("Nama menu tersebut sudah ada.");
        return;
    }

    stockData.push({
        name: name,
        stockAwal: stock,
        reservasi: 0,
        sesi1: 0,
        sesi2: 0,
        manual: 0
    });

    saveData();
    renderStock();
    renderTransactionMenu(); // Update dropdown transaksi
    renderDailyReport(); // Update laporan

    nameInput.value = "";
    stockInput.value = "";
    alert("Menu berhasil ditambahkan!");
}

/* ========================================
   RESET DATA
======================================== */
function resetStock() {
    const confirmReset = confirm(
        "PERINGATAN!\n\nSemua data stok dan riwayat transaksi akan dihapus dan dikembalikan ke data awal.\n\nLanjutkan?"
    );
    if (!confirmReset) return;

    stockData = structuredClone(DEFAULT_STOCK);
    transactions = [];

    saveData();
    renderStock();
    renderTransactionMenu(); // Update dropdown
    renderTransactionHistory(); // Update riwayat
    renderDailyReport(); // Update laporan

    alert("Data stok berhasil dikembalikan ke data awal.");
}

/* ========================================
   MENGISI PILIHAN MENU DI FORM TRANSAKSI
======================================== */
function renderTransactionMenu() {
    const select = document.getElementById("transactionMenu");
    select.innerHTML = "";
    stockData.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

/* ========================================
   MENYIMPAN TRANSAKSI
======================================== */
document.getElementById("transactionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const menuIndex = Number(document.getElementById("transactionMenu").value);
    const type = document.getElementById("transactionType").value;
    const amountInput = document.getElementById("transactionAmount");
    const amount = Number(amountInput.value);
    const note = document.getElementById("transactionNote").value.trim();
    const item = stockData[menuIndex];

    if (!item) {
        alert("Silakan pilih menu.");
        return;
    }

    if (amountInput.value.trim() === "" || !Number.isSafeInteger(amount) || amount <= 0) {
        alert("Jumlah harus berupa bilangan bulat lebih dari nol.");
        return;
    }

    const stockBefore = calculateStock(item);
    if (amount > stockBefore) {
        alert("Stok tidak mencukupi!\nStok tersedia: " + stockBefore + " pcs.");
        return;
    }

    item[type] += amount;

    transactions.unshift({
        menu: item.name,
        jenis: type,
        jumlah: amount,
        catatan: note,
        waktu: new Date().toISOString()
    });

    saveData();
    renderStock();
    renderTransactionHistory();
    renderDailyReport(); // Update laporan
    
    this.reset();
    renderTransactionMenu();
    
    closeTransactionModal(); // TUTUP MODAL SETELAH SIMPAN
    
    alert("Transaksi berhasil disimpan!");
});

/* ========================================
   RIWAYAT TRANSAKSI
======================================== */
function renderTransactionHistory() {
    const history = document.getElementById("transactionHistory");
    history.innerHTML = "";

    if (transactions.length === 0) {
        history.textContent = "Belum ada transaksi.";
        return;
    }

    transactions.forEach((transaction, index) => {
        const card = document.createElement("div");
        card.className = "history-item";

        const title = document.createElement("h3");
        title.textContent = transaction.menu;

        const type = document.createElement("p");
        type.textContent = "Jenis: " + getTransactionTypeName(transaction.jenis);

        const amount = document.createElement("p");
        amount.className = "history-amount";
        amount.textContent = "Pengurangan: -" + transaction.jumlah + " pcs";

        const note = document.createElement("p");
        note.textContent = "Catatan: " + (transaction.catatan || "-");

        const time = document.createElement("p");
        time.className = "history-time";
        // Format waktu agar lebih enak dibaca
        time.textContent = new Date(transaction.waktu).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        const cancelButton = document.createElement("button");
        cancelButton.className = "cancel-transaction-btn";
        cancelButton.textContent = "Batalkan Transaksi";
        cancelButton.addEventListener("click", () => {
            cancelTransaction(index);
        });

        card.appendChild(title);
        card.appendChild(type);
        card.appendChild(amount);
        card.appendChild(note);
        card.appendChild(time);
        card.appendChild(cancelButton);
        history.appendChild(card);
    });
}

/* ========================================
   MEMBATALKAN TRANSAKSI
======================================== */
function cancelTransaction(index) {
    const transaction = transactions[index];
    if (!transaction) {
        alert("Transaksi tidak ditemukan.");
        return;
    }

    const confirmCancel = confirm(
        "Batalkan transaksi ini?\n\n" +
        "Menu: " + transaction.menu + "\n" +
        "Jenis: " + getTransactionTypeName(transaction.jenis) + "\n" +
        "Jumlah: " + transaction.jumlah + " pcs"
    );
    if (!confirmCancel) return;

    const item = stockData.find(menu => menu.name === transaction.menu);
    if (!item) {
        alert("Menu tidak ditemukan. Transaksi tidak dibatalkan.");
        return;
    }

    const validTypes = ["reservasi", "sesi1", "sesi2", "manual"];
    if (!validTypes.includes(transaction.jenis)) {
        alert("Jenis transaksi tidak valid.");
        return;
    }

    if (!Number.isSafeInteger(transaction.jumlah) || transaction.jumlah <= 0 || item[transaction.jenis] < transaction.jumlah) {
        alert("Transaksi tidak dapat dibatalkan dengan aman.");
        return;
    }

    item[transaction.jenis] -= transaction.jumlah;
    transactions.splice(index, 1);

    saveData();
    renderStock();
    renderTransactionHistory();
    renderDailyReport(); // Update laporan

    alert("Transaksi berhasil dibatalkan.\nStok sudah diperbarui.");
}

/* ========================================
   NAMA JENIS TRANSAKSI
======================================== */
function getTransactionTypeName(type) {
    const names = {
        reservasi: "Reservasi",
        sesi1: "Sesi 1",
        sesi2: "Sesi 2",
        manual: "Penjualan Manual"
    };
    return names[type] || type;
}

/* ========================================
   TANGGAL LOKAL
======================================== */
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTransactionDate(transaction) {
    if (!transaction.waktu) return null;
    const date = new Date(transaction.waktu);
    if (Number.isNaN(date.getTime())) return null;
    return getLocalDateString(date);
}

/* ========================================
   MENGHITUNG LAPORAN (LOGIKA DIPERBAIKI)
======================================== */
function calculateDailyReport(dateString) {
    const report = {
        menuCount: stockData.length,
        openingStock: 0,
        reservasi: 0,
        sesi1: 0,
        sesi2: 0,
        manual: 0,
        closingStock: 0
    };

    stockData.forEach(item => {
        report.openingStock += item.stockAwal;
    });

    let cumulativeDeduction = 0;
    const validTypes = ["reservasi", "sesi1", "sesi2", "manual"];

    transactions.forEach(transaction => {
        if (!validTypes.includes(transaction.jenis)) return;

        const amount = Number(transaction.jumlah);
        if (!Number.isSafeInteger(amount) || amount <= 0) return;

        const txDate = getTransactionDate(transaction);
        if (!txDate || txDate > dateString) return;

        // Semua transaksi sampai tanggal ini mengurangi stok penutup
        cumulativeDeduction += amount;

        // Tapi hanya transaksi di tanggal ini yang masuk ringkasan harian
        if (txDate === dateString) {
            report[transaction.jenis] += amount;
        }
    });

    report.closingStock = report.openingStock - cumulativeDeduction;
    return report;
}

/* ========================================
   MENAMPILKAN LAPORAN
======================================== */
function renderDailyReport() {
    const dateInput = document.getElementById("reportDate");
    if (!dateInput.value) return;

    const report = calculateDailyReport(dateInput.value);

    document.getElementById("reportMenuCount").textContent = report.menuCount;
    document.getElementById("reportOpeningStock").textContent = report.openingStock + " pcs";
    document.getElementById("reportReservation").textContent = report.reservasi + " pcs";
    document.getElementById("reportSession1").textContent = report.sesi1 + " pcs";
    document.getElementById("reportSession2").textContent = report.sesi2 + " pcs";
    document.getElementById("reportManual").textContent = report.manual + " pcs";
    document.getElementById("reportClosingStock").textContent = report.closingStock + " pcs";
}

/* ========================================
   EXPORT LAPORAN CSV
======================================== */
function exportDailyReport() {
    const dateString = document.getElementById("reportDate").value;
    if (!dateString) {
        alert("Pilih tanggal laporan terlebih dahulu.");
        return;
    }

    const report = calculateDailyReport(dateString);

    const rows = [
        ["LAPORAN STOK HARIAN"],
        ["Tanggal", dateString],
        [],
        ["Ringkasan", "Jumlah"],
        ["Jumlah Menu", report.menuCount],
        ["Total Stok Awal", report.openingStock],
        ["Reservasi", report.reservasi],
        ["Sesi 1", report.sesi1],
        ["Sesi 2", report.sesi2],
        ["Penjualan Manual", report.manual],
        ["Stok Saat Ini", report.closingStock],
        [],
        ["Nama Menu", "Stok Awal", "Reservasi", "Sesi 1", "Sesi 2", "Manual", "Stok Saat Ini"]
    ];

    stockData.forEach(item => {
        const currentStock = calculateStock(item);
        rows.push([
            item.name,
            item.stockAwal,
            item.reservasi,
            item.sesi1,
            item.sesi2,
            item.manual,
            currentStock
        ]);
    });

    const csv = rows.map(row => {
        return row.map(value => {
            const text = String(value ?? "");
            return '"' + text.replace(/"/g, '""') + '"';
        }).join(",");
    }).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Laporan-Stok-" + dateString + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

/* ========================================
   INISIALISASI
======================================== */
renderStock();
renderTransactionMenu();
renderTransactionHistory();

const reportDateInput = document.getElementById("reportDate");
reportDateInput.value = getLocalDateString();
reportDateInput.addEventListener("change", renderDailyReport);

document.getElementById("exportReportBtn").addEventListener("click", exportDailyReport);
renderDailyReport();

/* ========================================
   REGISTRASI SERVICE WORKER (PWA)
======================================== */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then(registration => console.log("Service Worker aktif:", registration.scope))
            .catch(error => console.error("Service Worker gagal:", error));
    });
}