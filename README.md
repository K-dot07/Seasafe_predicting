# SeaSafe – Maritime Passenger Safety Prediction System

SeaSafe is a software-based project that predicts the survival probability of passengers during maritime travel using machine learning. It provides a safety score based on ship details, passenger count, weather conditions, and emergency response availability. The system is lightweight, simple to use, and ideal for academic projects and real-world safety research.

🌐 **Live Demo:** https://kalaidot.neocities.org/SeaSafe/

---

## 🚢 Project Overview

SeaSafe calculates the **survival probability** of passengers based on:
- Ship model
- Ship built year
- Ship capacity
- Current passenger count
- Weather conditions (wind, sea state, visibility)
- Emergency support availability

It displays:
- A **final safety score**
- A **survival probability** (percentage)
- Individual factor contributions
- Risk-level indicators (Low, Moderate, High)

---

## ✨ Features

- **Predicts survival probability** using ML-based risk evaluation  
- **User-friendly input form**
- **Responsive design for mobile/desktop**
- **Breakdown of safety factors**  
- **Instant calculation using JavaScript**
- **No backend required** (static site)

---

## 🧠 How the Prediction Works

SeaSafe uses a **weighted scoring algorithm** to compute the final survival probability:

1. Convert ship age, capacity usage, and weather conditions into normalized risk scores.
2. Assign weight percentages to each factor:
   - Ship Age (25%)
   - Weather Conditions (35%)
   - Capacity Usage (20%)
   - Emergency Response Availability (20%)
3. Combine weighted values to compute the final prediction score.
4. Display results with a clean UI and safety indicators.

The algorithm is implemented fully in **JavaScript** (`app.js`).

---

## 📁 Project Structure
SeaSafe/
│── index.html        # Main UI
│── style.css         # Styling
│── app.js            # Prediction logic & interactivity
└── assets/           # Images (icons, backgrounds)

---

## 🛠️ Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- Works on any static hosting (Neocities, GitHub Pages, Vercel)

---

## 🚀 How to Run Locally

1. Download or clone the repository:
   ```bash
   git clone https://github.com/your-username/SeaSafe.git



Open the folder:
cd SeaSafe



Run by simply opening index.html in any browser.
No server required.



🔮 Future Enhancements (Optional)


Integrate real weather API (OpenWeather, StormGlass)


Use a trained machine learning model (Python → TensorFlow.js)


Add database storage for predictions


Add risk alerts and travel recommendations


Visualization dashboard using Chart.js



📜 License
This project is open-source under the MIT License.

👤 Author
Kalaiselvan K
Final-year IT Student
Passionate about Python development & software projects.

---

If you want, I can also:

✅ Make this README more advanced  
✅ Add images, badges, GitHub shields  
✅ Create a professional GitHub repository structure  
✅ Improve your SeaSafe UI or algorithm  

Just tell me!


