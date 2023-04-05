

$(document).ready(()=>{
  
$.getJSON('performance.json', (response)=>{
console.log(response);
$('#json-edit').val(JSON.stringify(response))
});

$('#save-btn').on('click', ()=>{
    let newPerformance= $('#json-edit').val();
      fetch('/savemycontrol', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
        },
        body: newPerformance

      });        
      alert('performce sent');
});

});