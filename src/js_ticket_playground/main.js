

// Add event listeners and initialisation


fetch('config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load config.json');
        }
        return response.json();
      })
      .then(config => {
        const versionEl = document.getElementById('app-version');
        if (versionEl) {
          versionEl.textContent = `Version ${config.version}`;
        }

      })
      .catch(error => {
        console.error('Error loading config:', error);
      });



const stars = document.querySelectorAll('#star-rating .star');

stars.forEach(star => {
  star.addEventListener('mouseover', () => {
    const val = parseInt(star.dataset.value);
    highlightStars(val);
  });

  star.addEventListener('mouseout', () => {
    highlightStars(selectedStar);
  });

  star.addEventListener('click', () => {
    if (selectedStar === 0) {  // only allow selection once
      selectedStar = parseInt(star.dataset.value);
      highlightStars(selectedStar);
      disableStars();
      submitStarFeedbackJson(selectedStar);
    }
  });
});



document.addEventListener("DOMContentLoaded", function () {
    const inlineToggle = document.getElementById("inlineRefsToggle");
    const showWorkInstructionsToggle = document.getElementById("showWorkInstructionsToggle");
    const proposedWorkInstructionsRowEl = document.getElementById("workinstructionsrow");
    const solElem = document.getElementById("solution");
    const fallbackSolElem =  document.getElementById("solution-fallback");

    inlineToggle.addEventListener("change", function () {
      if (!window.currentRawFallbackSolution) return;

      if (inlineToggle.checked) {
        solElem.innerHTML = window.currentRawSolution;
        fallbackSolElem.innerHTML = window.currentRawFallbackSolution;
      } else {
        solElem.innerHTML = stripInlineRefs(window.currentRawSolution);
        fallbackSolElem.innerHTML = stripInlineRefs(window.currentRawFallbackSolution);
      }
    });

    showWorkInstructionsToggle.addEventListener("change", function () {
      //if (!window.currentRawFallbackSolution) return;

      if (showWorkInstructionsToggle.checked) {
        proposedWorkInstructionsRowEl.classList.remove("d-none");

      } else {
        proposedWorkInstructionsRowEl.classList.add("d-none");

      }
    });

});
