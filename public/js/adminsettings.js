$(document).ready(()=>{

let fromDateValue, toDateValue, quantityValue;

    $('#saveSetting').on('click', ()=> {

            fromDateValue=$('#fromDate').val();
            toDateValue=$('#toDate').val();
            quantityValue=$('#qtyVal').val();
            let dataSet={
                fromDate:fromDateValue,
                toDate:toDateValue,
                orderQty:quantityValue
            }
        console.log(dataSet);
        if(dataSet.fromDate=="" || dataSet.toDate=="" || dataSet.orderQty=="" ){
        }else{
            fetch('/adminSettingData', {
                method: "POST", // or 'PUT'
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(dataSet),
            });
        }
        window.location.href='/logout'
    });
});