try{$("#signBtn");let t=$("#walkieTalkieNumber"),n=$("#formInfo");$("#status"),$("#getInitialStatus");function pickWalkieTalkie(t){n.html(`\n        <input type="hidden" value="false" name="status" id="status">\n        <input type="hidden" value="" name="${t.username}" id="userName">\n        <button type="submit" class="btn btn-success btn-md" id="signBtn">Sing and Pick</button>\n        `)}function returnWalkieTalkie(t){n.html('\n        <input type="hidden" value="true" name="status" id="status">\n        <button type="submit" class="btn btn-success btn-md" id="signBtn">Retun now</button>\n        ')}$("#selectedOption").on("change",(()=>{let e=$("#selectedOption").val();console.log(e);let s={user:e};fetch("/user",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}).then((t=>t.json())).then((e=>{t.text(e.walkieTalkie.number),1==e.walkieTalkie.status?(n.html(""),n.html('\n                <input type="hidden" value="false" name="status" id="status">\n                <p>Kindly confirm the Walkie talkie is assingned to you before picking </a>\n                <button type="submit" class="btn btn-success btn-md" id="signBtn">Sing and Pick</button>\n                ')):(n.html(""),n.html('\n                <input type="hidden" value="true" name="status" id="status">\n                <button type="submit" class="btn btn-success btn-md" id="signBtn">Retun now</button>\n                '))}))}))}catch(e){}