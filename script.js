"use strict";

const tarea = document.getElementById('tarea');
const resultTextarea = document.getElementById('result');
const modeKeyInput = document.getElementById('modeKey');
const likePercentSelect = document.getElementById('likePercent');
const toggleInBtn = document.getElementById('toggleInBracketsBtn');
const modeSelect = document.getElementById('mode');
let eventType = '';
let doSort = false;
let sortAsc;
let inputType = 'none';
let inBrackets = true;
let doNewlines = false;
let mode = 'in';
let trimSpecialCharacters = false;
let likePercent = 'right';
let operator = '';
let delimiter = '';

createSortButtonEvent();
createCopySourceButtonEvent();
createCopyResultButtonEvent();
createToggleQuotesButtonEvent();
createTrimSpecialCharactersEvent();
createToggleInBracketsButtonEvent();
createListenerCreateColumngStringDelayed();
createListenerCreateModifiedStringDelayed();
createListenerMultiline();
createListenerMode();
createListenerModeKey();
createListenerLikePercent()

function createModifiedString(){
    const startTime = new Date().getTime();
    let resultString = '';
    let key = '';
    let leftPercent = '';
    let rightPercent = '';
    const tareaValue = tarea.value;
    let tareaArray = tareaValue.split('\n'); 
    tareaArray = tareaArray.filter(String);
    tareaArray = [...new Set(tareaArray)];
    if(inputType === 'none' && tareaArray.length !== 0){
        inputType = getInputType(tareaArray[0]);
    }
    switch (mode) {
        case 'or':
            operator = ' = ';
            delimiter = ' OR ';
            break;
        case 'in':
            delimiter = ',';
            break;
        case 'like':
            operator = ' LIKE ';
            delimiter = ' OR ';
            break;
        case 'pipe':
            operator = '';
            delimiter = ' | ';
            break;
    }
    if(['or','like'].includes(mode)){
        if(modeKeyInput.value.length === 0) {
            key = '';
        }
        else {
            key = modeKeyInput.value + operator; 
        }
        if(mode === 'like'){
            switch (likePercent){
                case 'right':
                    rightPercent = '%';
                    break;
                case 'both':
                    leftPercent = rightPercent = '%';
                    break;
                case 'left':
                    leftPercent = '%';
                    break;
            }
        }
    }   
    if(doSort){
        const compareFunctionPlain = inputType === 'string' ? compareStringsPlain : compareNumbersPlain;
        const compareFunction = inputType === 'string' ? compareStrings : compareNumbers;
        if(typeof sortAsc !== "boolean") sortAsc = compareFunctionPlain(tareaArray[0], tareaArray[1]) > 0 ? true : false;
        tareaArray.sort(compareFunction);
        tarea.value = tareaArray.join("\n");
        doSort = false;
    }
    if(inBrackets && mode === 'in') resultString = 'IN (\n';
    for(let i = 0; i < tareaArray.length; i++){
        tareaArray[i] = tareaArray[i].trim();
        if(trimSpecialCharacters){
            tareaArray[i] = tareaArray[i].replace(/^\W+/g,"");
            tareaArray[i] = tareaArray[i].replace(/\W+$/g,"");
        }
        if(inputType === 'digits' && mode !== 'like'){
            resultString += (key + tareaArray[i] + delimiter);
        } else {
            resultString += (key + '\'' + leftPercent + tareaArray[i] + rightPercent + '\'' + delimiter);
        }
        if(doNewlines) resultString += "\n";
    }
    resultString = resultString.slice(0, doNewlines ? -2 : -1);
    resultString = resultString.rtrim(delimiter);
    if(inBrackets && mode == 'in') resultString += '\n)';
    resultTextarea.value = resultString;
    setItemCount(tareaArray.length);
    if(eventType === 'paste') resultTextarea.select();
    console.log((new Date().getTime() - startTime) + " msec");
}

