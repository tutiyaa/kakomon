// 問題データを取得
const allQuestions = window.questions2023 || [];

// 選択された問題を取得
let quizQuestions = [];

try {
  quizQuestions = JSON.parse(
    localStorage.getItem("selectedQuestions")
  ) || [];
} catch {
  quizQuestions = [];
}

// 問題番号
let currentQuestion = 0;

// 選択した答え
let selectedAnswer = null;

// 回答済みか
let answered = false;

// 今回の演習結果
let quizAnswers = [];

// 分野名
const categoryNames = {
  technology: "テクノロジ系",
  management: "マネジメント系",
  strategy: "ストラテジ系"
};

// ページ読み込み
document.addEventListener("DOMContentLoaded", () => {

  if (!quizQuestions.length) {
    alert("問題データがありません。ホームから選択してください。");
    goHome();
    return;
  }

  showQuestion();
});

// 問題表示
function showQuestion() {

  const question = quizQuestions[currentQuestion];

  if (!question) {
    showFinish();
    return;
  }

  selectedAnswer = null;
  answered = false;

  // 問題番号
  document.getElementById("questionNumber").textContent =
    `問題 ${currentQuestion + 1} / ${quizQuestions.length}`;

  // 進捗
  const percent = Math.round(
    ((currentQuestion + 1) / quizQuestions.length) * 100
  );

  document.getElementById("progress").style.width =
    `${percent}%`;

  document.getElementById("progressPercent").textContent =
    `${percent}%`;

  // 分野
  document.getElementById("category").textContent =
    categoryNames[question.category] || question.category;

  // 小分類
  document.getElementById("subcategory").textContent =
    question.subcategory || "";

  // 問題文
  document.getElementById("question").textContent =
    question.question;

  // 選択肢
  const choicesElement = document.getElementById("choices");
  choicesElement.replaceChildren();

  question.choices.forEach((choice, index) => {

    const button = document.createElement("button");

    button.className = "choice";

    const letter = String.fromCharCode(65 + index);

    button.textContent = `${letter}. ${choice}`;

    button.addEventListener("click", () => {
      selectAnswer(index);
    });

    choicesElement.appendChild(button);
  });

  // 表示をリセット
  document.getElementById("answerButton").style.display = "block";

  document.getElementById("result").classList.add("hidden");

}

// 選択肢を選ぶ
function selectAnswer(index) {

  if (answered) return;

  selectedAnswer = index;

  const choices = document.querySelectorAll(".choice");

  choices.forEach((choice, i) => {
    choice.classList.toggle("selected", i === index);
  });
}

// 回答する
function checkAnswer() {

  if (selectedAnswer === null) {
    alert("選択肢を選んでください。");
    return;
  }

  if (answered) return;

  answered = true;

  const question = quizQuestions[currentQuestion];

  const correct = selectedAnswer === question.answer;

  // 選択肢の色を変更
  const choices = document.querySelectorAll(".choice");

  choices.forEach((choice, index) => {

    choice.disabled = true;

    if (index === question.answer) {
      choice.classList.add("correct");
    }

    if (index === selectedAnswer && !correct) {
      choice.classList.add("incorrect");
    }
  });

  // 正誤表示
  const resultTitle = document.getElementById("resultTitle");

  if (correct) {
    resultTitle.textContent = "⭕ 正解！";
    resultTitle.className = "result-title correct-text";
  } else {
    resultTitle.textContent = "❌ 不正解";
    resultTitle.className = "result-title incorrect-text";
  }

  // 正解表示
  const letter = String.fromCharCode(65 + question.answer);

  document.getElementById("correctAnswer").textContent =
    `${letter}. ${question.choices[question.answer]}`;

  // 解説
  document.getElementById("explanationText").textContent =
    question.explanation;

  // 今回の結果を保存
  quizAnswers.push({
    questionId: question.id,
    correct: correct,
    selectedAnswer: selectedAnswer
  });

  // 回答ボタンを隠す
  document.getElementById("answerButton").style.display = "none";

  // 結果を表示
  document.getElementById("result").classList.remove("hidden");

  // 次の問題ボタンの表示を変更
  const nextButton = document.getElementById("nextButton");

  nextButton.textContent =
    currentQuestion === quizQuestions.length - 1
      ? "結果を見る"
      : "次の問題";

  // 学習履歴を保存
  saveHistory(question, correct);
}

// 履歴保存
function saveHistory(question, correct) {

  let history = [];

  try {
    history = JSON.parse(
      localStorage.getItem("feQuizHistory")
    ) || [];
  } catch {
    history = [];
  }

  history.push({
    questionId: question.id,
    year: question.year,
    category: question.category,
    correct: correct,
    date: new Date().toISOString()
  });

  localStorage.setItem(
    "feQuizHistory",
    JSON.stringify(history)
  );
}

// 次の問題
function nextQuestion() {

  currentQuestion++;

  if (currentQuestion >= quizQuestions.length) {
    showFinish();
    return;
  }

  showQuestion();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// 結果画面
function showFinish() {

  const correctCount = quizAnswers.filter(
    answer => answer.correct
  ).length;

  const total = quizQuestions.length;

  const accuracy = Math.round(
    (correctCount / total) * 100
  );

  const container = document.querySelector(".quiz-container");

  container.innerHTML = `
    <div class="finish-card">

      <div class="finish-icon">🎉</div>

      <h2>2023年度の演習終了！</h2>

      <p>お疲れさまでした。</p>

      <div class="finish-score">
        <p>正解数</p>
        <strong>${correctCount} / ${total}問</strong>
        <p>正答率 ${accuracy}%</p>
      </div>

      <button class="next-button" onclick="retryQuiz()">
        もう一度挑戦する
      </button>

      <button class="next-button" onclick="goHome()">
        ホームに戻る
      </button>

    </div>
  `;
}

// もう一度挑戦
function retryQuiz() {

  quizAnswers = [];
  currentQuestion = 0;

  showQuestion();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ホームへ戻る
function goHome() {
  window.location.href = "index.html";
}