// Initialize variables with values from local storage or defaults
let totalScore = parseInt(localStorage.getItem("totalScore")) || 0;
let ballCount = parseInt(localStorage.getItem("ballCount")) || 0;
let wickets = parseInt(localStorage.getItem("wickets")) || 0;
let targetMode = JSON.parse(localStorage.getItem("targetMode")) || false;
let targetScore = parseInt(localStorage.getItem("targetScore")) || 0;
let oversLimit = parseInt(localStorage.getItem("oversLimit")) || 0;
let currentOver = JSON.parse(localStorage.getItem("currentOver")) || [];
let overHistory = JSON.parse(localStorage.getItem("overHistory")) || [];
let extraType = "";

// Function to save game state to local storage
function saveGameState() {
  localStorage.setItem("totalScore", totalScore);
  localStorage.setItem("ballCount", ballCount);
  localStorage.setItem("wickets", wickets);
  localStorage.setItem("targetMode", JSON.stringify(targetMode));
  localStorage.setItem("targetScore", targetScore);
  localStorage.setItem("oversLimit", oversLimit);
  localStorage.setItem("currentOver", JSON.stringify(currentOver));
  localStorage.setItem("overHistory", JSON.stringify(overHistory));
}

// Function to toggle Target Mode
function toggleTargetMode() {
  targetMode = !targetMode;
  if (targetMode) {
    targetScore = parseInt(prompt("Enter Target Score:", "0"));
    oversLimit = parseInt(prompt("Enter number of overs for target mode:", "1"));
    document.getElementById("targetModeMessage").innerText = `You need ${targetScore} runs in ${oversLimit * 6} balls to win the game`;
    document.getElementById("targetModeMessage").style.display = "block";
  } else {
    document.getElementById("targetModeMessage").style.display = "none";
  }
  saveGameState();
}

// Function to set the overs limit in normal mode
function setOversLimit() {
  const inputOversLimit = document.getElementById("oversLimit").value;
  if (inputOversLimit && parseInt(inputOversLimit) > 0) {
    oversLimit = parseInt(inputOversLimit);
    document.getElementById("oversLimitMessage").innerText = `Overs Limit: ${oversLimit} overs`;
    document.getElementById("oversLimitMessage").style.display = "block";
    saveGameState();
  } else {
    alert("Please enter a valid overs limit.");
  }
}

// Check if overs limit is reached
function isOversLimitReached() {
  return Math.floor(ballCount / 6) >= oversLimit;
}

// Function to add runs in both normal and target modes
function addRun(runs) {
  if (isOversLimitReached()) {
    checkTargetStatus();
    return;
  }
  
  totalScore += runs;
  ballCount++;
  currentOver.push(runs);
  updateScore();
  checkOverComplete();
  saveGameState();
}

// Function to open extra runs modal for wide, no-ball, and wicket options
function openExtraRun(type) {
  extraType = type;
  document.getElementById("ExtraRuns").style.display = "block";
}

// Function to add extra runs for wide or no-ball
function addExtraRuns(runs) {
  if (isOversLimitReached()) {
    checkTargetStatus();
    return;
  }

  if (extraType === "WD") {
    totalScore += runs + 1;
    currentOver.push(`WD+${runs}`);
  } else if (extraType === "NB") {
    totalScore += runs + 1;
    currentOver.push(`NB+${runs}`);
  } else if (extraType === "W") {
    if (wickets < 10) {
      totalScore += runs;
      wickets++;
      ballCount++;
      currentOver.push(`W+${runs}`);
    }
  }

  updateScore();
  checkOverComplete();
  closeExtraRunModal();
  saveGameState();
}

// Function to close the extra run modal
function closeExtraRunModal() {
  document.getElementById("ExtraRuns").style.display = "none";
}

// Function to add a wicket without extra runs
function addExtraRunsWicket() {
  addExtraRuns(0);
}

// Function to check if an over is complete and update history
function checkOverComplete() {
  if (ballCount % 6 === 0) {
    overHistory.push(currentOver);
    updateOverHistory();
    currentOver = [];
    saveGameState();

    // Display over completion message for 3 seconds
    const overCompleteMessage = document.getElementById("overCompleteMessage");
    overCompleteMessage.innerText = `Over ${overHistory.length} completed`;
    overCompleteMessage.style.display = "block";
    setTimeout(() => {
      overCompleteMessage.style.display = "none";
    }, 3000);
  }
}

// Function to update the score display and target message
function updateScore() {
  document.getElementById("totalScore").innerText = totalScore;
  document.getElementById("wickets").innerText = wickets;
  document.getElementById("ballCount").innerText = ballCount % 6;
  document.getElementById("thisover").innerHTML = currentOver.join(", ");
  
  // Update target mode message if active
  if (targetMode) {
    let ballsRemaining = oversLimit * 6 - ballCount;
    let runsNeeded = targetScore - totalScore;
    
    if (totalScore >= targetScore) {
      document.getElementById("targetModeMessage").innerText = "You won the game!";
    } else if (ballsRemaining <= 0) {
      document.getElementById("targetModeMessage").innerText = "Bowling team won!";
    } else {
      document.getElementById("targetModeMessage").innerText = `You need ${runsNeeded} runs in ${ballsRemaining} balls to win the game`;
    }
  }
}

// Function to update over history display
function updateOverHistory() {
  let historyHTML = "";
  overHistory.forEach((over, index) => {
    historyHTML += `<li>Over ${index + 1}: ${over.join(", ")}</li>`;
  });
  document.getElementById("historyList").innerHTML = historyHTML;
}

// Function to check the target status in case of overs limit reached
function checkTargetStatus() {
  if (targetMode && totalScore < targetScore) {
    document.getElementById("targetModeMessage").innerText = "Bowling team won!";
  }
  alert("Overs limit reached! You cannot play more balls.");
}

// Toss functionality
function openTossModal() {
  window.location.href = "coin.html";
}

// Function to close the Toss Modal
function closeTossModal() {
  document.getElementById("tossModal").style.display = "none";
}

// Remove last over if required
function back() {
  if (overHistory.length > 0) {
    let removedOver = overHistory.pop();
    currentOver = removedOver;
    ballCount -= removedOver.length;
    totalScore -= removedOver.reduce((acc, score) => (isNaN(score) ? acc : acc + parseInt(score)), 0);
    updateScore();
    updateOverHistory();
    saveGameState();
  }
}
function eraseHistory() {
  totalScore = 0;
  ballCount = 0;
  wickets = 0;
  targetMode = false;
  targetScore = 0;
  currentOver = [];
  overHistory = [];
  document.getElementById("oversLimitMessage").style.display = "none";
  document.getElementById("targetModeMessage").style.display = "none";
  updateScore();
  updateOverHistory();
  localStorage.clear(); // Clear local storage to erase history completely
  alert("Game history erased.");
}
// Remove last entry from current over
document.getElementById("removeLastEntryButton").addEventListener("click", function() {
  if (currentOver.length > 0) {
    // Remove the last entry from the current over
    const lastEntry = currentOver.pop();

    // Adjust ball count and score accordingly
    ballCount--;
    totalScore -= isNaN(lastEntry) ? 0 : parseInt(lastEntry);

    // Update the score and current over display
    updateScore();
    document.getElementById("thisover").innerHTML = currentOver.join(", ");

    saveGameState(); // Save the updated game state
  }
});
