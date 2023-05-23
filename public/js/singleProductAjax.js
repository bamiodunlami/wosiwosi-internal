$(document).ready(()=>{
    let firstName, lastName, orderNumber, position, name, note, cutterStatus, pickerStatus, packerStatus, freezerNo, cuNumber ;
    const date=new Date();
    ajaxCall();
    ajaxCallUser();

    //user population with Ajax
    function ajaxCallUser(){
        $.getJSON('currentUser.json', (data)=>{
            position=data.position;
            name=data.name;
            $('#userName').text(`${data.position} : ${data.name}`);
            if(position=="Cutter"){
                cutterStatus="1";
            } else if (position=='Picker'){
                pickerStatus="1"
            }else if (position=="Packer"){
                packerStatus="1"
            }
        })
    }


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
            // console.log("done populating")
        }, 5000);
     }
    
    //populaet data to table
    function reOrder(data){
        // console.log(data)
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
                 <td class="sn"> ${i +1 } </td>
                 <td><img src="${data[i].image.src}" style="width:50px; height:50px"</img> </td>
                <td>${data[i].name} </td>
                <td style="font-weight:600; background-color:#ff0000; color:#ffff">${metaValue}</td>
                <td id=qtyBox style="font-weight:600; background-color:#00ff00;">${data[i].quantity}</td>
                <td style="font-weight:600; background-color:#0000ff; color:#ffff">${metaValuTwo}</td>
                <td class="loc">-</td>
                <td><input type="number" class="con" id="con"  min="0" placeholder="0"></td>
           </tr>`
                // console.log($('#con').val());
            // cutLen=0;
            table.innerHTML += row;
        }

        //confirm itme quantity before submit
        $('#btn-comp').on('click', ()=>{
            let confBox=$('input#con');
            let qtyField= $('td#qtyBox');
            let j=0 //use this for flagging
            for (let x=0; x<confBox.length; x++){
            let conVal=$($(confBox)[x]).val();
            let qtyVal =$($(qtyField)[x]).text();

            //  if(conVal !=qtyVal && position!="Cutter"){
                if(position=="Picker"){
                alert(`Quantity in row ${x+1} not confirmed`)
                // cutterIdentify=0;
                // break;
              } else {
                note=$('textarea#text-area').val();
                freezerNo=$('#freezerNumber').val();
                $('#btn-comp').prop("disabled", true);
                $('#con-btn').prop('disabled', false)
              }
            }
        });

            //complete operation
            $('#con-btn').on('click', ()=>{
                const dataSend = { username: `${firstName} ${lastName}`,
                                orderNumber: `${orderNumber}`,
                                phone:cuNumber,
                                Position:`${position}`,
                                DoneBy:`${name}`,
                                date:`${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
                                note:note,
                                freezerNumber: freezerNo,
                                cutterStatus:cutterStatus,
                                pickerStatus:pickerStatus,
                                packerStatus:packerStatus
                                };
    
                fetch("/complete", {
                    method: "POST", // or 'PUT'
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataSend),
                });

                // window.history.go(-1);
                window.location.href='/'
                    // .then((response) => response.json())
                    // .then((data) => {
                    // console.log("Success:", data);
                    // })
                    // .catch((error) => {
                    // console.error("Error:", error);
                    // });

            });
            
            checkDoneOrders();
    }
    
       //check if already done and mark done
       function checkDoneOrders(){
        $.getJSON('/activity.json', (response)=> {          
            for(let x=0; x<response.length; x++){            
                let doneOrder=response[x].orderNumber;
                // console.log(`${doneOrder} is done`)
                            //checkbox cutter
                            if (orderNumber==doneOrder){
                                $('#freezerNumber').val(response[x].freezerNumber);
                                console.log(Number(response[x].freezerNumber));
                                if (Number(response[x].freezerNumber)>=0){
                                    console.log("This order is done");
                                  $('#freezerNumber').prop('disabled', true)
                                }
                             } else {}
            }
        });
  
      }


});
