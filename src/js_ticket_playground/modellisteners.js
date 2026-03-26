function targetLangOrEnvChanged() {
   switch (TARGET_ENV) {
    case "t":
      if (TARGET_LANG == "python") {
        API_ENDPOINT = 'https://func-t-weu-assistant-genai-02.azurewebsites.net/api/predict'; //TSTNF
        API_ENDPOINT_EXTRA = "==wVJdxVuFzAhfB2NheeVI903ZX9JVWhnACD7U1LUnL4NZHB0Tqce7pE=edoc?".split('').reverse().join('');  //TSTNF
        API_ENDPOINT_FEEDBACK = "https://func-t-weu-assistant-genai-05.azurewebsites.net/api/predictfeedback"
      }
      else {
        API_ENDPOINT = 'https://func-t-weu-assistant-02.azurewebsites.net/api/predict'; //TSTNF
        API_ENDPOINT_EXTRA = "==QTa-ccuFzAN1BCqP-2isQChQb96l_Fe_yOg8SibDHME01CdMEJIjaG=edoc?".split('').reverse().join('');  //TSTNF
        API_ENDPOINT_FEEDBACK = 'https://func-t-weu-assistant-02.azurewebsites.net/api/predict/feedback'; //TSTNF

      }
      CUSTOMER_CODE = "Z05";
      break;
    case "q":
      if (TARGET_LANG == "python") {

          API_ENDPOINT = 'https://func-q-weu-assistant-genai-01.azurewebsites.net/api/predict';  //QAS
          API_ENDPOINT_EXTRA = "==QBiZRCuFzA5JO_TzGtA1cXbwYYvs9Tjcvw4fTj2gElJCTysc4V7NLm=edoc?".split('').reverse().join(''); // QAS
          API_ENDPOINT_FEEDBACK = "https://func-t-weu-assistant-genai-05.azurewebsites.net/api/predictfeedback"
      }
      else {
           API_ENDPOINT = 'https://func-q-weu-assistant-01.azurewebsites.net/api/predict';  //QAS
           API_ENDPOINT_EXTRA = "==AYfzfMuFzAwFRr_aShvZJv8FSrHED-nzV8QdjoiIBz7AZk_cDQpW1z=edoc?".split('').reverse().join('');  // QAS
           API_ENDPOINT_FEEDBACK = 'https://func-q-weu-assistant-01.azurewebsites.net/api/predict/feedback';  //QAS
      }
      CUSTOMER_CODE = "ZCS";
      break;
    case "l":

      if (TARGET_LANG == "python") {
          API_ENDPOINT = "http://localhost:7071/api/predict" // Python local
          API_ENDPOINT_FEEDBACK = "http://localhost:7071/api/predictfeedback"
      }
      else {
         API_ENDPOINT = "http://localhost:7075/api/predict" // C#  local
         API_ENDPOINT_FEEDBACK = "http://localhost:7075/api/predict/feedback";
         API_ENDPOINT_EXTRA = "==QTa-ccuFzAN1BCqP-2isQChQb96l_Fe_yOg8SibDHME01CdMEJIjaG=edoc?".split('').reverse().join('');
      }
      CUSTOMER_CODE = "Z05";
      break;
  }

}

function targetEnvChanged() {
  targetLangChanged();

  displayEnv();
  displayEndpoint();

}

function targetLangChanged() {
  targetLangOrEnvChanged();

  displayLang();
  displayEndpoint();
  setupLanguageDetectionDiv();

}


function gccChanged() {
  displayGcc();

}

function lccChanged() {
  displayLcc();
}

function userChanged() {
  displayUser();
}

function dueDateChanged() {
  displayDueDate();
}

function sourceChanged() {
  displaySource();
}


function userEmailChanged() {
  displayUserEmail();
}
