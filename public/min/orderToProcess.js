$(document).ready((()=>{try{!async function(){fetch("/orderInfo",{method:"get"}).then((e=>e.json())).then((e=>{!function(e){let n=$(".eachOrder");for(let r=0;r<n.length;r++){let t=n[r];for(let n=0;n<e.length;n++)if(e[n].orderNumber==t.children[0].innerText){1==e[n].meatPicker.status?t.children[1].innerText="Done":1==e[n].meatPicker.active&&(t.children[1].innerText="Processing"),1==e[n].dryPicker.status?t.children[2].innerText="Done":1==e[n].dryPicker.active&&(t.children[2].innerText="Processing"),1==e[n].packer.status?t.children[3].innerText="Done":1==e[n].packer.active&&(t.children[3].innerText="Processing"),t.children[4].innerText=`${e[n].note.length}`,1==e[n].status&&(t.children[5].children[0].disabled=!0,t.children[5].children[0].checked=!0);break}}}(e)}))}()}catch(e){}}));