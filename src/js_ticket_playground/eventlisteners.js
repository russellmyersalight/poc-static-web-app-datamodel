

// Triggered by: submit button (single ticket)
async function submitTicket() {
  ticketToken = null;
  feedbackdata = null;

  const loader = document.getElementById('myImage');
  const resultBox = document.getElementById('result');
  const submitBtn = document.getElementById('singleSubmitBtn');

  // Disable the submit button
  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  loader.classList.remove('d-none');
  resultBox.classList.add('d-none');

  const shortDesc = document.getElementById('shortDesc').value;
  const longDesc = document.getElementById('longDesc').value;

  var submitPayload = {
     shortDescription: shortDesc,
      description: longDesc,
      targetIndex: TARGET_INDEX,
      gcc: GCC,
      lcc: LCC,
      requester: {firstname: USER_NAME},
  }
  if (TONE != null) {
    submitPayload.formality = TONE;
  }
   if (CONTRACTED_LANGUAGES != null) {
      submitPayload.contractedLangues = CONTRACTED_LANGUAGES;
  }
    if (SHOW_INLINE_REFS != null) {
      submitPayload.showInlineRefs = SHOW_INLINE_REFS;
  }

  var submitPayloadString = JSON.stringify(submitPayload);


  try {
    const response = await fetch(API_ENDPOINT + API_ENDPOINT_EXTRA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:  submitPayloadString
      //body:  JSON.stringify({ shortDescription: shortDesc, description: longDesc, targetIndex: TARGET_INDEX, gcc: GCC,  lcc: LCC, requester: {firstname: USER_NAME}, formality: TONE, contractedLanguages: CONTRACTED_LANGUAGES, showInlineRefs: SHOW_INLINE_REFS} )
    });
    const data = await response.json();
    // Store evaluator dictionary for modal display
    if ("result" in data) {
      window.solutionEvaluator = data.result.solutionEvaluator || {};
    }
    else {
        window.solutionEvaluator = {};
    }

    // Store timeTaken globally for diagnostics
    latestTimeTaken = data.timeTaken;
    window.lastTokensUsed = data.tokensUsed;

    try {
      document.getElementById('language-detected').textContent = data.languageDetection.ticketLanguageDetected;
      document.getElementById('tone-detected').textContent = data.languageDetection.ticketToneDetected;
      document.getElementById('language-detected-solution').textContent = data.languageDetection.ticketLanguageDetectedSolution;
      document.getElementById('tone-detected-solution').textContent = data.languageDetection.ticketToneDetectedSolution;
    }
    catch (error) {
      // Only available in Python version, not in C#
      document.getElementById('language-detected').textContent = ".";
      document.getElementById('tone-detected').textContent = ".";
      document.getElementById('language-detected-solution').textContent = ".";
      document.getElementById('tone-detected-solution').textContent = ".";
    }



    document.getElementById('tower').textContent = data.result.predictedServiceTower;
    document.getElementById('intent').textContent = data.result.predictedIntent;
    // if (data.result.predictedIntentDescription === 'Missing description')
    document.getElementById('intent-description').textContent = (data.result.predictedIntentDescription === 'Missing description') ? "" : data.result.predictedIntentDescription;
    //document.getElementById('solution').textContent = data.result.proposedSolution.length == 0 ? "No knowledge articles found" : data.result.proposedSolution;


    //var solutionLangKeys = Object.keys(data.result.proposedSolution);
    var solutionRow = document.getElementById('proposedsolutionrow');
    var solutionFallbackRow = document.getElementById("proposedsolutionfallbackrow");

    var solutionKey;
    if (data.result.proposedSolution.length == 1) {
       solutionRow.style.display = "none";
       solutionKey = null;
       solutionRow.classList.remove("thick-row");
       solutionFallbackRow.classList.add("thick-row");

    }
    // if (solutionLangKeys.length === 1) {
    //    solutionRow.style.display = "none";
    //    solutionKey = null;
    // }
    else {
       solutionFallbackRow.classList.remove("thick-row");
       solutionRow.classList.add("thick-row");

       solutionRow.style.display = "table-row";
       //const index = solutionLangKeys.findIndex(x => x !== "EN");
       //solutionKey = solutionLangKeys[index];
       solutionKey = data.result.proposedSolution.findIndex(item => item.language !== "EN");
    }

    var englishKey = data.result.proposedSolution.findIndex(item => item.language == "EN");




    let inlineToggle = document.getElementById("inlineRefsToggle");

    const solElem = document.getElementById('solution');
    if (solutionKey === null) {
      solElem.textContent = "Lang not supported - not shown";
    }
    else {
      var solRowTitle = document.getElementById("proposedsolutionrowtitle");
      solRowTitle.textContent = "Proposed Solution (" + data.result.proposedSolution[solutionKey]["language"] + ")";

      const rawSolution = data.result.proposedSolution[solutionKey]["solution"];
      window.currentRawSolution = rawSolution; // store globally



      solElem.innerHTML = rawSolution.length == 0
        ? "-- No solution found --"
        : (inlineToggle.checked ? rawSolution : stripInlineRefs(rawSolution));

      // solElem.innerHTML = data.result.proposedSolution[solutionKey]["solution"].length == 0
      //   ? "N/A"
      //   : data.result.proposedSolution[solutionKey]["solution"];
    }

    // Add hover → modal trigger
    solElem.style.cursor = "pointer";
    solElem.title = "Click to view solution evaluator details";
    solElem.onclick = () => {
        document.getElementById('solutionEvaluatorJson').textContent =
            JSON.stringify(window.solutionEvaluator, null, 2);

        const modal = new bootstrap.Modal(document.getElementById('solutionEvaluatorModal'));
        modal.show();
    };
    //document.getElementById('solution-fallback').textContent = data.result.proposedSolution.EN;
    //var el = document.getElementById('solution-fallback');
    //renderMinimal(el, el.textContent);

     const rawFallbackSolution = data.result.proposedSolution[englishKey]["solution"];
     window.currentRawFallbackSolution = rawFallbackSolution; // store globally

    document.getElementById('solution-fallback').innerHTML =  data.result.proposedSolution[englishKey]["solution"].length == 0
       ? "-- No solution found --"
       : (inlineToggle.checked ? rawFallbackSolution : stripInlineRefs(rawFallbackSolution));


    // if (data.result.ticketLanguageDetected == "EN") {
    //      document.getElementById("proposedsolutionfallbackrow").classList.toggle("d-none");
    // }

   // document.getElementById('summary').textContent = data.result.summary;

      //var solutionLangKeys = Object.keys(data.result.proposedSolution);

    var summaryRow = document.getElementById('summaryrow');
    var summaryFallbackRow = document.getElementById("summaryfallbackrow");

    var summaryKey;
    if (data.result.summaryLanguageArray.length == 1) {
       summaryRow.style.display = "none";
       summaryKey = null;
       //summaryRow.classList.remove("thick-row");
       //summaryFallbackRow.classList.add("thick-row");

    }
    else {
       //summaryFallbackRow.classList.remove("thick-row");
       //summaryRow.classList.add("thick-row");

       summaryRow.style.display = "table-row";
       //const index = solutionLangKeys.findIndex(x => x !== "EN");
       //solutionKey = solutionLangKeys[index];
       summaryKey = data.result.summaryLanguageArray.findIndex(item => item.language !== "EN");
    }

    var englishSummaryKey = data.result.summaryLanguageArray.findIndex(item => item.language == "EN");

    if (summaryKey === null) {

    }
    else {
      var summaryRowTitle = document.getElementById("summaryrowtitle");
      summaryRowTitle.textContent = "Summary (" + data.result.summaryLanguageArray[summaryKey]["language"] + ")";

      document.getElementById('summary').innerHTML = data.result.summaryLanguageArray[summaryKey]["summary"];
    }
    document.getElementById('summary-fallback').innerHTML = data.result.summaryLanguageArray[englishSummaryKey]["summary"];





    let formattedCitationLinks = formatCitationLinks(data.originalProposedSolutionWithRefs, data.citationLinks);
    citationList = dictToHtmlList(formattedCitationLinks);
    if (Object.keys(formattedCitationLinks).length == 0) {
       document.getElementById("citation-info").innerHTML = "Citation reference links: None";
    }
    else {
      document.getElementById("citation-info").innerHTML = "Citation reference links:<br>" + citationList;
    }

        // Show inline refs toggle (default off)
    const inlineToggleContainer = document.getElementById("inlineRefsToggleContainer");
    inlineToggle = document.getElementById("inlineRefsToggle");

    inlineToggle.checked = false;
    inlineToggleContainer.classList.remove("d-none");


    const ticketToken = generateRandomString(16); // Generates a 16-character token
    console.log(ticketToken);

    feedbackData = prepareJsonFeedback(data, ticketToken);
    await callFeedbackEndpoint();  // Log results (even before feedback  - as user may not enter feeedback)


    showFeedbackButtons();

    loader.classList.add('d-none');
    resultBox.classList.remove('d-none');

    // Show toggle button and hide diagnostics table initially
    const diagBtn = document.getElementById('showDiagnosticsBtn');
    diagBtn.classList.remove('d-none');
    diagBtn.textContent = 'Show Diagnostics';
    document.getElementById('diagnosticsCard').classList.add('d-none');

  } catch (error) {
    console.error('Error fetching prediction:', error);
    alert("An error occurred. Please try again.");
    loader.classList.add('d-none');
  } finally {
    // Re-enable the submit button
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
}


