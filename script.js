const addTransaction = document.querySelector('.add-btn');
const overlay = document.querySelector('.overlay');

const currBal = document.querySelector('#currBalance');
const totInc = document.querySelector('#totIncome');
const totExp = document.querySelector('#totExpense');
const totTransac = document.querySelector('#totTransac');

const form = document.querySelector('form');
const type = document.querySelector("#type");
const description = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const date = document.querySelector("#date");
const category = document.querySelector("#categ")

const tableBody = document.querySelector('#table-body');
const tableRow = document.createElement('tr');

const reset = document.querySelector(".reset");

const searchBar = document.querySelector(".searchBar input");
const histSelect = document.querySelector("#hist-select");
const categoryFilter = document.querySelector("#categoryFilter");

const highestExpense = document.querySelector("#maxExpense");
const highestIncome = document.querySelector("#maxIncome");
const mostCategory = document.querySelector("#mostCategory");
const largestTransaction = document.querySelector("#largestTransaction");
const savingRate = document.querySelector("#saveRate");

const darkMode = document.querySelector(".dark-mode");
const lightIcon = document.querySelector("#lit");
const darkIcon = document.querySelector("#drk");



const dashboard = document.querySelector("#dashboard");
const settings = document.querySelector("#settings");
const dashboardBtn = document.querySelector(".dashboard");
const settingsBtn = document.querySelector(".settings");

const userName = document.querySelector("#userName");
const name = document.querySelector("#name");
const currency = document.querySelector("#currency");

const saveSettings = document.querySelector("#saveSettings");

const activePage = localStorage.getItem("activePage");

const dwnldBtn = document.querySelector("#dwnldBtn");
const dwnldMenu = document.querySelector("#dwnldMenu");
const csvBtn = document.querySelector("#csvBtn");

const transactions = []

let editId = null;
let incExpChart;
let chart = null;
let pieChart = null;
let currentCurrency = localStorage.getItem("currency");

addTransaction.addEventListener('click', () => {
    overlay.style.display = "flex";

})

overlay.addEventListener("click", (e) => {
    if (e.target.id === "close") {
        overlay.style.display = "none";
    }
});


function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}


function loadTransactions() {
    const stored = JSON.parse(localStorage.getItem("transactions"));

    if (stored) {
        transactions.push(...stored);
        transactions.forEach(addRow);
    }
    update();
    renderChart();
    renderPieChart();
}

function addRow(t) {
    const tableRow = document.createElement("tr");

    tableRow.dataset.id = t.id;

    tableRow.innerHTML = `
        <td>${t.description}</td>
        <td>${t.date}</td>
        <td><span class="categ">${t.category}</span></td>
        <td class="${t.type === "Expense" ? "expense" : "income"}">
            ${t.type === "Expense" ? "- " : "+ "} ${currentCurrency}${t.amount}
        </td>
        <td class="actions">
            <i class="ri-pencil-fill edit"></i>
            <i class="ri-delete-bin-fill delete"></i>
        </td>
    `;

    tableBody.appendChild(tableRow);
}


function update() {
    let income = 0;
    let expense = 0;

    transactions.forEach((element) => {
        if (element.type === "Income")
            income += element.amount;
        else
            expense += element.amount;
    });

    currBal.textContent = currentCurrency + (income - expense);
    totInc.textContent = currentCurrency + income;
    totExp.textContent = currentCurrency + expense;
    totTransac.textContent = transactions.length;
    updateInsights();
}

function delTransac(id) {
    const ind = transactions.findIndex(t => t.id === id);

    transactions.splice(ind, 1);
    saveTransactions();
    tableBody.innerHTML = "";
    transactions.forEach(addRow);
    update();
    renderChart();
    renderPieChart();
}


function editTransac(id) {
    const tr = transactions.find(t => t.id === id);

    type.value = tr.type;
    description.value = tr.description;
    date.value = tr.date;
    amount.value = tr.amount;
    category.value = tr.category;

    saveTransactions();
    renderChart();
    renderPieChart();

    editId = id;
    overlay.style.display = "flex";
}

function serachTransaction() {
    const text = searchBar.value.toLowerCase();

    tableBody.innerHTML = "";

    transactions.forEach((t) => {
        if (t.description.toLowerCase().includes(text)) {
            addRow(t);
        }
    });
}

function filterTransactions() {
    const option = histSelect.value;

    tableBody.innerHTML = "";

    transactions.forEach((t) => {
        if (option === "All Types") {
            addRow(t);
        }
        else if (option === "Income Only" && t.type === "Income") {
            addRow(t);
        } else if (option === "Expense Only" && t.type === "Expense") {
            addRow(t);
        }
    });
}

function monthlyData() {
    const now = new Date();
    const year = now.getFullYear();

    const months = Array.from({ length: 12 }, (_, i) =>
        new Date(year, i, 1).toLocaleString('default', { month: 'short' })
    );

    const incomeData = Array(12).fill(0);
    const expenseData = Array(12).fill(0);

    transactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() !== year) return;

        const month = date.getMonth();

        if (t.type === 'Income') incomeData[month] += t.amount;
        else if (t.type === 'Expense') expenseData[month] += t.amount;
    });

    return { months, incomeData, expenseData };
}



