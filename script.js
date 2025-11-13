let rightAnswers = 0;

const translateData = async (text) => {
    try {
        const response = await fetch(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=pt-BR&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        return data[0][0];
    } catch (error) {
        console.error('Error translating text:', error);
        return text;
    }
};

const fetchData = async () => {
    try {
        const container = document.getElementById('trivia-container');
        let categoria = '9';
        let dificuldade = 'easy';

        // seleção da categoria
        await new Promise(resolve => {
            const botoesCat = document.querySelectorAll('.botao-cat');
            botoesCat.forEach(botao => {
                botao.onclick = () => {
                    if (botao.innerText === "Jogos"){
                        categoria = '15';
                    } else if (botao.innerText === "Esportes"){
                        categoria = '21';
                    }
                    resolve();
                    container.innerHTML = 'Escolha a dificuldade:<br>';
                };    
            });
        });

        // seleção da dificuldade
        await new Promise(resolve => {
            const dificuldades = ['Fácil', 'Média', 'Difícil'];
            dificuldades.forEach(dif => {
                const botao = document.createElement('button');
                botao.innerText = dif;
                botao.onclick = () => {
                    if (botao.innerText === "Difícil"){
                        dificuldade = 'hard';
                    } else if (botao.innerText === "Média"){
                        dificuldade = 'medium';
                    }
                    resolve();
                    container.innerHTML = '';
                }; 
                container.appendChild(botao);
            });
        });
        
        const response = await fetch(`https://opentdb.com/api.php?amount=3&category=${categoria}&difficulty=${dificuldade}`);
        const data = await response.json();
        
        for (const [index, item] of data.results.entries()) {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `<h3>Q${index + 1}: ${decodeURIComponent(await translateData(item.question))}</h3>`;
            container.appendChild(questionDiv);
            const answerDiv = document.createElement('div');
            const answers = [...item.incorrect_answers, item.correct_answer];
            answers.sort(() => Math.random() - 0.5);
            for (const answer of answers) {
                const answerBtn = document.createElement('button');
                answerBtn.innerText = decodeURIComponent(await translateData(answer));
                answerDiv.appendChild(answerBtn);
            }
            container.appendChild(answerDiv);

            const translatedCorrectAnswer = decodeURIComponent(await translateData(item.correct_answer));
            
            await new Promise(resolve => {
                const buttons = answerDiv.querySelectorAll('button');
                buttons.forEach(button => {
                    button.onclick = () => {
                        if (button.innerText === translatedCorrectAnswer) {
                            alert('Correct!');
                            rightAnswers++;
                        } else {
                            alert(`Wrong! The correct answer was: ${translatedCorrectAnswer}`);
                        }
                        container.innerHTML = '';
                        resolve();
                    };
                });
            });
        }
        container.innerHTML = `<h2>You got ${rightAnswers} out of ${data.results.length} correct!</h2>`;
    } catch (error) {
        console.error('Error fetching trivia:', error);
    }
};

fetchData();