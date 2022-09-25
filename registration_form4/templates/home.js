// function selectHeaderToSort(){
//     const H = document.getElementById("s.no");
//     H.fir
// }

// document.querySelector("table");

// document.getElementById("s.no.").addEventListener("click",alert("s.no. clicked"));
let tableHead = document.getElementsByTagName("thead")[0];

tableHead.addEventListener("click", function(){
  httpRequest = (url, method = 'GET') => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = () => {
        if (xhr.status === 200) { resolve(xhr.responseText); }
        else { reject(new Error(xhr.responseText)); }
      };
      xhr.send();
    });}
});