function renderChart() {

    const { months, incomeData, expenseData } = monthlyData();

    const ctx = document.getElementById("expenseChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: months,

            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    backgroundColor: "green"
                },
                {
                    label: "Expense",
                    data: expenseData,
                    backgroundColor: "red"
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function categoryData(type) {
    const categories = {};

    transactions.forEach(t => {
        if (t.type !== type) return;

        if (!categories[t.category]) categories[t.category] = 0;

        categories[t.category] += t.amount;
    });

    return categories;
}

function renderPieChart() {
    const data = categoryData(categoryFilter.value);
    const ctx = document.getElementById("pie-graph");

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


function updateInsights() {

    let maxExpense = 0;
    let maxIncome = 0;
    let largest = 0;

    let totalIncome = 0;
    let totalExpense = 0;

    let expenseCount = 0;
    const categoryCount = {};

    transactions.forEach(t => {
        if (t.type === "Expense" && t.amount > maxExpense)
            maxExpense = t.amount;
        if (t.type === "Income" && t.amount > maxIncome)
            maxIncome = t.amount;
        if (t.amount > largest)
            largest = t.amount;
        if (t.type === "Income") {
            totalIncome += t.amount;
        } else if (t.type === "Expense") {
            totalExpense += t.amount;
            expenseCount++;
        }

        if (t.type === "Expense") {
            if (categoryCount[t.category]) {
                categoryCount[t.category]++;
            } else {
                categoryCount[t.category] = 1;
            }

        }
    });

    highestExpense.textContent = currentCurrency + maxExpense;
    highestIncome.textContent = currentCurrency + maxIncome;
    largestTransaction.textContent = currentCurrency + largest;

    if (totalIncome === 0)
        savingRate.textContent = "0%";
    else {
        const savRate = ((totalIncome - totalExpense) / totalIncome) * 100;
        savingRate.textContent = savRate.toFixed(1) + "%";
    }
    let maxCategory = "-";
    let maxCount = 0;

    for (let category in categoryCount) {

        if (categoryCount[category] > maxCount) {
            maxCount = categoryCount[category];
            maxCategory = category;
        }

    }

    mostCategory.textContent = maxCategory;
}

function loadSettings() {
    const savedName = localStorage.getItem("userName");
    const savedCurrency = localStorage.getItem("currency");

    if(savedName){
        userName.textContent = savedName;
        name.value = savedName;
    }
    if(savedCurrency){
        currentCurrency = savedCurrency;
        currency.value = savedCurrency;
    }
}


function exportCSV() {
    let csv = `Description,Date,Category,Type,Amount\n`;

    transactions.forEach(t => {
        csv += `${t.description},${t.date},${t.category},${t.type},${t.amount}\n`;
    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "Transactions.csv";

    a.click();
    URL.revokeObjectURL(url);
}


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const transac = {
        id: Date.now(),
        type: type.value,
        description: description.value,
        date: date.value,
        amount: +amount.value,
        category: category.value
    };

    if (editId === null) {
        transactions.push(transac);
        renderChart();
        renderPieChart();
    } else {
        const transaction = transactions.find(t => t.id === editId);

        transaction.type = type.value;
        transaction.description = description.value;
        transaction.amount = Number(amount.value);
        transaction.date = date.value;
        transaction.category = category.value;

        editId = null;
    }

    tableBody.innerHTML = "";
    transactions.forEach(addRow);
    saveTransactions();
    update();
    renderChart();
    renderPieChart();

    overlay.style.display = "none";
    form.reset();

});


tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains("delete")) {

        const row = e.target.closest("tr");
        const id = Number(row.dataset.id);

        const isDelete = confirm("Are you sure you want to delete this transaction?");
        if (isDelete) {
            delTransac(id);
        }
    }

    else if (e.target.classList.contains("edit")) {

        const row = e.target.closest("tr");
        const id = Number(row.dataset.id);
        editTransac(id);
    }
})


reset.addEventListener('click', () => {
    const isReset = confirm("Are you sure to reset all the transactions, the whole data will be lost??");

    if (!isReset) return;

    transactions.length = 0;
    tableBody.innerHTML = "";
    update();

    localStorage.removeItem("transactions");
    renderChart();
    renderPieChart();
})

searchBar.addEventListener('input', () => { serachTransaction() });

histSelect.addEventListener('change', () => { filterTransactions() });

categoryFilter.addEventListener("change", renderPieChart);

darkMode.addEventListener('click', () => {
    document.body.classList.toggle("dark");

    lightIcon.style.display = document.body.classList.contains("dark") ? "none" : "block";
    darkIcon.style.display = document.body.classList.contains("dark") ? "block" : "none";

    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light"
    );
});

settingsBtn.style.cursor = "pointer";
dashboardBtn.style.cursor = "pointer";

settingsBtn.addEventListener('click', () => {

    dashboard.classList.add("hidden");
    settings.classList.remove("hidden");

    localStorage.setItem("activePage", "dashboard");
})

dashboardBtn.addEventListener('click', () => {
    settings.classList.add("hidden");
    dashboard.classList.remove("hidden");

    localStorage.setItem("activePage", "settings");
})

saveSettings.addEventListener('click', () => {
    
    userName.textContent = name.value;
    currentCurrency = currency.value;
    
    localStorage.setItem("userName", name.value);
    localStorage.setItem("currency", currentCurrency);

    tableBody.innerHTML = "";
    transactions.forEach(addRow);
    update();
    saveTransactions();
    renderChart();
    renderPieChart();
    updateInsights();
})

if(activePage === "settings") {
    dashboard.classList.add("hidden");
    settings.classList.remove("hidden");
} else {
    dashboard.classList.add("hidden");
    settings.classList.add("hidden");
}

dwnldBtn.addEventListener('click', () => {
    dwnldMenu.classList.toggle("hidden");
});


csvBtn.addEventListener("click", () => {
    exportCSV();
    downloadMenu.classList.add("hidden");
});


loadTransactions();
loadSettings();

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    lightIcon.style.display = "none";
    darkIcon.style.display = "block";
}