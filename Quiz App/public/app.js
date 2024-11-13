// Import necessary functions from Firebase SDK v11.x
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkBziSXxTHjZ_LekPV2bGjGsUuyal7o1Q", // Ensure this key is correct
    authDomain: "quizappwithfirebasedatab-bfcc6.firebaseapp.com",
    databaseURL: "https://quizappwithfirebasedatab-bfcc6-default-rtdb.firebaseio.com",
    projectId: "quizappwithfirebasedatab-bfcc6",
    storageBucket: "quizappwithfirebasedatab-bfcc6.firebasestorage.app",
    messagingSenderId: "1066113979580",
    appId: "1:1066113979580:web:df5a17fe0f2bac29caecb9"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Variables to store questions, current question index, and score
let questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris"
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    answer: "4"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: "Pacific Ocean"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    answer: "Leonardo da Vinci"
  },
  {
    question: "What is the speed of light?",
    options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
    answer: "300,000 km/s"
  }
];

let currentQuestionIndex = 0;
let score = 0;

// Handle sign-up
document.getElementById("signup-btn").addEventListener("click", function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed up", userCredential);
      // Automatically log in after sign-up
      signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
      document.getElementById("error-message").textContent = error.message;
    });
});

// Handle sign-in
// document.getElementById("login-btn").addEventListener("click", function() {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;
//   signInWithEmailAndPassword(auth, email, password)
//   .then((userCredential) => {
//     console.log("User signed in", userCredential);
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;

//     switch (errorCode) {
//       case 'auth/invalid-email':
//         console.error("Invalid email format.");
//         break;
//       case 'auth/user-not-found':
//         console.error("No user found with this email.");
//         break;
//       case 'auth/wrong-password':
//         console.error("Incorrect password.");
//         break;
//       case 'auth/invalid-credential':
//         console.error("Invalid credentials provided.");
//         break;
//       default:
//         console.error("Error: ", errorMessage);
//     }

//     document.getElementById("error-message").textContent = errorMessage; // Display the error to the user
//   });


// });
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// const a.uth = getAuth();

document.getElementById("login-btn").addEventListener("click", function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User signed in:", userCredential);
        // Handle success - redirect or load the quiz
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error Code:", errorCode);
        console.error("Error Message:", errorMessage);
        
        document.getElementById("error-message").textContent = errorMessage; // Display error to the user
      });
  } else {
    console.error("Email and password cannot be empty");
    document.getElementById("error-message").textContent = "Please enter both email and password.";
  }
});


// Handle sign-out
document.getElementById("logout-btn").addEventListener("click", function() {
  signOut(auth).then(() => {
    console.log("User signed out");
    document.getElementById("quiz-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "none";
  });
});

// Handle Auth State Change
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "block";
    displayQuestion();
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("quiz-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
  }
});

// Display the current question and options
function displayQuestion() {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  optionsElement.innerHTML = "";
  currentQuestion.options.forEach(option => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="radio" name="answer" value="${option}">${option}`;
    optionsElement.appendChild(li);
  });
}

// Check the selected answer and update the score
function checkAnswer() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (selectedOption) {
    const userAnswer = selectedOption.value;
    const correctAnswer = questions[currentQuestionIndex].answer;

    if (userAnswer === correctAnswer) {
      score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      displayQuestion();
    } else {
      saveScore();
      showScore();
    }
  } else {
    alert("Please select an answer");
  }
}

// Save the score to Firebase
function saveScore() {
  const user = auth.currentUser;
  if (user) {
    set(ref(db, 'scores/' + user.uid), {
      username: user.email,
      score: score
    });
  }
}

// Display the user's final score
function showScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.style.display = "block";
  scoreElement.textContent = `Your score: ${score} out of ${questions.length}`;
}

// Event listener for the Next button
document.getElementById("next-button").addEventListener("click", function() {
  checkAnswer();
});
