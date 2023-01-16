let input  = document.getElementById("location").value


document.getElementById("searchbtn").addEventListener("click",makereq)

async function makereq(){
   const data = await fetch("http://localhost:8080/weatherdata",{
    method : "POST",
    body : {
       city : input 
    },
    headers: {
       'content-type' : 'application/json'
    }
   })

   const actual_data = await data.json()
   console.log(actual_data)
}