// Triggered by:  Feedback up and down buttons
async function submitFeedbackJson(isPositive) {

    const feedbackMsg = document.getElementById('feedback-msg');
    const upBtn = document.getElementById('feedback-up');
    const downBtn = document.getElementById('feedback-down');

    // Disable buttons immediately
    upBtn.disabled = true;
    downBtn.disabled = true;

    // Subtle visual cue: add border & shadow to selected button
    const selectedBtn = isPositive ? upBtn : downBtn;
    selectedBtn.style.border = "2px solid #000";
    selectedBtn.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

     if (feedbackData.feedback == "") {
       feedbackData.feedback = isPositive ?  "ThumbsUp" : "ThumbsDown";
     }
     else {
       feedbackData.feedback = (isPositive ?  "ThumbsUp" : "ThumbsDown") + " - " + feedbackData.feedback;
     }
     feedbackData.isHelpful = isPositive;

    feedbackMsg.textContent = "Thank you for your feedback!";

    await callFeedbackEndpoint();
    var qq = 1;

}

// Deprecated  - now uses submitFeedbackJson
async function submitFeedback(isPositive) {
  const feedbackMsg = document.getElementById('feedback-msg');
  const upBtn = document.getElementById('feedback-up');
  const downBtn = document.getElementById('feedback-down');

  // Disable buttons immediately
  upBtn.disabled = true;
  downBtn.disabled = true;

  // Subtle visual cue: add border & shadow to selected button
  const selectedBtn = isPositive ? upBtn : downBtn;
  selectedBtn.style.border = "2px solid #000";
  selectedBtn.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

  const payload = {
    ticket: {
      shortDescription: document.getElementById('shortDesc').value,
      longDescription: document.getElementById('longDesc').value,
      serviceTower: document.getElementById('tower').textContent,
      intent: document.getElementById('intent').textContent,
      intentDescription: document.getElementById('intent-description').textContent,
      summary: document.getElementById("summary").textContent,
      proposedSolution: document.getElementById('solution').textContent,
    },
    feedback: isPositive ? "positive" : "negative"
  };
  console.log("Feedback entered: ");
  console.log(payload);

  try {
    // Optional: send feedback to your API
    // await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });

    feedbackMsg.textContent = "Thank you for your feedback!";
  } catch (err) {
    console.error("Error sending feedback:", err);
    feedbackMsg.textContent = "Error submitting feedback. Please try again.";
    // Re-enable buttons if sending failed
    upBtn.disabled = false;
    downBtn.disabled = false;
    selectedBtn.style.border = "";
    selectedBtn.style.boxShadow = "";
  }
}


