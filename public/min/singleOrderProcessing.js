try{$(document).ready((()=>{!async function(){let e=$("#orderNumber").text();fetch("/order-to-process",{method:"get"}).then((e=>e.json())).then((t=>{t.includes(e)?($("#order-table").removeClass("hidden"),$("#available-bar").removeClass("hidden"),$("#unavailable-bar").addClass("hidden")):($("#order-table").addClass("hidden"),$("#available-bar").addClass("hidden"),$("#unavailable-bar").removeClass("hidden"))}))}(),async function(){fetch("/get-order-details",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderNumber:$("#orderNumber").text()})}).then((e=>e.json())).then((e=>{let t=e.product;const n=$(".product-table");for(const e of n)for(const n of t)n.productName===$(e)[0].children[1].children[0].innerText&&(1==n.status&&1==n.approval?($(e)[0].children[1].children[1].innerText=" refund Approved",$(e)[0].children[4].children[0].disabled=!0,$(e)[0].children[5].children[0].disabled=!0,$(e)[0].children[6].children[0].disabled=!0,$(e)[0].children[6].children[0].checked=!0):1==n.status&&0==n.approval?($(e)[0].children[1].children[1].innerText=" refund rejected",$(e)[0].children[5].children[0].disabled=!0):($(e)[0].children[1].children[1].innerText=" awaiting approval",$(e)[0].children[4].children[0].disabled=!0,$(e)[0].children[5].children[0].disabled=!0,$(e)[0].children[6].children[0].disabled=!0))}))}(),async function(){let e=$("#orderNumber"),t=$("#userId"),n=$("#note"),r=$("#fname");$("#sendNoteBtn").on("click",(()=>{let a={orderNumber:e.text(),userFname:r.val(),userId:t.val(),note:n.val()};fetch("/note",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}).then((e=>e.json())).then((e=>{1==e?($("#note-msg").append(`<div class="alert alert-danger"> ${r.val()}: ${n.val()}</div>`),n.val("")):alert("Please try again or refresh the page")}))}))}(),async function(){let e=$("#assign-staff");e.on("change",(()=>{let t=e.val();if(""==t)alert("Kindly select a staff");else{let e={staffId:t,orderNumber:$("#orderNumber").text()};fetch("/assign-staff-to-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.json())).then((e=>{1==e?(alert("Assign successful"),window.location.reload()):alert("Error, contact admin")}))}}))}(),async function(){let e,t=$(".replaceTrigger"),n=$(".productName");for(let r=0;r<t.length;r++)$(t[r]).on("click",(()=>{$(".ReplaceModalProductName").text($(n[r]).text()),e=$(n[r]).text()}));$("#replaceBtn").on("click",(()=>{detailToSend={staffUsername:$("#staffId").val(),staffName:$("#fname").val(),orderNumber:$("#orderNumber").text(),productName:e,replacementName:$("#replacementName").val(),replacementSize:$("#replacementSize").val(),replacementQty:$("#replacementQuantity").val()},fetch("/replace",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify(detailToSend)}).then((e=>e.json())).then((e=>{1==e?(alert("Replacement saved"),window.location.reload()):console.log("Error, contact admin")}))}))}(),async function(){let e,t,n,r=$(".refundTrigger"),a=$(".productName"),d=$(".productQty"),o=$(".productPrice");for(let l=0;l<r.length;l++)$(r[l]).on("click",(()=>{$(".RefundModalProductName").text($(a[l]).text()),e=$(a[l]).text(),t=$(o[l]).text(),n=$(d[l]).text()}));$("#refundBtn").on("click",(()=>{detailToSend={staffUsername:$("#staffId").val(),staffName:$("#fname").val(),orderNumber:$("#orderNumber").text(),productName:e,productQuantity:n,productPrice:t},fetch("/refund",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify(detailToSend)}).then((e=>e.json())).then((e=>{1==e?(alert("Refund sent for approval"),window.location.reload()):console.log("Refund not allowed")}))}))}(),async function(){let e=$("#saveBtn"),t=$("#orderNumber");e.on("click",(()=>{let e={data:[t.text()]};fetch("/saveorder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then((e=>e.text())).then((e=>{alert(e),window.location.reload()}))}))}(),async function(){const e=$("#orderNumber").text(),t=$("#completeBtn"),n=$(".product-table");let r=[];t.on("click",(()=>{for(const e of n)0==e.children[6].children[0].checked&&r.push(e.children[1].children[0].innerText);r.length>0?(alert(`Kindly confirm the following products ${r}`),r=[]):window.location.href=`/complete?id=${e}`}))}()}))}catch(e){}