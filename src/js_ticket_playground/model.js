let bulkResults = [];

let selectedStar = 0;

let ticketToken = null;
let feedbackData = null;

let latestTimeTaken = null;

let cancelRequested = false;

// let API_ENDPOINT = 'https://func-t-weu-assistant-genai-02.azurewebsites.net/api/predict'; //TSTNF
// let API_ENDPOINT = "http://localhost:7075/api/predict"; // C# local
let API_ENDPOINT = "http://localhost:7071/api/predict" // Python local

let API_ENDPOINT_EXTRA = "==wVJdxVuFzAhfB2NheeVI903ZX9JVWhnACD7U1LUnL4NZHB0Tqce7pE=edoc?".split('').reverse().join('');  //TSTNF

let API_ENDPOINT_FEEDBACK = "http://localhost:7071/api/predictfeedback";

let CUSTOMER_CODE = "Z05"; // Used for Feedback endpoint logging to db

 const queryString = window.location.search;
 const urlParams = new URLSearchParams(queryString);

 let CONCURRENCY_LIMIT = 1;
 const concurrencyLimitParam = urlParams.get('concurrency');

 if (concurrencyLimitParam == null) {

 }
 else {
   CONCURRENCY_LIMIT = parseInt(concurrencyLimitParam);
 }

 let TARGET_INDEX = "ticket-qanda-simple";
 const targetIndexParam = urlParams.get('index');

 if (targetIndexParam == null) {

 }
 else {
   TARGET_INDEX = targetIndexParam;
 }


 let TARGET_ENV = 'q';
 let TARGET_LANG = "csharp";

 const targetEnvParam = urlParams.get('env');

 if (targetEnvParam == null) {

 }
 else {
   TARGET_ENV = targetEnvParam;
 }

 targetEnvChanged();


 const targetLangParam = urlParams.get('target');

 if (targetLangParam == null) {

 }
 else {
   TARGET_LANG = targetLangParam;
 }

 targetLangChanged();

 let GCC = "JUM";

 const gccParam = urlParams.get('gcc');

 if (gccParam == null) {

 }
 else {
   GCC = gccParam;
 }

 gccChanged();


 let LCC = "NL001";

 const lccParam = urlParams.get('lcc');

 if (lccParam == null) {

 }
 else {
   LCC = lccParam;
 }

 lccChanged();

let TONE = null;

 const toneParam = urlParams.get('tone');

 if (toneParam == null) {

 }
 else {
   TONE = toneParam;
 }



 let USER_NAME = "Annie";
 const usernameParam = urlParams.get('user');

 if (usernameParam == null) {

 }
 else {
   USER_NAME = usernameParam;
 }

 userChanged();


 let CONTRACTED_LANGUAGES = null;  // if not supplied, let api determine default contracted languages
 const contractedLanguagesParam = urlParams.get('langs');

 if (contractedLanguagesParam  == null) {

 }
 else {
   CONTRACTED_LANGUAGES = contractedLanguagesParam.split(",");
 }


 let SHOW_INLINE_REFS = null;  // if not supplied, let api determine default contracted languages
 const showInlineRefsParam = urlParams.get('inline-refs');

 if (showInlineRefsParam == null) {

 }
 else {
   SHOW_INLINE_REFS = showInlineRefsParam;
 }



 // === Bulk row start/end range ===
let START_ROW = parseInt(urlParams.get('start') ?? "1");   // default row 1
let END_ROW = parseInt(urlParams.get('end') ?? "-1");      // -1 means last row


