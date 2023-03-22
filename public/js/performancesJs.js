$(document).ready(()=>{   

    $("#logout").click(() => {
        window.location.href = "/logout";
      });

    ajaxCallTwo();

        //competed order more details (details of who did the order)
        function ajaxCallTwo(){
            function todo(){
              $.getJSON('performance.json', (completList)=>{
              completeOrder=completList;
              buildDataTwo(completList);
              
              });
              }
              todo();
              setInterval(() => {                
              $('#tbody').empty();
              todo();
              }, 20000);             
          }

          function buildDataTwo(data2){
            console.log(data2);
          let table=document.querySelector("#tbody");
          for (let i=0; i<data2.length; i++){
          let row = `<tr>
     
          <td>${data2[i].nameOfStaff}</td>
          <td>${data2[i].rollOfStaff}</td>
          <td>${data2[i].theDate}</td>
          <td>-</td>
          <td>${data2[i].activity}</td>     
          <td>${data2[i].orderNumber}</td>
          </tr>`
          table.innerHTML += row;
          }
          }


            //serch box
            $("#search-filter").on("keyup", function() {
            let value = $(this).val().toLowerCase();
            $("#tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
            });

            

});
