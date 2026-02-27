async function testProxy() {
   const res = await fetch(`/api/proxy/api/predict?tstparam=blah`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok)  console.log("proxy call res is not ok");  //throw new Error(`Proxy failed: ${res.status}`);
  console.log("result of proxy call:")
  console.log(res.json());

}


function prepareJsonFeedback(data, randId, isHelpful=null, feedbackText="") {
    var j =  {};

    if (TARGET_LANG == "python") {
      // j.id = randId;
      if ('ticketId' in data.query) {
        if ((data.query.ticketId != null) && (data.query.ticketId != "")) {
          j.ticketId = data.query.ticketId  + " - " + randId;
        }
        else {
          j.ticketId = randId;
        }
      }
      else {
        j.ticketId = randId;
      }
      j.shortDescription = data.query.shortDescription;
      j.description = data.query.description;
      j.predictedServiceTower =data.result.predictedServiceTower;
      j.predictedIntent = data.result.predictedIntent;
      j.predictedIntentDescription = data.result.predictedIntentDescription;
      j.summary = data.result.summary;
      j.proposedSolution = data.result.proposedSolution;
      j.method = data.agentsMethod.method;
      j.model = data.agentsMethod.model;
      j.apiVersion = data.apiVersion;
      j.status = data.status;
      j.isHelpful = isHelpful;
      j.feedback = feedbackText;
      const now = new Date();
      j.createdAt = now.toISOString();
      j.sourceEnv = TARGET_ENV;
    }
    else {
      let deepCopyData = structuredClone(data);
      if ('ticketId' in deepCopyData.query) {
        if ((deepCopyData.query.ticketId != null) && (deepCopyData.query.ticketId != "")) {
          deepCopyData.query.ticketId =  deepCopyData.query.ticketId  +  " - " + randId;
        }
        else {
          deepCopyData.query.ticketId = randId;
        }
      }
      else {
        deepCopyData.query.ticketId = randId;
      }

      j = {
        "prediction": deepCopyData,
        "isHelpful": true,
        "feedback": "",
        "customerCode": CUSTOMER_CODE
      }
    }


    return j;
}

function formatCitationLinks(proposedSolution, citationLinks) {

      if (citationLinks == null) {
        return {};
      }

      let usedRefIds = [...proposedSolution.matchAll(/\[ref_id:(\d+)\]/g)]
                .map(m => Number(m[1]));  // extract and convert the capturing group
      usedRefIds =  usedRefIds.sort((a, b) => a - b);

      var fullReferences = {};

      citationLinks.forEach((link, index) => {
          var refId;
          if (link.refId) {
             refId = link.refId;
          }
          else {
             refId = link.refid;
          }
          if (usedRefIds.includes(parseInt(refId))) {

            if (link.url in fullReferences) {
               fullReferences[link.url].push(refId);
            }
            else {
              fullReferences[link.url] = [refId];
            }
            var xx = 1;

          }

      });

      const entries = Object.entries(fullReferences);
      // Map over the entries to swap key and value
      const swappedEntries = entries.map(([key, value]) => [value, key]);
      // Convert the swapped entries back into an object
      const fullReferencesSwapped = Object.fromEntries(swappedEntries);


      return fullReferencesSwapped;
}

function dictToHtmlList(dict) {
  let html = "<ul>\n";

  for (const [key, value] of Object.entries(dict)) {
    html += `  <li><strong>${key}</strong>: <small>${value}</small></li>\n`;
  }

  html += "</ul>";
  return html;
}

async function callFeedbackEndpoint() {
    await fetch(API_ENDPOINT_FEEDBACK, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(feedbackData)
    });
}


function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


 function minimalMarkdown(md = '') {
    // Escape HTML
    md = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Basic replacements (order matters)
    md = md
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold
      .replace(/\*(.+?)\*/g, '<em>$1</em>')             // italics
      .replace(/`(.+?)`/g, '<code>$1</code>')           // inline code
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // links
      .replace(/\n/g, '<br>'); // line breaks

    return md;
  }


    function renderMinimal(el, md) {

    if (!el) return;
    el.innerHTML = minimalMarkdown(md);
  }

  function stripInlineRefs(text) {
  if (!text) return text;
  return text.replace(/\[ref_id:\d+\]/g, '');
}
