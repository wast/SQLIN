"use strict";

const tarea = document.getElementById('tarea');
const resultTextarea = document.getElementById('result');
let eventType = '';
let doSort = false;
let sortAsc;

createSortButtonEvent();
createCopySourceButtonEvent();
createCopyResultButtonEvent();
createToggleQuotesButtonEvent();
createTrimSpecialCharactersEvent();
createToggleInBracketsButtonEvent();
createListenerCreateColumngStringDelayed();
createListenerCreateModifiedStringDelayed();

function createModifiedString(type){
    type = type || 'none';
    const startTime = new Date().getTime();
    let resultString = '';
    const tareaValue = tarea.value;
    let tareaArray = tareaValue.split('\n'); 
    tareaArray = tareaArray.filter(String);
    tareaArray = [...new Set(tareaArray)];
    if(type == 'none'){
        type = getInputType(tareaArray[0]);
    }
    if(doSort){
        const compareFunctionPlain = type === 'string' ? compareStringsPlain : compareNumbersPlain;
        const compareFunction = type === 'string' ? compareStrings : compareNumbers;
        if(typeof sortAsc !== "boolean") sortAsc = compareFunctionPlain(tareaArray[0], tareaArray[1]) > 0 ? true : false;
        tareaArray.sort(compareFunction);
        tarea.value = tareaArray.join("\n");
        doSort = false;
    }
    document.getElementById('type').value = type;
    if(inBrackets()) resultString = 'IN (\n';
    for(let i = 0; i < tareaArray.length; i++){
        tareaArray[i] = tareaArray[i].trim();
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
    document.getElementById('itemCount').innerHTML = "Count: " + tareaArray.length;  
    if(eventType === 'paste') resultTextarea.select();
    console.log((new Date().getTime() - startTime) + " msec");
}

function createColumnString(){
    let columnString = '';
    let resultDiv = resultTextarea.value;
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

function createSortButtonEvent(){
    const sortBtn = document.getElementById('sortBtn');
    sortBtn.addEventListener('click', function(){
        doSort = true;
        if(typeof sortAsc === "boolean") sortAsc = sortAsc ? false : true;
        createModifiedString();
    });
}

function createCopyResultButtonEvent(){
    createCopyEventOnButton('#result','#copybtn');
}
function createCopySourceButtonEvent(){
    createCopyEventOnButton('#tarea','#leftcopybtn');
}

function createToggleQuotesButtonEvent(){
    const togglebtn = document.getElementById('togglebtn');
    togglebtn.addEventListener('click', function() {
        const newType = document.getElementById('type').value == 'digits' ? 'string' : 'digits';
        createModifiedString(newType);
    });
}

function createTrimSpecialCharactersEvent(){
    const toggleCheckbox = document.getElementById('trimSpecialCharacters');
    toggleCheckbox.addEventListener('click', function() {
        createModifiedString();
    });
}

function createToggleInBracketsButtonEvent(){
    const togglebtn = document.getElementById('toggleInBracketsBtn');
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

function compareStrings(a, b) {
    a = a.toUpperCase();
    b = b.toUpperCase();
    if (a < b) {
        return sortAsc ? 1 : -1;
    }
    if (a > b) {
        return sortAsc ? -1 : 1;
    }
    return 0;
}

function compareStringsPlain(a, b) {
    a = a.toUpperCase();
    b = b.toUpperCase();
    if (a < b) {
        return  1;
    }
    if (a > b) {
        return -1;
    }
    return 0;
}

function compareNumbers(a, b) {
    return sortAsc ? b - a : a - b;
}

function compareNumbersPlain(a, b) {
    return b - a;
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