// Triggered by: click on feedback stars
async function submitStarFeedbackJson(rating) {

     const feedbackMsg = document.getElementById('feedback-msg');

     if (feedbackData.feedback == "") {
       feedbackData.feedback = "" + rating + " stars";
     }
     else {
       feedbackData.feedback = feedbackData.feedback + " - " + rating + " stars";
     }

     console.log("Star rating submitted:", feedbackData);
     feedbackMsg.textContent = `Thank you for rating ${rating} star(s)!`;
     await callFeedbackEndpoint();

     var qq = 1;

}

// Deprecated  - now uses submitStarFeedbackJson
async function submitStarFeedback(rating) {
  const feedbackMsg = document.getElementById('feedback-msg');
  try {
    const payload = {
      ticket: {
        shortDescription: document.getElementById('shortDesc').value,
        longDescription: document.getElementById('longDesc').value,
        serviceTower: document.getElementById('tower').textContent,
        intent: document.getElementById('intent').textContent,
        intentDescription: document.getElementById('intent-description').textContent,
        summary: document.getElementById("summary").textContent,
        proposedSolution: document.getElementById('solution').textContent,
      },
      starRating: rating
    };
    console.log("Star rating submitted:", payload);

    // Optional: send payload to your API
    // await fetch('/api/starFeedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });

    feedbackMsg.textContent = `Thank you for rating ${rating} star(s)!`;
  } catch (err) {
    console.error("Error sending star feedback:", err);
    feedbackMsg.textContent = "Error submitting star rating. Please try again.";
  }
}


