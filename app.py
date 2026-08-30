from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Global data store (Persistent until the server restarts)
data = {
    "balance": 0.0,
    "total_spent": 0.0,
    "expenses": [],
    "next_id": 1 
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/get-data', methods=['GET'])
def get_data():
    return jsonify(data)

@app.route('/api/add-money', methods=['POST'])
def add_money():
    amount = request.json.get('amount')
    data['balance'] += float(amount)
    return jsonify(data)

@app.route('/api/add-expense', methods=['POST'])
def add_expense():
    new_exp = request.json 
    new_exp['id'] = data['next_id']
    data['next_id'] += 1
    
    amount = float(new_exp['amount'])
    data['expenses'].append(new_exp)
    data['balance'] -= amount
    data['total_spent'] += amount
    return jsonify(data)

@app.route('/api/edit-expense', methods=['POST'])
def edit_expense():
    update = request.json
    target_id = int(update['id'])
    new_amt = float(update['new_amount'])

    for exp in data['expenses']:
        if exp['id'] == target_id:
            # Revert old math, apply new math
            data['balance'] += float(exp['amount'])
            data['total_spent'] -= float(exp['amount'])
            exp['amount'] = new_amt
            data['balance'] -= new_amt
            data['total_spent'] += new_amt
            break
    return jsonify(data)

@app.route('/api/reset', methods=['POST'])
def reset_data():
    global data
    data = {"balance": 0.0, "total_spent": 0.0, "expenses": [], "next_id": 1}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)