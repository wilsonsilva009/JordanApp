document.addEventListener("DOMContentLoaded", () => {
  let decks = JSON.parse(localStorage.getItem("decks")) || {};
  let points = JSON.parse(localStorage.getItem("points")) || {wins: 0, losses: 0};
  let selectedDeck = null;
  let currentWord = null;

  const deckList = document.getElementById("deckList");
  const wordList = document.getElementById("wordList");
  const selectedDeckName = document.getElementById("selectedDeckName");

  const backToDecksBtn = document.getElementById("backToDecksBtn");
  const studyResult = document.getElementById("studyResult");
  const studyAnswerInput = document.getElementById("studyAnswer");

  backToDecksBtn.addEventListener("click", () => {
    selectedDeck = null;
    studyResult.textContent = "";
    studyAnswerInput.value = "";
    fadeOut(document.getElementById("word-section"), () => {
      renderDecks();
      fadeIn(document.getElementById("deck-section"));
    });
  });

  document.getElementById("checkAnswerBtn").addEventListener("click", () => {
    const answer = studyAnswerInput.value.trim();
    if (answer === decks[selectedDeck][currentWord]) {
      addPoint("win");
      studyResult.textContent = "Correct!";
      studyResult.classList.remove("incorrect");
      // Return to deck selection after correct answer
      setTimeout(() => {
        selectedDeck = null;
        studyResult.textContent = "";
        studyAnswerInput.value = "";
        fadeOut(document.getElementById("study-section"), () => {
          renderDecks();
          fadeIn(document.getElementById("deck-section"));
        });
      }, 1000); // 1 second delay so user sees "Correct!"
    } else {
      addPoint("loss");
      studyResult.textContent = "Incorrect!";
      studyResult.classList.add("incorrect");
    }
  });

  function fadeOut(element, callback) {
    element.style.animation = "fadeOut 0.3s forwards";
    element.addEventListener("animationend", () => {
      element.style.display = "none";
      element.style.animation = "";
      if (callback) callback();
    }, { once: true });
  }

  function fadeIn(element) {
    element.style.display = "block";
    element.style.animation = "fadeIn 0.3s forwards";
  }

  function saveDecks() {
    localStorage.setItem("decks", JSON.stringify(decks));
  }

  function savePoints() {
    localStorage.setItem("points", JSON.stringify(points));
  }

  function addPoint(type) {
    switch (type) {
      case "win":
        points.wins++;
        break;
      
      case "loss":
        points.losses++;
        break;
    
      default:
        break;
    }
    savePoints();
    renderPoints();
  }

  function renderPoints() {
    const total = points.wins + points.losses;
    const winPercent = (points.wins / total) * 100;
    const blend = 5;

    document.querySelector(".progress-filling").style.background = `
    linear-gradient(to right,
    #71ff71 ${winPercent - blend}%,
    #71ff71 ${winPercent}%,
    #ff7171 ${winPercent}%,
    #ff7171 100%)
    `;
  }

  function renderDecks() {
    deckList.innerHTML = "";
    for (const deckName in decks) {
      const li = document.createElement("li");
      li.innerHTML = `
        ${deckName}
        <button class="selectDeck" data-deck="${deckName}">Select</button>
        <button class="editDeck" data-deck="${deckName}">Edit</button>
        <button class="deleteDeck" data-deck="${deckName}">Delete</button>
      `;
      deckList.appendChild(li);
    }
  }

  function renderWords() {
    wordList.innerHTML = "";
    if (!selectedDeck) return;
    for (const [word, definition] of Object.entries(decks[selectedDeck])) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${word}</strong>: ${definition}
        <button class="editWord" data-word="${word}">Edit</button>
        <button class="deleteWord" data-word="${word}">Delete</button>
      `;
      wordList.appendChild(li);
    }
  }

  // Event delegation for decks
  deckList.addEventListener("click", (e) => {
    if (e.target.classList.contains("selectDeck")) {
      selectedDeck = e.target.dataset.deck;
      selectedDeckName.textContent = selectedDeck;
      fadeOut(document.getElementById("deck-section"), () => {
        fadeIn(document.getElementById("word-section"));
      });
      renderWords();
    }
    if (e.target.classList.contains("deleteDeck")) {
      const deckName = e.target.dataset.deck;
      delete decks[deckName];
      saveDecks();
      renderDecks();
    }
    if (e.target.classList.contains("editDeck")) {
      const deckName = e.target.dataset.deck;
      const newName = prompt("Edit deck name:", deckName);
      if (newName && !decks[newName]) {
        decks[newName] = decks[deckName];
        delete decks[deckName];
        saveDecks();
        renderDecks();
      }
    }
  });

  // Event delegation for words
  wordList.addEventListener("click", (e) => {
    if (e.target.classList.contains("editWord")) {
      const word = e.target.dataset.word;
      const newDef = prompt("Edit definition:", decks[selectedDeck][word]);
      if (newDef !== null) {
        decks[selectedDeck][word] = newDef;
        saveDecks();
        renderWords();
      }
    }
    if (e.target.classList.contains("deleteWord")) {
      const word = e.target.dataset.word;
      delete decks[selectedDeck][word];
      saveDecks();
      renderWords();
    }
  });

  // Add deck
  document.getElementById("addDeckBtn").addEventListener("click", () => {
    const name = document.getElementById("newDeckName").value.trim();
    if (name && !decks[name]) {
      decks[name] = {};
      saveDecks();
      renderDecks();
      document.getElementById("newDeckName").value = "";
    }
  });

  // Add word
  document.getElementById("addWordBtn").addEventListener("click", () => {
    const word = document.getElementById("newWord").value.trim();
    const def = document.getElementById("newDefinition").value.trim();
    if (word && def) {
      decks[selectedDeck][word] = def;
      saveDecks();
      renderWords();
      document.getElementById("newWord").value = "";
      document.getElementById("newDefinition").value = "";
    }
  });

  // Clear words
  document.getElementById("clearWordsBtn").addEventListener("click", () => {
    if (confirm("Clear all words?")) {
      decks[selectedDeck] = {};
      saveDecks();
      renderWords();
    }
  });

  // Delete deck from inside deck view
  document.getElementById("deleteDeckBtn").addEventListener("click", () => {
    if (confirm("Delete this deck?")) {
      delete decks[selectedDeck];
      selectedDeck = null;
      saveDecks();
      document.getElementById("word-section").style.display = "none";
      document.getElementById("deck-section").style.display = "block";
      renderDecks();
    }
  });

  // Study
  document.getElementById("studyBtn").addEventListener("click", () => {
    const words = Object.keys(decks[selectedDeck]);
    if (words.length === 0) {
      alert("No words to study!");
      return;
    }
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById("studyWord").textContent = currentWord;
    document.getElementById("word-section").style.display = "none";
    document.getElementById("study-section").style.display = "block";
  });

  document.getElementById("checkAnswerBtn").addEventListener("click", () => {
    const answer = document.getElementById("studyAnswer").value.trim();
    if (answer === decks[selectedDeck][currentWord]) {
      document.getElementById("studyResult").textContent = "Correct!";
    } else {
      document.getElementById("studyResult").textContent = "Try again.";
    }
  });

  document.getElementById("exitStudyBtn").addEventListener("click", () => {
    document.getElementById("study-section").style.display = "none";
    document.getElementById("word-section").style.display = "block";
    document.getElementById("studyAnswer").value = "";
    document.getElementById("studyResult").textContent = "";
  });

  renderDecks();
  renderPoints();
});