//Triggered by: Upload & Predict button (in bulk tab)
/* ===== ROBUST CSV PARSER THAT HANDLES QUOTES, COMMAS & LINE BREAKS ===== */
async function processExcel() {
  const bulkSubmitBtn = document.getElementById('bulkSubmitBtn');

  // 🔹 Disable button and show "Processing..."
  bulkSubmitBtn.disabled = true;
  bulkSubmitBtn.textContent = "Processing...";

  const fileInput = document.getElementById('excelFileInput');
  const statusDiv = document.getElementById('bulkStatus');
  const downloadBtn = document.getElementById('downloadExcelBtn');
  bulkResults = [];
  downloadBtn.classList.add('d-none');
  statusDiv.innerHTML = '';
  document.getElementById("cancelBulkBtn").classList.remove('d-none');
  document.getElementById("cancelBulkBtn").disabled = false;

  if (!fileInput.files.length) {
    alert('Please select an Excel file first.');
    return;
  }

  const file = fileInput.files[0];
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (jsonData.length === 0) {
    alert("Excel sheet is empty or invalid.");
    return;
  }

  const headers = Object.keys(jsonData[0]);
  const lowerHeaders = headers.map(h => h.toLowerCase());
  const idIndex = lowerHeaders.indexOf('ticketid');
  const shortIndex = lowerHeaders.indexOf('short_description');
  const longIndex = lowerHeaders.indexOf('description');

  if (idIndex === -1 || shortIndex === -1 || longIndex === -1) {
    alert("Excel must include at least these headers: TICKETID, SHORT_DESCRIPTION, DESCRIPTION");
    return;
  }

  // Tickets with required columns
  let tickets = jsonData.filter(t => t['SHORT_DESCRIPTION']) // && t['DESCRIPTION']);

  // Apply start/end row filtering (1-based indexing)
  if (END_ROW === -1) END_ROW = tickets.length;      // last row if not provided

  // Convert to zero-based JS array slice
  const startIndex = Math.max(START_ROW - 1, 0);
  const endIndex   = Math.min(END_ROW, tickets.length);

  tickets = tickets.slice(startIndex, endIndex);

  const total = tickets.length;

  let completed = 0;
  const startTime = Date.now();

  cancelRequested = false;

  statusDiv.innerHTML = `
    <div class="mb-2 text-info">Processing ${total} tickets
      <span id="initialisationMsg">... Initialising</span>
      <span>&nbsp;&nbsp;&nbsp;<small><small>(concurrency: ${CONCURRENCY_LIMIT})</small></small></span>
    </div>
    <div class="progress" style="height: 25px;">
      <div id="progressBar" class="progress-bar progress-bar-striped progress-bar-animated"
           role="progressbar" style="width: 0%">0%</div>
    </div>
    <div class="mt-2 small text-muted" id="progressText"></div>
  `;

  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressInitText = document.getElementById("initialisationMsg");

  const updateProgress = () => {
    progressInitText.hidden = true;
    const percent = Math.round((completed / total) * 100);
    const elapsed = (Date.now() - startTime) / 1000;
    const avgPerTicket = elapsed / (completed || 1);
    const remaining = total - completed;
    const eta = avgPerTicket * remaining;
    const etaFormatted = eta < 5 ? `${eta.toFixed(1)}s` :
                         eta < 60 ? `${Math.round(eta)}s` :
                         `${Math.round(eta / 60)}m ${Math.round(eta % 60)}s`;
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
    progressText.innerHTML = `Processed ${completed}/${total} (${percent}%) — ETA: ${etaFormatted}`;

  //   statusDiv.innerHTML = `
  //   <div class="mb-2 text-info">
  //     Processing rows ${START_ROW} to ${END_ROW === -1 ? 'end' : END_ROW}
  //     <br>Found ${total} tickets to classify...
  //   </div>
  //   ...
  // `;

  };
    async function processBatch(startIndex) {
      // STOP if user cancelled
      if (cancelRequested) return;

      const ticket = tickets[startIndex];
      if (!ticket) return;


      try {
        var payload = {
          shortDescription: ticket['SHORT_DESCRIPTION'],
          description: ticket['DESCRIPTION'],
          targetIndex: TARGET_INDEX,
          gcc: GCC,
          lcc: LCC,
          requester: {firstname: USER_NAME}
        };

        if (TONE != null) {
          payload.formality = TONE;
        }
         if (CONTRACTED_LANGUAGES != null) {
            payload.contractedLangues = CONTRACTED_LANGUAGES;
        }
          if (SHOW_INLINE_REFS != null) {
            payload.showInlineRefs = SHOW_INLINE_REFS;
        }




        const controller = new AbortController();
        const signal = controller.signal;

        // If user cancels while fetch is in flight → abort it
        if (cancelRequested) {
          controller.abort();
          return;
        }

        const response = await fetch(API_ENDPOINT + API_ENDPOINT_EXTRA, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal
        });

        if (response.status == 500) {
           console.log('aha - 500 error hit');
           const errData = await response.text();
           let errExtra = "";
           if (errData === 'Error: TypeError: Failed to fetch') {
             errExtra = " - likely CORS error";
           }
           console.log('aha - error data: ' + errData + errExtra);
           throw(errData);
        }

        if (!cancelRequested) {
          const data = await response.json();

          var proposedSolutions = [];
          for (let i = 0; i < data.result.proposedSolution.length; i++) {
                console.log(data.result.proposedSolution[i]);
                // proposedSolutions.push(data.result.proposedSolution[i]["language"] + " - " + data.result.proposedSolution[i].solution)
                 proposedSolutions.push(data.result.proposedSolution[i].solution)
          }
          if (data.result.proposedSolution.length == 1) {
              proposedSolutions.push("");   // only 1 language result
          }

          bulkResults[startIndex] = {
            ...ticket,
            GENAI_service_tower: data.result.predictedServiceTower || '',
            GENAI_intent: data.result.predictedIntent || '',
            GENAI_intent_description: data.result.predictedIntentDescription || '',
           // GENAI_proposed_solution: data.result.proposedSolution || '',
            GENAI_detected_ticket_language: data.result.detectedLanguage,
            GENAI_proposed_solution: proposedSolutions[0],
            GENAI_proposed_solution_EN: proposedSolutions[1],
            GENAI_summary: data.result.summary || '',
            GENAI_solution_evaluation_rating: data.result.solutionEvaluator?.rating ?? "",
            GENAI_solution_evaluation_justification: data.result.solutionEvaluator?.justification ?? ""
          };
        }
      } catch (err) {
        console.warn(`Cancelled or failed ticket ${ticket['TICKETID']}:`, err);
        let errExtra = "";
        if (String(err).startsWith("TypeError: Failed to fetch")) {
          errExtra = " - likely CORS issue";
        }

        bulkResults[startIndex] = {
          ...ticket,
          GENAI_service_tower: cancelRequested ? 'Cancelled' : 'Error',
          GENAI_intent: cancelRequested ? 'Cancelled' : ('Error: ' + err + errExtra),
        };
      } finally {
        completed++;
        updateProgress();
      }

      if (cancelRequested) return;

      const nextIndex = startIndex + CONCURRENCY_LIMIT;
      if (nextIndex < tickets.length) {
        await processBatch(nextIndex);
      }
    }

  const workers = [];
  for (let i = 0; i < CONCURRENCY_LIMIT && i < tickets.length; i++) {
    workers.push(processBatch(i));
  }

  await Promise.all(workers);


  const progressBarNew = document.getElementById('progressBar');
  const progressTextNew = document.getElementById('progressText');

  bulkSubmitBtn.disabled = false;
  bulkSubmitBtn.textContent = "Upload & Predict"; // restore original text

  cancelBtn = document.getElementById('cancelBulkBtn');

  cancelBtn.classList.add('d-none'); // hide cancel button

  if (cancelRequested) {
    progressBarNew.classList.remove('progress-bar-animated');
    progressBarNew.classList.add('bg-warning');
    progressTextNew.innerHTML = `⚠️ Processing cancelled — ${completed} tickets completed.`;

    // ✅ FIX: remove the lingering "finishing active tasks" text
        document.getElementById("initialisationMsg").remove();
        document.getElementById("cancelReqMsg").innerHTML = ""; //rbm


    document.getElementById('downloadExcelBtn').classList.remove('d-none');
    cancelBtn.classList.add('d-none');
    return;
}


