var myIframe = document.getElementById("myFrame").contentWindow;
myIframe.document.getElementsByTagName('div')[0].innerHTML = "Write & Earn";
myIframe.document.getElementsByTagName('div')[0].style.color = "red";
/*
for (let i = 0; i < array1.length; i++) {
    var node = document.createTextNode(array1[i]);
    para.appendChild(node);
    }
iframeDiv.appendChild(para);
*/