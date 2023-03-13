$(document).ready(() => {
  ajaxCall();
  sortByDateAjax();
  checkDoneOrders();
  // searchOrder();
  $("#logout").click(() => {
    window.location.href = "/logout";
  });
  let counter = 0; //counter for filter
  let myOrder;

  // using ajax
  // $.ajax(
  //     {
  //         url:"products.json",
  //         type:"GET",
  //         dataType:'json',
  //         success: function(list){
  //         myOrder=list;
  //         buildData(myOrder);
  //         console.log(myOrder);
  //         document.querySelector("#ren").innerHTML=list[0].billing.first_name;

  //         }
  //     }
  // );

  // ajax call for order
  function ajaxCall() {
    // $('#loading').addClass('loading');
    // setTimeout(()=>{
    //  $('#loading').removeClass('loading');
    $.getJSON("products.json", (list) => {
      myOrder = list;
      counter = 100; 
      buildData(myOrder);
    });
  // }, 1000);


    $("#btn-filter").on("click", () => {
      let amountFilter = Number($("input#filter").val());
      console.log(`here is me ${amountFilter}`);
      counter = amountFilter;
      $("#myTable").empty();
      buildData(myOrder);
    });
  }

  // //ajax for sort order
  // function ajaxCall2() {
  //   $.getJSON("sortProducts.json", (respo) => {
  //     sortOrder = respo;
  //     counter = 5; 
  //     buildData(sortOrder);
  //   });

  //   $("#btn-filter").on("click", () => {
  //     let amountFilter = Number($("input#filter").val());
  //     console.log(`here is me ${amountFilter}`);
  //     counter = amountFilter;
  //     $("#myTable").empty();
  //     buildData(sortOrder);
  //   });
  // }

  function buildData(data) {
    // console.log(data)
      let table = document.querySelector("#myTable");
      $("#orderUnit").text(counter);
      for (let i = 0; i < counter; i++) {
        let row = `<tr id="trow">
                      <td> ${i + 1} </td>
                      <td class="customer-id-link" id="ln${i}"> ${data[i].id}</a></td>
                    <td>${data[i].billing.first_name} ${data[i].billing.last_name}</td>
                    <td>${data[i].date_completed.slice(0, 10)}</td>
                    <td><input type="checkbox" id="checkbox-cu" name="status" vlaue="status" disabled ></td>
                    <td><input type="checkbox" id="checkbox-pi" name="status" vlaue="status" disabled ></td>
                    <td><input type="checkbox" id="checkbox-pa" name="status" vlaue="status" disabled ></td>
                    
                </tr>`;

        table.innerHTML += row;
      }

        //Single order click, fetch and reroute
      let rowNumber= $("tr#trow")
      //capture row clicked
      for (let i=0; i<rowNumber.length; i++){
        $(rowNumber[i]).on('click', function(){
          orderNumberSelected=$(rowNumber[i]).children()[1].innerText;
          console.log(orderNumberSelected)
          let orderSelected={
            orderNumber: orderNumberSelected,
          }
          //send the order number in json formart
          fetch('/getSingleOrder', {
            method:"POST",
            headers: {
              "Content-Type": "application/json",
            },
            body:JSON.stringify(orderSelected)
          });

          window.location.href="/singleOrderPage" //redirect to single order page
        });
      } 
    }

  //serch box
    $("#search-filter").on("keyup", function() {
      let value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });

    //function to catch the date set for filtering
    async function sortByDateAjax(){
      $('#sort-by-date').on('click', function(){
        let fromDate=$('#fromDate').val();
        let toDate=$('#toDate').val();
       let sortDateValue={
            from:fromDate,
            to:toDate
        }
        $("#myTable").empty();
        $('#loading').addClass('loading')


          fetch('/dateSort', {
            method: "POST",
            headers: {
              "Content-Type":"application/json",
            },
            body: JSON.stringify(sortDateValue),
          });

    setTimeout(() => {
        $('#myTable').empty();
        $('#loading').removeClass('loading')
        $.getJSON("sortProducts.json", (respo) => {
          sortOrder = respo;
          counter = 20; 
          buildData(sortOrder);
        });
    
        $("#btn-filter").on("click", () => {
          let amountFilter = Number($("input#filter").val());
          console.log(`here is me ${amountFilter}`);
          counter = amountFilter;
          $("#myTable").empty();
          buildData(sortOrder);
          });
        }, 20000)

     });
    }

    //check if already done and mark done
    function checkDoneOrders(){
      $.getJSON('/activity.json', (response)=> {
      let orderTableRow=$('tr#trow')
      console.log(orderTableRow)
        for (let i=0; i<orderTableRow.length; i++){  
        let orderNumberAvailable=$(orderTableRow[i]).children()[1].innerText;
        let cutterCheckBox=  $(orderTableRow[i]).children()[4]
        let pickerCheckBox=  $(orderTableRow[i]).children()[5]
        let packerCheckBox=  $(orderTableRow[i]).children()[6]
          for (let x=0; x<response.length; x++){
            let doneOrder=response[x].orderNumber;
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
            }

          }   
        } 
      });

    }


});
