

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


fetch('queryparamdefaults.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load queryparamdefaults.json');
        }
        return response.json();
      })
      .then(queryparamdefaults => {
        console.log(queryparamdefaults.token);
        if (accessTokenParam == null) {
           if (queryparamdefaults.token != null) {
               ACCESS_TOKEN = queryparamdefaults.token;  //  only use default if query param not supplied
               accessTokenChanged();
           }
        }
        if (targetEnvParam == null) {
           if (queryparamdefaults.env != null) {
               TARGET_ENV = queryparamdefaults.env;  //  only use default if query param not supplied
               targetEnvChanged();
           }
        }
        if (gccParam == null) {
           if (queryparamdefaults.gcc != null) {
               GCC = queryparamdefaults.gcc;  //  only use default if query param not supplied
               gccChanged();
           }
        }


      })
      .catch(error => {
        console.error('Error loading queryparadefaults:', error);
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
