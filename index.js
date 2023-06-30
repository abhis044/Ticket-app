const allFilter=document.querySelectorAll(".filter");

const OpenModal=document.querySelector(".open-modal");

const CloseModal=document.querySelector(".close-modal");

const ticketsContainer=document.querySelector(".tickets-container");

let allFilterClasses=["red","blue","green","yellow","black"];

let myDB=window.localStorage;
let forsameid=false;
let newid="abhishek";

OpenModal.addEventListener("click",openTicketModal);
CloseModal.addEventListener("click",closeTicketModal);

let ticketmodalopen=false;
let isTextTyped=false;

for(let i=0;i<allFilter.length;i++){
    allFilter[i].addEventListener("click",selectfilter);
}
function selectfilter(e){
    if(e.target.classList.contains("active-filter")){
        e.target.classList.remove("active-filter");
        ticketsContainer.innerHTML="";
        loadtickets();
    }
    else {
        if(document.querySelector(".active-filter")){
            document.querySelector(".active-filter").classList.remove("active-filter");
        }
        e.target.classList.add("active-filter");
        ticketsContainer.innerHTML="";
        let filterclicked=e.target.classList[0];
        loadselectedfilter(filterclicked);
    }
}
function loadselectedfilter(filterclicked){
    let allTickets=myDB.getItem("allTickets");
    if(allTickets){
        allTickets=JSON.parse(allTickets);
        for(let i=0;i<allTickets.length;i++){
            let ticketobj=allTickets[i];
            if(ticketobj.ticketFilter==filterclicked){
                appendTicket(ticketobj);
            }
        }
    }
}
function loadtickets(){
    let allTickets=localStorage.getItem("allTickets");
    if(allTickets){
        allTickets=JSON.parse(allTickets);
        for(let i=0;i<allTickets.length;i++){
            let ticketobj=allTickets[i];
            appendTicket(ticketobj);
        }
    }
}
loadtickets();

function openTicketModal(e){
    if(ticketmodalopen) return ;
    let ticketmodal=document.createElement("div");
    ticketmodal.classList.add("ticket-modal");
    ticketmodal.innerHTML=`
    <div class="ticket-text" contenteditable="true">Enter to text</div>
    <div class="ticket-filter">
        <div class="red modal-filter selected-filter"></div>
        <div class="blue modal-filter"></div>
        <div class="green modal-filter"></div>
        <div class="yellow modal-filter"></div>
        <div class="black modal-filter"></div>
    </div>
    `
    document.querySelector("body").append(ticketmodal);
    ticketmodalopen=true;
    isTextTyped=true;

    let tickettextDiv=ticketmodal.querySelector(".ticket-text");
    tickettextDiv.addEventListener("keypress",handleKeyPress);

    let ticketFilters=ticketmodal.querySelectorAll(".modal-filter");
    for(let i=0;i<ticketFilters.length;i++){
        ticketFilters[i].addEventListener("click",function(e){
            if(e.target.classList.contains("selected-filter")) return;
            document.querySelector(".selected-filter").classList.remove("selected-filter");
            e.target.classList.add("selected-filter");
        })
    }

}

function closeTicketModal(e){
    if(ticketmodalopen){
        document.querySelector(".ticket-modal").remove();
        ticketmodalopen=false;
    }     
}
function handleKeyPress(e){
    if(e.key=="Enter" && isTextTyped && e.target.textContent){
        let filterSelected=document.querySelector(".selected-filter").classList[0];
        let ticketId="abhishek"
        if(forsameid) ticketId=newid;
       else  ticketId=uuid();
        let ticketInfoObject={
            ticketFilter:filterSelected,
            ticketvalue:e.target.textContent,
            ticketId:ticketId,
        }
        if(!forsameid)appendTicket(ticketInfoObject);
        else editTicket(ticketInfoObject);
        CloseModal.click();
        saveTicketToDb(ticketInfoObject);
    }
}
function saveTicketToDb(ticketInfoObject){
    let allTickets=myDB.getItem("allTickets");
    if(!forsameid){
        if(allTickets){
            allTickets=JSON.parse(allTickets);
            allTickets.push(ticketInfoObject);
            myDB.setItem("allTickets",JSON.stringify(allTickets));
        }
        else{
            let allTickets=[ticketInfoObject];
            myDB.setItem("allTickets",JSON.stringify(allTickets));
    
        }
    }
}
function appendTicket(ticketInfoObject){
    let {ticketFilter,ticketvalue,ticketId}=ticketInfoObject;
    let ticketdiv=document.createElement("div");
    ticketdiv.classList.add("ticket");
    ticketdiv.innerHTML=`
    <div class="ticket-header ${ticketFilter}"></div>
           <div class="ticket-content">
            <div class="ticket-info">
                <div>${ticketId}</div>
                <div class="ticket-edit"><i class="fa-solid fa-plus" style="color: green;"></i></div>
                <div class="ticket-delete"><i class="fa-solid fa-trash"></i></div>
            </div>
            <div class="ticket-value">${ticketvalue}</div>
           </div>
    `
    let ticketHeader=ticketdiv.querySelector(".ticket-header");
    ticketHeader.addEventListener("click",function(e){
        let currentFilter=e.target.classList[1];
        let indexOfCurrFilter=allFilterClasses.indexOf(currentFilter);
        let newIndex=(indexOfCurrFilter+1)%allFilterClasses.length;
        let newFilter=allFilterClasses[newIndex];
        ticketHeader.classList.remove(currentFilter);
        ticketHeader.classList.add(newFilter);

        let allTickets=JSON.parse(myDB.getItem("allTickets"));
        for(let i=0;i<allTickets.length;i++){
            if(allTickets[i].ticketId==ticketId){
                allTickets[i].ticketFilter=newFilter;
            }
        }
        myDB.setItem("allTickets",JSON.stringify(allTickets));
    })
    let deleteTicketBtn=ticketdiv.querySelector(".ticket-delete");
    
    deleteTicketBtn.addEventListener("click",function(){
        ticketdiv.remove();
        let allTickets=JSON.parse(myDB.getItem("allTickets"));
        const a=allTickets.filter((object)=>{
            return object.ticketId!==ticketId;
        })
        myDB.setItem("allTickets",JSON.stringify(a));

    })
    let editTicketBtn=ticketdiv.querySelector(".ticket-edit");
    editTicketBtn.addEventListener("click",function(){
        // deleteTicketBtn.click();
        OpenModal.click(); 
        let tickettextDiv=document.querySelector(".ticket-text");
        tickettextDiv.textContent=ticketvalue;
        newid=ticketId;
        forsameid=true;
    })
     ticketsContainer.append(ticketdiv);
}
function editTicket(ticketInfoObject){
    let allTickets=JSON.parse(myDB.getItem("allTickets"));
    
    for(let i=0;i<allTickets.length;i++){
        if(allTickets[i].ticketId==ticketInfoObject.ticketId){
          allTickets[i].ticketvalue=ticketInfoObject.ticketvalue;
          allTickets[i].ticketFilter=ticketInfoObject.ticketFilter;

          myDB.setItem("allTickets",JSON.stringify(allTickets));
        }
    }
    location.reload();
}
