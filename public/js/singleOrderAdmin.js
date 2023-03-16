$(document).ready(()=>{
    $('#back-btn').on('click', ()=>{
        parent.history.back();
    })
    
    ajaxCall();


    //ajax call
   function ajaxCall(){
        $('#loading').addClass('loading');
        setTimeout(()=>{
            $('#loading').removeClass('loading');
        $.getJSON('singleOrder.json', (data)=>{        
            firstName=data.billing.first_name;
            lastName=data.billing.last_name;
            orderNumber=data.id;
            cuNumber=data.billing.phone

            $('#customer-name').text(`${data.billing.first_name} ${data.billing.last_name}`);
            $('#order-id').text(`Order No: ${data.id}`);
            $('#order-status').text(`Status: ${data.status}`); 
            mydata=data.line_items;
            reOrder(mydata);
        });
            console.log("done populating")
        }, 3000);
     }
    
    //populaet data to table
    function reOrder(data){
        console.log(data)
        let table=document.querySelector("#myTable");
        for (let i=0; i<data.length; i++){
           cutLen=data[i].meta_data.length; //product meta details eg wight, cut size et.c
           let metaValue=data[i].meta_data;
           let metaValuTwo=data[i].meta_data;


           //determine weight
            if (cutLen==0 || data[i].meta_data[0].display_key=="_reduced_stock" || data[i].meta_data[0].key=="quantity" || data[i].meta_data[0].key=="cut-size"){
             metaValue="-";
            }

            else if (cutLen>0 || data[i].meta_data[0].key=="weight"  ){
                // cutVlaue=data[i].meta_data[0].value
                metaValue=metaValue[0].value;
            }



            //determin cut size
            if (cutLen==0 ){
                metaValuTwo="-";
               }
   
               else if (cutLen==1 || data[i].meta_data[1].display_key=="_reduced_stock"){
                metaValuTwo="-";
               }

                else if (cutLen==2 || data[i].meta_data[1].display_key=="cut-size"){
                    // metaValuTwo=data[i].meta_data[0].key
                    metaValuTwo = metaValuTwo[1].value;
                }

            // else if (cutLen>0 && data[i].meta_data[0].display_key=="_reduced_stock"){
            //     metaValue="-";
            // }

            let row = `<tr>
                 <td> ${i +1 } </td>
                 <td><img src="${data[i].image.src}" style="width:60px; height:60px"</img> </td>
                <td>${data[i].name} </td>
                <td style="font-weight:600; background-color:#ff0000; color:#ffff">${metaValue}</td>
                <td id=qtyBox style="font-weight:600; background-color:#00ff00;">${data[i].quantity}</td>
                <td style="font-weight:600; background-color:#0000ff; color:#ffff">${metaValuTwo}</td>
                <td>-</td>
           </tr>`
                // console.log($('#con').val());
            // cutLen=0;
            table.innerHTML += row;
        }
    }

});
