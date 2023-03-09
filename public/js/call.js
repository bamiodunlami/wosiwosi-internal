$(document).ready(() => {
  ajaxCall();
  sortByDateAjax();
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
    $.getJSON("products.json", (list) => {
      myOrder = list;
      counter = 20; 
      buildData(myOrder);
    });

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
                    <td><a class="customer-id-link" href="/${data[i].id}"> ${data[i].id}</a></td>
                   <td>${data[i].billing.first_name} ${data[i].billing.last_name}</td>
                   <td>${data[i].date_completed.slice(0, 10)}</td>
                   <td><input type="checkbox" id="checkbox-cu" name="status" vlaue="status" disabled ></td>
                   <td><input type="checkbox" id="checkbox-pi" name="status" vlaue="status" disabled ></td>
                   <td><input type="checkbox" id="checkbox-pa" name="status" vlaue="status" disabled ></td>
                  
              </tr>`;

      table.innerHTML += row;

      numbersOfTr = $("tr#trow");
      let valueOfSelectedRow, matching;
    //   if you click on any tr, ajax will fetch
      for (let i = 0; i < numbersOfTr.length; i++) {
          valueOfSelectedRow=$(numbersOfTr[i]).children()[1].innerText;

            //fetch and sychornise data background
            // $.getJSON('activity.json', (data)=>{
            //     myMatching(data);
            // });
            // function myMatching(data){
            //     for (let i=0; i<data.length; i++){
            //         //find object with this specific property
            //         for(let prop in data[i]){
            //             //match the property and print
            //             if(data[i][prop].includes(valueOfSelectedRow)){
            //                  matching=data[i].orderNumber;
            //                     //check box if cutter already worked on the order
            //                  if(valueOfSelectedRow===matching && data[i].Position=='Cutter' && data[i].cutterStatus=='1'){
            //                   $(numbersOfTr[i]).children()[4].children[0].checked=true;
            //                  } 
            //                  //check box if picker already work on the order
            //                  if(valueOfSelectedRow===matching && data[i].Position=='Picker' && data[i].pickerStatus=='1'){
            //                     $(numbersOfTr[i]).children()[5].children[0].checked=true;
            //                     }

            //                     //check box if picker already work on the order
            //                  if(valueOfSelectedRow===matching && data[i].Position=='Packer' && data[i].packerStatus=='1'){
            //                     $(numbersOfTr[i]).children()[6].children[0].checked=true;
            //                     }
            //                  break;
            //             }   
            //         }break;
            //     } 
            // }
         }            console.log(`the value in this col ${i} is ${valueOfSelectedRow}`)
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

});
