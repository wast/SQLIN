"use strict";

createCopyResultButtonEvent();
createCopySourceButtonEvent();
createToggleQuotesButtonEvent();
createTrimSpecialCharactersEvent();
createToggleInBracketsButtonEvent();
createListenerCreateColumngStringDelayed();
createListenerCreateModifiedStringDelayed();

let eventType = '';

function createModifiedString(type){
    let itemCount = 0;
    let resultString = '';
    type = type || 'none';
    const tareaValue = document.getElementById('tarea').value;
    let resultTextarea = document.getElementById('result');
    let tareaArray = tareaValue.split('\n'); 
    tareaArray = [...new Set(tareaArray)];
    if(type == 'none'){
        type = getInputType(tareaArray[0]);
    }
    document.getElementById('type').value = type;
    if(inBrackets()) resultString = 'IN (\n';
    for(let i = 0; i < tareaArray.length; i++){
        tareaArray[i] = tareaArray[i].trim();
        if(tareaArray[i] == '') continue;
        itemCount++;
        if(trimSpecialCharacters()){
            tareaArray[i] = tareaArray[i].replace(/^\W+/g,"");
            tareaArray[i] = tareaArray[i].replace(/\W+$/g,"");
        }
        if(type == 'digits'){
            resultString += (tareaArray[i] + ',');
        } else {
            resultString += ('\'' + tareaArray[i] + '\'' + ',');
        }
    }
    resultString = resultString.slice(0, -1);
    if(inBrackets()) resultString += '\n)';
    resultTextarea.value = resultString;
    document.getElementById('itemCount').innerHTML = "Count: " + itemCount;  
    if(eventType === 'paste') resultTextarea.select();
}

function createModifiedStringDelayed(){
    setTimeout(function() {
        createModifiedString();
    }, 100);
}

function createColumnStringDelayed(){
    setTimeout(function() {
        createColumnString();
    }, 100);
}

function createColumnString(){
    let columnString = '';
    const tarea = document.getElementById('tarea');
    let resultDiv = document.getElementById('result').value;
    if(resultDiv.indexOf(',') === -1) return false;
    resultDiv = resultDiv.trim();
    resultDiv = resultDiv.replace(/^IN.*\(/,"");
    resultDiv = resultDiv.replace(/\)$/,"");
    let resultArray = resultDiv.split(',');
    document.getElementById('itemCount').innerHTML = "Count: " + resultArray.length;
    for(let i = 0; i < resultArray.length; i++){
        resultArray[i] = resultArray[i].trim();
        resultArray[i] = resultArray[i].replace(/^\'/,"");
        resultArray[i] = resultArray[i].replace(/\'$/,"");
        columnString += (resultArray[i] + '\n');
    }
    columnString = columnString.replace(/\n$/,"");
    tarea.value = columnString;
    tarea.select();
}

function createCopyResultButtonEvent(){
    createCopyEventOnButton('#result','#copybtn');
}
function createCopySourceButtonEvent(){
    createCopyEventOnButton('#tarea','#leftcopybtn');
}

function createToggleQuotesButtonEvent(){
    let togglebtn = document.querySelector('#togglebtn');
    togglebtn.addEventListener('click', function() {
        const newType = document.getElementById('type').value == 'digits' ? 'string' : 'digits';
        createModifiedString(newType);
    });
}

function createTrimSpecialCharactersEvent(){
    let toggleCheckbox = document.querySelector('#trimSpecialCharacters');
    toggleCheckbox.addEventListener('click', function() {
        createModifiedString();
    });
}

function createToggleInBracketsButtonEvent(){
    let togglebtn = document.querySelector('#toggleInBracketsBtn');
    togglebtn.addEventListener('click', function() {
        let inBrackets = document.getElementById('inBrackets').value;
        document.getElementById('inBrackets').value = (inBrackets == 'yes') ? 'no' : 'yes';
        createModifiedString();
    });
}

function createCopyEventOnButton(textareaSelector,btnSelector){
    let copyTextarea = document.querySelector(textareaSelector);
    let copyTextareaBtn = document.querySelector(btnSelector);
    copyTextareaBtn.addEventListener('click', function() {
        doCopy(copyTextarea,copyTextareaBtn);
    });
}

function createListenerCreateColumngStringDelayed(){
    const tarea = document.getElementById('result');
    tarea.addEventListener("paste", createColumnStringDelayed);
    tarea.addEventListener("keyup", function(e){
        if (e.keyCode == 13) {
            createColumnStringDelayed();
        }
    });
}

function createListenerCreateModifiedStringDelayed(){
    const tarea = document.getElementById('tarea');
    tarea.addEventListener("paste", function(e){
        eventType = e.type;
        createModifiedStringDelayed();
    });
    tarea.addEventListener("keyup", function(e){
        if (e.keyCode == 13) {
            eventType = '';
            createModifiedStringDelayed();
        }
    });
}

function doCopy(copyTextarea,copyTextareaBtn){
    copyTextarea.select();
    try {
        let successful = document.execCommand('copy');
        if(successful){
            copyTextareaBtn.innerHTML = 'Copied !';
            setTimeout(function(){
                copyTextareaBtn.innerHTML = 'COPY';
            }, 2000);
        }
        console.log('Copying text command');
    } catch (err) {
        console.log('Oops, unable to copy');
        alert('Oops, unable to copy');
    }
}

function getInputType(input){
    return /^\d+$/.test(input) ? 'digits' : 'string';
}

function trimSpecialCharacters(){
    return document.getElementById("trimSpecialCharacters").checked;
}

function inBrackets(){
    return document.getElementById('inBrackets').value == 'yes' ? true : false;
}
