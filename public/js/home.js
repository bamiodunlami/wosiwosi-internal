$(document).ready(()=>{

    let username=""
    $("#exampleInputUsername").on('keyup', ()=>{
        let username=$("#exampleInputUsername").val().toUpperCase();

    $("#exampleInputUsername").on('mouseout', (keypress)=>{
        username=$("#exampleInputUsername").val().toUpperCase();
    })
    console.log(username)

    switch(username){
                    case "PA" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Partrick");
                    $("#selector").attr("disabled", false);
                    break;

                    case "TA" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Taiwo");
                    $("#selector").attr("disabled", false);
                    break;


                    case "IB" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Ibrahim");
                    $("#selector").attr("disabled", false);
                    break;


                    case "SO" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Solomon");
                    $("#selector").attr("disabled", false);
                    break;

                    case "MA" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Masasa");
                    $("#selector").attr("disabled", false);
                    break;

                    case "LI" :
                    $("#selector").val("Picker");
                    $("#exampleInputUsername").val("Linton");
                    $("#selector").attr("disabled", false);
                    break;

                    case "SU" :
                    $("#selector").val("Cutter");
                    $("#exampleInputUsername").val("Sunny");
                    $("#selector").attr("disabled", false);
                    break;

                    case "ES" :
                    $("#selector").val("Cutter");
                    $("#exampleInputUsername").val("Ester");
                    $("#selector").attr("disabled", false);
                    break;

                    case "AD" :
                        $("#selector").val("Admin");
                        $("#exampleInputUsername").val("admin");
                        $("#selector").attr("disabled", false);
                        break;
            
            default:
                $("#selector").attr("disabled", true);
    }
    
});

});