function createColumnString(){
    let columnString = '';
    let resultDiv = resultTextarea.value;
    let resultArray;
    let singleEntryArray;
    resultDiv = resultDiv.trim();
    mode = tryDetectMode(resultDiv);    
    if(mode === 'in'){
        if(resultDiv.indexOf(',') === -1) return false;
        resultDiv = resultDiv.replace(/^IN.*\(/,"");
        resultDiv = resultDiv.replace(/\)$/,"");
        resultArray = resultDiv.split(',');
        for(let i = 0; i < resultArray.length; i++){
            resultArray[i] = resultArray[i].trim();
            resultArray[i] = trimQuotes(resultArray[i]);
            columnString += (resultArray[i] + '\n');
        }
        columnString = columnString.replace(/\n$/,"");
    } else if (mode === 'or' || mode === 'like'){
        if(resultDiv.toLowerCase().indexOf(mode) === -1) return false;
        resultArray = resultDiv.split(/or/i);
        if (mode === 'or'){
            singleEntryArray = resultArray[0].split('=');
            if(singleEntryArray.length === 1){
                singleEntryArray[0] = '';
            }
            for(let i = 0; i < resultArray.length; i++){
                resultArray[i] = resultArray[i].replace(/^.*?=/m,"");
                resultArray[i] = resultArray[i].trim();
                resultArray[i] = trimQuotes(resultArray[i]);
                columnString += (resultArray[i] + '\n');
            }
            columnString = columnString.replace(/\n$/,"");
        } else if (mode === 'like'){
            document.getElementById('likePercentDiv').style.display = 'block';
            singleEntryArray = resultArray[0].split(' ');
            for(let i = 0; i < resultArray.length; i++){ 
                resultArray[i] = resultArray[i].replace(/^.*?LIKE/mi,"");
                resultArray[i] = resultArray[i].trim();
                resultArray[i] = resultArray[i].ftrim('\'');
                resultArray[i] = resultArray[i].ftrim('%');
                resultArray[i] = trimQuotes(resultArray[i]);
                columnString += (resultArray[i] + '\n');
            }
        }
        modeKeyInput.value = singleEntryArray[0].trim();
        document.getElementById('modeKeyDiv').style.display = 'block';
        columnString = columnString.replace(/\n$/,"");
    } else if (mode === 'pipe'){
        if(resultDiv.toLowerCase().indexOf('|') === -1) return false;
        resultArray = resultDiv.split('|');
        for(let i = 0; i < resultArray.length; i++){
            resultArray[i] = resultArray[i].trim();
            resultArray[i] = trimQuotes(resultArray[i]);
            columnString += (resultArray[i] + '\n');
        }
        columnString = columnString.replace(/\n$/,"");
    }
    setItemCount(resultArray.length);
    tarea.value = columnString;
    tarea.select();
}

function tryDetectMode(string){
    let mode = 'in';
    let newIndex = 0;
    if(/^.* like .*$/i.test(string)) {
        mode = 'like';
        newIndex = 2;
    } else if(/^.* or .*$/i.test(string)) {
        mode = 'or';
        newIndex = 1;
    } else if(/^.*\|.*$/.test(string)){
        mode = 'pipe';
        newIndex = 3;
    }
    modeSelect.selectedIndex = newIndex;
    return mode;
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
    const togglebtn = document.getElementById('toggleQuotesBtn');
    togglebtn.addEventListener('click', function() {
        inputType = inputType === 'digits' ? 'string' : 'digits';
        createModifiedString();
    });
}

function createTrimSpecialCharactersEvent(){
    const toggleTrimSpecialCharacters = document.getElementById('trimSpecialCharacters');
    toggleTrimSpecialCharacters.addEventListener('click', function() {
        trimSpecialCharacters = trimSpecialCharacters === true ? false : true;
        createModifiedString();
    });
}

function createToggleInBracketsButtonEvent(){
    toggleInBtn.addEventListener('click', function() {
        inBrackets = inBrackets === true ? false : true;
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
    resultTextarea.addEventListener("paste", createColumnStringDelayed);
    resultTextarea.addEventListener("keyup", function(e){
        if (e.keyCode == 13) {
            createColumnStringDelayed();
        }
    });
}

function createListenerCreateModifiedStringDelayed(){
    tarea.addEventListener("paste", function(e){
        eventType = e.type;
        createModifiedStringDelayed();
        setTimeout(function() {
            eventType = '';
        }, 150);
        
    });
    tarea.addEventListener("keyup", function(e){
        if (e.keyCode == 13) {
            createModifiedStringDelayed();
        }
    });
}

function createListenerMultiline(){
    const toggleLines = document.getElementById('doMultiline');
    toggleLines.addEventListener("click", function(){
        doNewlines = doNewlines === true ? false : true;
        createModifiedStringDelayed();
    });
}

function createListenerMode(){
    modeSelect.addEventListener("change", function(){
        mode = this.value;
        toggleInBtn.style.display = mode === 'in' ? 'block' : 'none' ;
        document.getElementById('modeKeyDiv').style.display = (['in','pipe'].includes(mode))? 'none' : 'block'; 
        document.getElementById('likePercentDiv').style.display = 'like' === mode ? 'block' : 'none'; 
        document.getElementById('toggleQuotesBtn').style.display = 'like' === mode ? 'none' : 'block'; 
        createModifiedStringDelayed();
    });
}

function createListenerModeKey(){
    modeKeyInput.addEventListener("keyup", function(){
        createModifiedStringDelayed();
    });
    modeKeyInput.addEventListener("paste", function(){
        createModifiedStringDelayed();
    });
}

function createListenerLikePercent(){
    likePercentSelect.addEventListener("change", function(){
        likePercent = this.value;
        createModifiedStringDelayed();
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

const setItemCount = (n) => {
    document.getElementById('itemCount').innerHTML = `Count: ${n}`;
}

function trimQuotes(str){
    let trimedStr = str.ftrim('\'');
    return trimedStr.ftrim('"');
}

String.prototype.rtrim = function (s) {
    if (s == undefined)
        return this;
    return this.replace(new RegExp("[" + s + "]*$"), '');
};

String.prototype.ftrim = function (s) {
    if (s == undefined)
        return this;
    let str = this.replace(new RegExp(s + "$"), '');
    return str.replace(new RegExp("^" + s), '');
};
