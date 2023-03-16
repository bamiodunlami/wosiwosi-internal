$(document).ready(()=>{
    sortByDateAjax();

    $('#back').on('click', ()=>{
    window.location="/";
    })

    //request all order
    $('.all-order').click(()=>{
    window.location.href="/orderlist";
    });

    //request all order
    $('.completed-orders').click(()=>{
    window.location.href="/adminCompletedOrder";
    });

    //Admin settings get requrest
    $('.settings').on('click', function(){
    window.location.href='/settings'
    });

            myOrder=[];
            ajaxCall();
            ajaxCallTwo();
            $('#logout').click(()=>{
                window.location.href="/logout"
            });
        
            let counter=0; //counter for filter
        
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
                function ajaxCall(){
                $.getJSON("products.json", (list)=>{
                    myOrder=list;
                    counter=25;
                    buildData(myOrder);                
                });

                $('#btn-filter').on("click", ()=>{
                    let amountFilter=Number($('input#filter').val());
                    console.log(`here is me ${amountFilter}`);
                    counter=amountFilter;
                    $("#myTable").empty();
                    buildData(myOrder);
                });
                 }       
        
               function buildData(data){
                   let table=document.querySelector("#myTable");
                        $('#orderUnit').text(counter);
                   for (let i=counter; i>=0; i--){
                       let row = `<tr id="trow">
                           <td>${data[i].id}</td>
                           <td>${data[i].billing.first_name} ${data[i].billing.last_name}</td>
                           <td>${data[i].billing.phone}</td>
                           <td>${data[i].date_completed.slice(0,10)}</td>
                           <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>
                           <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>
                           <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>                          
                      </tr>`
        
                       table.innerHTML += row;

                       numbersOfTr = $("tr#trow");
                       let valueOfSelectedRow, matching;
                     //   if you click on any tr, ajax will fetch
                       //for (let i = 0; i < numbersOfTr.length; i++) {
                           //valueOfSelectedRow=$(numbersOfTr[i]).children()[1].innerText;
                 
                            //  //fetch and sychornise data background
                            //  $.getJSON('activity.json', (data)=>{
                            //      myMatching(data);
                            //  });
                            //  function myMatching(data){
                            //      for (let i=0; i<data.length; i++){
                            //          //find object with this specific property
                            //          for(let prop in data[i]){
                            //              //match the property and print
                            //              if(data[i][prop].includes(valueOfSelectedRow)){
                            //                   matching=data[i].orderNumber;
                            //                      //check box if cutter already worked on the order
                            //                   if(valueOfSelectedRow===matching && data[i].Position=='Cutter' && data[i].cutterStatus=='1'){
                            //                    $(numbersOfTr[i]).children()[4].children[0].checked=true;
                            //                   } 
                            //                   //check box if picker already work on the order
                            //                   if(valueOfSelectedRow===matching && data[i].Position=='Picker' && data[i].pickerStatus=='1'){
                            //                      $(numbersOfTr[i]).children()[5].children[0].checked=true;
                            //                      }
                 
                            //                      //check box if picker already work on the order
                            //                   if(valueOfSelectedRow===matching && data[i].Position=='Packer' && data[i].packerStatus=='1'){
                            //                      $(numbersOfTr[i]).children()[6].children[0].checked=true;
                            //                      }
                            //                   break;
                            //              }   
                            //          }break;
                            //      } 
                            //  }
                          //}
                   }
                   checkDoneOrders()
               }

               //competed order more details (details of who did the order)
               function ajaxCallTwo(){
                    $.getJSON('activity.json', (completList)=>{
                        completeOrder=completList;
                        buildDataTwo(completList);
                    });
                 }
                 
                 function buildDataTwo(data2){
                    let table=document.querySelector("#tbody");
                    $('#orderUnit').text(counter);
               for (let i=0; i<data2.length; i++){
                   let row = `<tr>
                        <td>${data2[i].orderNumber}</td>
                       <td>${data2[i].username}</td>
                       <td>${data2[i].phone}</td>
                       <td>${data2[i].DoneBy}</td>
                       <td>${data2[i].date}</td>
                       <td>${data2[i].note}</td>
                       <td>${data2[i].freezerNumber}</td>
                     
                  </tr>`
                   table.innerHTML += row;
               }
                 }

            //search functionality
            $("#search-filter").on("keyup", function(e) {
                let key=$(this).val().toLowerCase()
                $('#myTable tr').filter(function(){
                    $(this).toggle($(this).text().toLowerCase().indexOf(key)>-1)
                });
              });
              
              //for complete order page
              $('#search-filter-two').on('keyup', function(){
                let textValue= $(this).val().toLowerCase();
                $('#tbody tr').filter(function(){
                    $(this).toggle($(this).text().toLowerCase().indexOf(textValue)>-1)
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
            counter = 25; 
            buildData(sortOrder);
            // console.log(sortOrder);
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
        for (let i=0; i<orderTableRow.length; i++){  
        let orderNumberAvailable=$(orderTableRow[i]).children()[0].innerText;
        let cutterCheckBox=  $(orderTableRow[i]).children()[3];
        let pickerCheckBox=  $(orderTableRow[i]).children()[4];
        let packerCheckBox=  $(orderTableRow[i]).children()[5];
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