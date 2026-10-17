let medicineList = [];
let soundEnabled = true;

function getStoredMedicines() {
    const storedMedicines = localStorage.getItem("medicineList");
    if (!storedMedicines) {
        return [];
    }

    try {
        return JSON.parse(storedMedicines);
    } catch (error) {
        return [];
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const toggleButton = document.getElementById("soundToggleBtn");
    if (toggleButton) {
        toggleButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
    }
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
    }

    return Notification.permission === "granted";
}

function savePatient() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const blood = document.getElementById("bloodGroup").value;

    if (!name || !age || !contact || !blood) {
        alert("Please fill in all patient details.");
        return;
    }

    const ageNumber = Number(age);
    if (!Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 100) {
        alert("Age must be between 1 and 100.");
        return;
    }

    requestNotificationPermission();

    localStorage.setItem("patientName", name);
    localStorage.setItem("patientAge", age);
    localStorage.setItem("patientContact", contact);
    localStorage.setItem("patientBlood", blood);

    window.location.href = "dashboard.html";
}

function greet() {
    requestNotificationPermission();
    alert("Welcome! We wish you a happy and healthy life.");
    window.location.href = "patient.html";
}

function saveMedicineList() {
    localStorage.setItem("medicineList", JSON.stringify(medicineList));
}

function displayMedicines() {
    const table = document.getElementById("medicineTable");
    if (!table) return;

    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Time</th>
            <th>Dosage</th>
            <th>Status</th>
        </tr>
    `;

    medicineList.forEach((med) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = med.name;
        row.insertCell(1).textContent = med.time;
        row.insertCell(2).textContent = med.dose;
        row.insertCell(3).textContent = med.status;
    });
}

function clearFields() {
    document.getElementById("medName").value = "";
    document.getElementById("dose").value = "";
    document.getElementById("medTime").value = "";
    document.getElementById("food").value = "";
    document.getElementById("days").value = "";
}

function addMedicine() {
    const name = document.getElementById("medName").value.trim();
    const dose = document.getElementById("dose").value.trim();
    const time = document.getElementById("medTime").value;
    const food = document.getElementById("food").value;
    const days = document.getElementById("days").value;

    if (!name || !dose || !time || !food || !days) {
        alert("Please fill all medicine details.");
        return;
    }

    const medicine = {
        name,
        dose,
        time,
        food,
        days: Number(days),
        daysTaken: 0,
        status: "Pending"
    };

    medicineList.push(medicine);
    saveMedicineList();
    displayMedicines();
    clearFields();
}

function checkReminder() {
    const now = new Date();
    const currentTime =
        now.getHours().toString().padStart(2, "0") + ":" +
        now.getMinutes().toString().padStart(2, "0");

    medicineList.forEach((med) => {
        if (med.time === currentTime && med.status === "Pending") {
            triggerReminder(med);
        }
    });
}

function triggerReminder(med) {
    if (!soundEnabled) {
        alert("Please enable sound first.");
        return;
    }

    const sound = document.getElementById("alarmSound");

    if (sound) {
        sound.play().catch(() => {});
    }

    if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Medicine Reminder", {
            body: med.name + " - " + med.dose + "\nTime: " + med.time,
            icon: "https://cdn-icons-png.flaticon.com/512/3037/3037122.png"
        });

        setTimeout(() => {
            notification.close();
        }, 7000);
    }

    const takeMedicine = confirm("Time to take medicine:\n" + med.name + "\nDosage: " + med.dose);

    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    med.status = takeMedicine ? "Taken" : "Missed";
    saveMedicineList();
    displayMedicines();
}

function loadDashboardData() {
    const patientName = localStorage.getItem("patientName");
    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.textContent = patientName ? "Welcome, " + patientName : "Welcome";
    }

    medicineList = getStoredMedicines();
    displayMedicines();
}

function renderMedicineDetails() {
    const table = document.getElementById("allMedicineTable");
    const summary = document.getElementById("medicineSummary");

    if (!table) return;

    medicineList = getStoredMedicines();
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Dosage</th>
            <th>Time</th>
            <th>Food</th>
            <th>Days</th>
            <th>Status</th>
        </tr>
    `;

    if (medicineList.length === 0) {
        table.insertAdjacentHTML("beforeend", `
            <tr>
                <td colspan="6">No medicines added yet.</td>
            </tr>
        `);
        if (summary) summary.textContent = "Total medicines: 0";
        return;
    }

    medicineList.forEach((med) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = med.name;
        row.insertCell(1).textContent = med.dose;
        row.insertCell(2).textContent = med.time;
        row.insertCell(3).textContent = med.food;
        row.insertCell(4).textContent = med.days || "-";
        row.insertCell(5).textContent = med.status;
    });

    if (summary) {
        summary.textContent = `Total medicines: ${medicineList.length}`;
    }
}

function renderHealthStatus() {
    const patientName = localStorage.getItem("patientName") || "Unknown";
    const patientAge = localStorage.getItem("patientAge") || "-";
    const patientBlood = localStorage.getItem("patientBlood") || "-";

    const patientNameStatus = document.getElementById("patientNameStatus");
    const patientAgeStatus = document.getElementById("patientAgeStatus");
    const patientBloodStatus = document.getElementById("patientBloodStatus");
    const totalMedsCount = document.getElementById("totalMedsCount");
    const pendingMedsCount = document.getElementById("pendingMedsCount");
    const takenMedsCount = document.getElementById("takenMedsCount");
    const missedMedsCount = document.getElementById("missedMedsCount");
    const healthMessage = document.getElementById("healthMessage");

    if (patientNameStatus) patientNameStatus.textContent = "Name: " + patientName;
    if (patientAgeStatus) patientAgeStatus.textContent = "Age: " + patientAge;
    if (patientBloodStatus) patientBloodStatus.textContent = "Blood Group: " + patientBlood;

    medicineList = getStoredMedicines();
    const total = medicineList.length;
    const pending = medicineList.filter((med) => med.status === "Pending").length;
    const taken = medicineList.filter((med) => med.status === "Taken").length;
    const missed = medicineList.filter((med) => med.status === "Missed").length;

    if (totalMedsCount) totalMedsCount.textContent = "Total Medicines: " + total;
    if (pendingMedsCount) pendingMedsCount.textContent = "Pending: " + pending;
    if (takenMedsCount) takenMedsCount.textContent = "Taken: " + taken;
    if (missedMedsCount) missedMedsCount.textContent = "Missed: " + missed;

    if (healthMessage) {
        if (pending > 0) {
            healthMessage.textContent = "Follow-up is needed. Some medicines are still pending.";
        } else if (missed > 0) {
            healthMessage.textContent = "Please review missed medicines and follow the schedule carefully.";
        } else if (taken === total && total > 0) {
            healthMessage.textContent = "Great job! All medicines have been completed on schedule.";
        } else {
            healthMessage.textContent = "No medicine records yet. Add medicines to track your health routine.";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();

    const toggleButton = document.getElementById("soundToggleBtn");
    if (toggleButton) {
        toggleButton.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
    }

    if (document.getElementById("allMedicineTable")) {
        renderMedicineDetails();
    }

    if (document.getElementById("patientNameStatus")) {
        renderHealthStatus();
    }

    if (typeof setInterval === "function") {
        setInterval(checkReminder, 1000);
    }
});

