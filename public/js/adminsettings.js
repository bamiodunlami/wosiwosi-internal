$(document).ready(()=>{
    
    $('#saveSetting').on('click', function(){
       window.location.href='/logout'
      })

sortByDateAjax();

async function sortByDateAjax(){
    $('#filter-by-date').on('click', function(){
    let fromDate=$('#fromDate').val();
    let toDate=$('#toDate').val();
    let toTime1=$('#timer1').val();
    let toTime2=$('#timer2').val();
    let sortDateValue={
    from:fromDate,
    to:toDate,
    timing1:toTime1,
    timing2:toTime2
    }

    $("#myTable").empty();
    $('#loading').addClass('loading')

    fetch('/adminDateSort', {
    method: "POST",
    headers: {
    "Content-Type":"application/json",
    },
    body: JSON.stringify(sortDateValue),
    });

    setTimeout(() => {
    $('#myTable').empty();
    $('#loading').removeClass('loading')
    $.getJSON("adminsettings.json", (respo) => {
    sortOrder = respo;
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


    function buildData(data){
        let table=document.querySelector("#myTable");
       $('#qtyVal').text(data.length);
        for (let i=data.length-1; i>=0; i--){
        let row = `<tr id="trow">
        <td>${data[i].id}</td>
        <td>${data[i].billing.first_name} ${data[i].billing.last_name}</td>
        <td>${data[i].billing.phone}</td>
        <td>${data[i].date_paid.slice(0,10)}</td>
        <td>${data[i].date_paid.slice(11,16)}</td>
        <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>
        <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>
        <td><input type="checkbox" id="checkbox" name="status" vlaue="status" disabled ></td>                          
        </tr>`
        table.innerHTML += row;

        numbersOfTr = $("tr#trow");
        }
        checkDoneOrders()
        }

     //check if already done and mark done
    function checkDoneOrders(){
        $.getJSON('/activity.json', (response)=> {
        let orderTableRow=$('tr#trow')
          for (let i=0; i<orderTableRow.length; i++){  
          let orderNumberAvailable=$(orderTableRow[i]).children()[0].innerText;
          let cutterCheckBox=  $(orderTableRow[i]).children()[4];
          let pickerCheckBox=  $(orderTableRow[i]).children()[5];
          let packerCheckBox=  $(orderTableRow[i]).children()[6];
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


//  if(dataSet.fromDate=="" || dataSet.toDate=="" || dataSet.orderQty=="" ){
//         }else{
//             fetch('/adminSettingData', {
//                 method: "POST", // or 'PUT'
//                 headers: {
//                 "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(dataSet),
//             });
//         }
//         window.location.href='/logout'