// Normal completion
progressBarNew.classList.remove('progress-bar-animated');
progressBarNew.classList.add('bg-success');
progressBarNew.textContent = '100%';
progressTextNew.innerHTML = `✅ Completed processing all ${bulkResults.length} tickets.`;

document.getElementById('downloadExcelBtn').classList.remove('d-none');

}


// Triggered by: Download button (after bulk processing finished)
function downloadExcel() {
  if (bulkResults.length === 0) return;

  const fileInput = document.getElementById('excelFileInput');
  const inputFile = fileInput.files[0];

  // Determine base input name
  let baseName = "ticket_predictions";
  if (inputFile && inputFile.name) {
    const dotIndex = inputFile.name.lastIndexOf('.');
    baseName = dotIndex !== -1 ? inputFile.name.substring(0, dotIndex) : inputFile.name;
  }

  // Determine output filename
  let outputName;
  const startParamExists = urlParams.has('start');
  const endParamExists = urlParams.has('end');

  if (startParamExists || endParamExists) {
    // Only include row numbers if either param exists
    const endRowForName = END_ROW === -1 ? (START_ROW + bulkResults.length - 1) : END_ROW;
    outputName = `${baseName}_rows_${START_ROW}_to_${endRowForName}_PREDICTION_RESULTS.xlsx`;
  } else {
    outputName = `${baseName}_PREDICTION_RESULTS.xlsx`;
  }

  const ws = XLSX.utils.json_to_sheet(
    bulkResults.filter(r => r != null)
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Predictions");

  XLSX.writeFile(wb, outputName);
}

// Triggered by: enter pressed in single ticket tab
function handleEnterSubmit(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // prevent newline
    submitTicket();         // call your existing submit function
  }
}

// Triggered by: cancel button pressed in bulk processing
function cancelBulkProcessing() {
  document.getElementById("initialisationMsg").hidden = true;

  cancelRequested = true;

  // ✅ FIX: hide the "Cancellation requested — finishing active tasks.." message immediately
  const initMsg = document.getElementById("initialisationMsg");
  if (initMsg) initMsg.hidden = true;


  const statusDiv = document.getElementById('bulkStatus');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const cancelBtn = document.getElementById('cancelBulkBtn');

  cancelBtn.disabled = true;
  cancelBtn.textContent = "Cancelling...";

  progressBar.classList.remove('progress-bar-animated');
  progressBar.classList.add('bg-warning');
  progressText.innerHTML = "⏳ Cancelling remaining tasks...";

  statusDiv.insertAdjacentHTML(
    "beforeend",
    `<div id="cancelReqMsg" class="mt-2 text-danger">Cancellation requested — finishing active tasks...</div>`
  );
}
