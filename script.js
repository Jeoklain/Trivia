// Variáveis de estado globais
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
const QUIZ_AMOUNT = 5; 
const quizContainer = document.getElementById('quiz-container');

const translateData = async (text) => {
    try {
        const decodedText = new DOMParser().parseFromString(text, "text/html").documentElement.textContent;
        const response = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=pt-BR&q=${encodeURIComponent(decodedText )}`);
        const data = await response.json();
        return data[0][0];
    } catch (error) {
        console.warn('Aviso: Falha na tradução. Usando texto original.', error);
        return text;
    }
};


const renderDifficultySelection = (category) => {
    quizContainer.innerHTML = `
        <h2>Escolha a Dificuldade</h2>
        <div class="difficulty-selection">
            <button class="btn difficulty-btn" data-difficulty="easy">Fácil</button>
            <button class="btn difficulty-btn" data-difficulty="medium">Média</button>
            <button class="btn difficulty-btn" data-difficulty="hard">Difícil</button>
        </div>
    `;
   
    document.querySelectorAll('.difficulty-btn').forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = button.getAttribute('data-difficulty');
            fetchQuestions(category, difficulty);
        });
    });
};


const renderLoading = () => {
    quizContainer.innerHTML = `
        <div class="loading-message">
            <p>Carregando e traduzindo ${QUIZ_AMOUNT} questões...</p>
        </div>
    `;
};

const renderQuestion = async (questionData) => {
    const question = questionData.question;
    const allAnswers = questionData.allAnswers;

    quizContainer.innerHTML = `
        <h2>Questão ${currentQuestionIndex + 1} de ${QUIZ_AMOUNT}</h2>
        <p class="question-text">${question}</p>
        <div class="answer-options">
            ${allAnswers.map((answer, index) => 
                `<button class="btn answer-btn" data-answer-index="${index}">${answer}</button>`
            ).join('')}
        </div>
    `;

    document.querySelectorAll('.answer-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            handleAnswerClick(event.target, questionData.correct_answer);
        });
    });
};

const renderFinalScore = () => {
    quizContainer.innerHTML = `
        <div class="score-screen">
            <h2>Quiz Concluído!</h2>
            <p>Parabéns! Seu placar final foi</p>
          <p class="score-text"><span class="highlight-score">${score}</span> acerto(s) de ${QUIZ_AMOUNT}</p>
            <button class="btn" onclick="initQuiz()">Jogar Novamente</button>
        </div>
    `;
};
const handleAnswerClick = (clickedButton, correctAnswer) => {
   
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
    });

    const selectedAnswer = clickedButton.innerText;
    if (selectedAnswer === correctAnswer) {
        score++;
        clickedButton.classList.add('correct');
    } else {
        clickedButton.classList.add('incorrect');
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.innerText === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUIZ_AMOUNT) {
            renderQuestion(currentQuestions[currentQuestionIndex]);
        } else {
            renderFinalScore();
        }
    }, 1500);
};

const fetchQuestions = async (category, difficulty) => {
    renderLoading();
    
    const url = `https://opentdb.com/api.php?amount=${QUIZ_AMOUNT}&category=${category}&difficulty=${difficulty}&type=multiple`;
    
    try {
        const response = await fetch(url );
        const data = await response.json();

        if (data.response_code !== 0) {
            quizContainer.innerHTML = `<p>Erro ao buscar questões. Tente outra categoria ou dificuldade.</p><button class="btn" onclick="initQuiz()">Voltar</button>`;
            return;
        }

        const processedQuestions = await Promise.all(data.results.map(async (item) => {
            const question = new DOMParser().parseFromString(item.question, "text/html").documentElement.textContent;
            const correctAnswer = new DOMParser().parseFromString(item.correct_answer, "text/html").documentElement.textContent;
            const incorrectAnswers = item.incorrect_answers.map(ans => new DOMParser().parseFromString(ans, "text/html").documentElement.textContent);

            const translatedQuestion = await translateData(question);
            const translatedCorrectAnswer = await translateData(correctAnswer);
            const translatedIncorrectAnswers = await Promise.all(incorrectAnswers.map(translateData));

            const allAnswers = [translatedCorrectAnswer, ...translatedIncorrectAnswers];
            allAnswers.sort(() => Math.random() - 0.5);

            return { question: translatedQuestion, correct_answer: translatedCorrectAnswer, allAnswers: allAnswers };
        }));

        currentQuestions = processedQuestions;
        currentQuestionIndex = 0;
        score = 0;
        renderQuestion(currentQuestions[currentQuestionIndex]);

    } catch (error) {
        console.error('Erro fatal ao buscar ou processar dados:', error);
        quizContainer.innerHTML = `<p>Ocorreu um erro de rede ou processamento. Tente novamente.</p><button class="btn" onclick="initQuiz()">Voltar</button>`;
    }
};


const initQuiz = () => {
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    quizContainer.innerHTML = `
        <div id="initial-screen">
            <h2>Bem-vindo(a) ao Trivia Quiz!</h2>
            <p>Escolha uma categoria para começar</p>
            <div class="category-selection">
                <button class="btn category-btn" data-category="9">Conhecimentos Gerais</button>
                <button class="btn category-btn" data-category="15">Jogos</button>
                <button class="btn category-btn" data-category="21">Esportes</button>
            </div>
        </div>
    `;
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            renderDifficultySelection(category);
        });
    });
};
initQuiz();
