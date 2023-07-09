$(document).ready(() => {    
  console.log("Hey bar");
  $.getJSON('activity.json', (response)=> {
 
    $("#logout").click(() => {
      window.location.href = "/logout";
    });


  ajaxCall();

  let counter = 0; //counter for filter
  let myOrder;

  // ajax call for order
  function ajaxCall() {
    $('#loading').addClass('loading');
    setTimeout(() => {
      $('#loading').removeClass('loading');
      $.getJSON("adminsettings.json", (list) => {
        myOrder = list;
        counter = list.length-1; 
        buildData(myOrder);
      });
    }, 500);
  }

  function buildData(data) {
      let table = document.querySelector("#myTable");
      $("#orderUnit").text(counter+1);
      for (let i = counter; i>=0; i--) {
        let row = `<tr id="trow">
                    <td class="customer-id-link" id="ln${i}"><a href="/singleOrder?on=${data[i].id}">${data[i].id}</a></td>
                    <td>${data[i].billing.first_name} ${data[i].billing.last_name}</td>
                    <td>${data[i].date_paid.slice(0, 10).slice(5, 10)}</td>
                    <td><input type="checkbox" id="checkbox-cu" name="status" vlaue="status" disabled ></td>
                    <td><input type="checkbox" id="checkbox-pi" name="status" vlaue="status" disabled ></td>
                    <td><input type="checkbox" id="checkbox-pa" name="status" vlaue="status" disabled ></td>
                    
                </tr>`;
        table.innerHTML += row;
      }

      checkDoneOrders();

      //    function checkActivity(){
      //    let orderTableRow=$('tr#trow')
      //   for (let i=0; i<orderTableRow.length; i++){  
      //   let orderNumberAvailable=$(orderTableRow[i]).children()[0].innerText;
      //   $.getJSON('/performance.json', (response2)=>{
      //     // console.log(response2)
      //     for (let x=0; x<response2.length; x++){
      //       let doneOrder=response2[x].orderNumber;

      //       if (doneOrder===orderNumberAvailable && $('#staffRole').text().slice(0,6)=='Cutter' && response2[x].rollOfStaff=='Cutter' ){ 
      //         $(orderTableRow[i]).off('click');
      //         $(orderTableRow[i]).on('click', ()=>{
      //           alert(`${response2[x].nameOfStaff} is working or left this order`);
      //         });
      //       }

      //       if (doneOrder===orderNumberAvailable && $('#staffRole').text().slice(0,6)=='Picker' && response2[x].rollOfStaff=='Picker' ){ 
      //         $(orderTableRow[i]).off('click');
      //         $(orderTableRow[i]).on('click', ()=>{
      //           alert(`${response2[x].nameOfStaff} is working or left this order`);
      //         });
      //       }

      //       if (doneOrder===orderNumberAvailable && $('#staffRole').text().slice(0,6)=='Packer' && response2[x].rollOfStaff=='Packer' ){ 
      //         $(orderTableRow[i]).off('click');
      //         $(orderTableRow[i]).on('click', ()=>{
      //           alert(`${response2[x].nameOfStaff} is working or left this order`);
      //         });
      //       }

      //     }
      //   });
      // } 
      //   }      
        
      
      // checkActivity();
      //   setInterval(() => {                
      //     checkActivity();
      //     }, 2000);  
  }

  //serch box
    $("#search-filter").on("keyup", function() {
      let value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });

    // async function sortByDateAjax(){
    //   $('#sort-by-date').on('click', function(){
    //     let fromDate=$('#fromDate').val();
    //     let toDate=$('#toDate').val();
    //    let sortDateValue={
    //         from:fromDate,
    //         to:toDate
    //     }
    //     $("#myTable").empty();
    //     $('#loading').addClass('loading')


    //       fetch('/dateSort', {
    //         method: "POST",
    //         headers: {
    //           "Content-Type":"application/json",
    //         },
    //         body: JSON.stringify(sortDateValue),
    //       });

    // setTimeout(() => {
    //     $('#myTable').empty();
    //     $('#loading').removeClass('loading')
    //     $.getJSON("sortProducts.json", (respo) => {
    //       sortOrder = respo;
    //       counter = 25; 
    //       buildData(sortOrder);
    //     });
    
    //     $("#btn-filter").on("click", () => {
    //       let amountFilter = Number($("input#filter").val());
    //       console.log(`here is me ${amountFilter}`);
    //       counter = amountFilter;
    //       $("#myTable").empty();
    //       buildData(sortOrder);
    //       });
    //     }, 20000)

    //  });
    // }

    //check if already done and mark done
    function checkDoneOrders(){
      let orderTableRow=$('tr#trow')
        for (let i=0; i<orderTableRow.length; i++){  
        let orderNumberAvailable=$(orderTableRow[i]).children()[0].innerText;
        let cutterCheckBox=  $(orderTableRow[i]).children()[3];
        let pickerCheckBox=  $(orderTableRow[i]).children()[4];
        let packerCheckBox=  $(orderTableRow[i]).children()[5];
          for (let x=0; x<response.length; x++){
            let doneOrder=response[x].orderNumber;
            // console.log(`${doneOrder} is done`);
            //checkbox cutter
            if (doneOrder===orderNumberAvailable && response[x].Position=="Cutter"){
              $(cutterCheckBox).children().prop('checked', true);
            }

            //checkbox picker
            if (doneOrder===orderNumberAvailable && response[x].Position=="Picker"){
              $(pickerCheckBox).children().prop('checked', true);
            }

             //Packer picker
            if (doneOrder===orderNumberAvailable && response[x].Position=="Packer"){
              $(packerCheckBox).children().prop('checked', true);
              $(orderTableRow[i]).off('click');
              console.log("click function off")
            }

          }   
        } 
    }

  });
});