let myChart;

window.onload = refreshData;

async function refreshData() {
    const res = await fetch('/api/get-data');
    const data = await res.json();
    document.getElementById('balance').innerText = data.balance.toFixed(2);
    document.getElementById('total-spent').innerText = data.total_spent.toFixed(2);
    updateTable(data.expenses);
    updateChart(data.expenses);
}

async function addBalance() {
    const amount = prompt("Top up the bag? (₹)");
    if (amount && !isNaN(amount)) {
        await fetch('/api/add-money', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        refreshData();
    }
}

async function saveExpense() {
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (!amount || !date) return alert("Fill in the deets!");

    await fetch('/api/add-expense', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ amount, category, date })
    });
    document.getElementById('amount').value = '';
    refreshData();
}

async function editExpense(id, currentAmount) {
    const newAmount = prompt("Correct the damage (₹):", currentAmount);
    if (newAmount !== null && !isNaN(newAmount)) {
        await fetch('/api/edit-expense', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id: id, new_amount: parseFloat(newAmount) })
        });
        refreshData();
    }
}

async function resetData() {
    if (confirm("Wipe the slate clean?")) {
        await fetch('/api/reset', { method: 'POST' });
        refreshData();
    }
}

function updateTable(expenses) {
    const tbody = document.querySelector('#expenseTable tbody');
    tbody.innerHTML = expenses.map(e => `
        <tr>
            <td>${e.date}</td>
            <td>${e.category}</td>
            <td>₹${parseFloat(e.amount).toFixed(2)}</td>
            <td style="text-align: right;">
                <button onclick="editExpense(${e.id}, ${e.amount})" class="edit-btn">Edit</button>
            </td>
        </tr>
    `).reverse().join('');
}

function updateChart(expenses) {
    const totals = { Food: 0, Travel: 0, Shopping: 0, Entertainment: 0, Others: 0 };
    expenses.forEach(e => totals[e.category] += parseFloat(e.amount));

    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(totals),
            datasets: [{
                data: Object.values(totals),
                backgroundColor: ['#fb7185', '#38bdf8', '#fbbf24', '#a78bfa', '#4ade80'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { display: false } }, cutout: '70%' }
    });
}