function displayEnv() {

  var displayEnvs = {"t": "tstnf",
                     "q": "qas",
                     "l": "local"}

  document.getElementById("envText").innerHTML = displayEnvs[TARGET_ENV];


}

function displayLang() {

  if  (TARGET_LANG === "python") {
    document.getElementById("langText").innerHTML = TARGET_LANG;
  }
  else {
    document.getElementById("langText").innerHTML = "C#";
  }


}

function displayEndpoint() {


  document.getElementById("endpointText").innerHTML = "(" + API_ENDPOINT + ")";


}


function displayGcc() {
   document.getElementById("gccText").innerHTML = " GCC: " + GCC;

}


function showFeedbackButtons() {
  const feedbackSection = document.getElementById('feedback-section');
  const feedbackMsg = document.getElementById('feedback-msg');
  feedbackMsg.textContent = '';

  // Reset thumbs up/down buttons
  const upBtn = document.getElementById('feedback-up');
  const downBtn = document.getElementById('feedback-down');
  upBtn.disabled = false;
  downBtn.disabled = false;
  upBtn.style.border = "";
  upBtn.style.boxShadow = "";
  downBtn.style.border = "";
  downBtn.style.boxShadow = "";

  // Reset star rating
  selectedStar = 0;
  stars.forEach(star => {
    star.classList.remove('selected');
    star.style.pointerEvents = 'auto';  // re-enable clicks
    star.style.cursor = 'pointer';
  });

  feedbackSection.classList.remove('d-none');
}


function highlightStars(rating) {
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    if (val <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}

function disableStars() {
  stars.forEach(star => {
    star.style.pointerEvents = 'none'; // disable further clicks
    star.style.cursor = 'default';
  });
}


function showDiagnostics() {
  if (!latestTimeTaken) return;

  const tbody = document.getElementById('diagnosticsTable').querySelector('tbody');
  tbody.innerHTML = ''; // clear previous rows

  for (const [step, time] of Object.entries(latestTimeTaken)) {
    const tr = document.createElement('tr');
    const tdStep = document.createElement('td');
    tdStep.textContent = step;
    const tdTime = document.createElement('td');
    tdTime.textContent = time;
    tr.appendChild(tdStep);
    tr.appendChild(tdTime);
    tbody.appendChild(tr);
  }

  document.getElementById('diagnosticsCard').classList.remove('d-none');
}

function toggleDiagnostics() {
  const diagCard = document.getElementById('diagnosticsCard');
  const diagBtn = document.getElementById('showDiagnosticsBtn');

  if (diagCard.classList.contains('d-none')) {
    if (latestTimeTaken) {
      const tbody = diagCard.querySelector('tbody');
      tbody.innerHTML = '';

      const tokenData = window.lastTokensUsed || {};

      // Mapping between step names and tokens object keys
      const tokenMap = {
        serviceTowerPredict: tokenData.service_tower ||  tokenData.serviceTowerPredict || {},
        intentPredict: tokenData.intent || tokenData.intentPredict ||  {},
        createTicketSummary: tokenData.ticket_summary || tokenData.createTicketSummary ||  {},
        createProposedSolution: tokenData.proposed_solution ||  tokenData.proposedSolution || {},
        detectTicketLanguage: tokenData.language_detection || tokenData.detectTicketLanguage || {},
        translateResponse: tokenData.solution_translate || tokenData.translateResponse || {},
        translateResponseToFallback: tokenData.solution_translate_to_fallback || tokenData.translateResponseToFallback || {}
      };

      let totalPrompt = 0;
      let totalCompletion = 0;

      var agenticRetrievalTokenUsage = "";

      for (const [step, time] of Object.entries(latestTimeTaken)) {
        const tr = document.createElement('tr');
        const tdStep = document.createElement('td');
        tdStep.textContent = step;

        const tdTime = document.createElement('td');
        tdTime.textContent = time;

        let prompt = '-';
        let completion = '-';

        let tokenStep = "";

        switch (step) {
          case 'serviceTower':
            tokenStep = "serviceTowerPredict";
            break;
          case 'intent':
            tokenStep = "intentPredict";
            break;
          case 'summariseTicket':
            tokenStep = "createTicketSummary";
            break;
          case 'proposeSolution':
            tokenStep = "createProposedSolution";
            break;
          default:
            tokenStep = step;

        }


        if (tokenStep !== 'overall') {
           const tData = tokenMap[tokenStep] || {};
          if (tokenStep === "createProposedSolution") {
             prompt = "-";
             completion = "-";
             agenticRetrievalTokenUsage = agenticRetrievalTokenUsage + "Prompt: " + (tData.prompt ?? '-') + " / Completion: " +  (tData.completion ?? '-');
          }
          else {
            prompt = tData.prompt ?? '-';
            completion = tData.completion ?? '-';
            if (!isNaN(parseInt(tData.prompt))) totalPrompt += parseInt(tData.prompt);
            if (!isNaN(parseInt(tData.completion))) totalCompletion += parseInt(tData.completion);
          }
        }

        const tdPrompt = document.createElement('td');
        const tdCompletion = document.createElement('td');

        // For the "overall" row, display the total tokens
        if (tokenStep === 'overall') {
          tdPrompt.textContent = totalPrompt || '-';
          tdCompletion.textContent = totalCompletion || '-';
          tr.classList.add('table-secondary', 'fw-bold');
        } else {
          tdPrompt.textContent = prompt;
          tdCompletion.textContent = completion;
        }

        tr.appendChild(tdStep);
        tr.appendChild(tdTime);
        tr.appendChild(tdPrompt);
        tr.appendChild(tdCompletion);
        tbody.appendChild(tr);
      }

      // Add endpoint row at the bottom
      const endpointRow = document.createElement('tr');
      endpointRow.innerHTML = `
        <td>Endpoint</td>
        <td colspan="3">${API_ENDPOINT}</td>
      `;
      tbody.appendChild(endpointRow);


      const agenticRetrievalTokensRow = document.createElement('tr');
      agenticRetrievalTokensRow.innerHTML = `
        <td><small><small>Agentic Retrieval</small></small></td>
        <td colspan="3"><small><small>${agenticRetrievalTokenUsage}</small></small></td>
      `;
      tbody.appendChild(agenticRetrievalTokensRow);

    }

    diagCard.classList.remove('d-none');
    diagBtn.textContent = 'Hide Diagnostics';
  } else {
    diagCard.classList.add('d-none');
    diagBtn.textContent = 'Show Diagnostics';
  }
}

