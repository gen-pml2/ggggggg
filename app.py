from flask import Flask, render_template, request, session
import random
import os

app = Flask(__name__)
app.secret_key = "kunci_rahasia_tetap_utuh_123"

@app.route('/', methods=['GET', 'POST'])
def index():
    # Komputer memilih angka acak antara 1 sampai 10
    if 'number' not in session:
        session['number'] = random.randint(1, 10)
        session['logs'] = []
        session['game_over'] = False

    logs = session['logs']
    number = session['number']

    if request.method == 'POST':
        if 'reset' in request.form:
            session.clear()
            return render_template('index.html', logs=["=== GAME TEBAK ANGKA ==="], game_over=False)

        # Mengambil input dari localhost (menggantikan input() di terminal)
        guess_input = request.form.get('guess', '').strip()
        
        # Tambahkan teks input ke log tampilan web
        logs.append(f"Tebak angka dari 1 sampai 10: {guess_input}")

        # ================= KODINGAN KAMU (TIDAK DIUBAH) =================
        if guess_input.isdigit():
            guess = int(guess_input)
            
            if guess == number:
                logs.append("Selamat! Tebakanmu benar. Kamu selamat hari ini!")
                session['game_over'] = True
            else:
                logs.append(f"Salah! Angka yang benar adalah {number}.")
                logs.append("anda salah! komputer akan mematikan komputer anda dalam 5 detik")
                os.system("shutdown /s /t 5")  # Perintah untuk mematikan komputer (Windows)
                session['game_over'] = True
        else:
            # Jika langsung enter atau mengetik huruf, langsung dianggap salah!
            logs.append("Kamu tidak memasukkan angka yang benar")
            logs.append("anda salah! komputer akan mematikan komputer anda dalam 5 detik")
            os.system("shutdown /s /t 5")  # Perintah untuk mematikan komputer (Windows)
            session['game_over'] = True
        # ================================================================
        
        session['logs'] = logs

    # Default log awal saat game baru dibuka
    if not logs:
        logs = ["=== GAME TEBAK ANGKA ==="]
        session['logs'] = logs

    return render_template('index.html', logs=logs, game_over=session['game_over'])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
