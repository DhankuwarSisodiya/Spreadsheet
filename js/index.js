// declared var for global access of rows and columns
var initRow = 15;
var initCol = 24;
var maxCol = 27;

// creation of obs to listen to every cell
const obs = new rxjs.Subject();
const formulaBar = document.getElementById('spreadsheetName');
// onload of the screen load the table using below function 
window.onload = function load() {
    let spreadSheet = document.getElementById("SpreadSheet");
    let table = document.createElement("table");
    table.setAttribute("id", "table");
    for (let i = 0; i < initRow; i++) {
        let tr = this.document.createElement("tr");
        tr.setAttribute("id", i);
        for (let j = 0; j < initCol; j++) {
            let td = this.document.createElement("td");
            // sets attr for initially loaded cells
            if (i != 0)
                td.setAttribute("id", String.fromCharCode(j + 64) + i);
            else
                td.setAttribute("id", String.fromCharCode(j + 64));
            let text;
            if (i == 0 && j > 0) {
                text = this.document.createTextNode(String.fromCharCode(j + 64));
                // listens for highlight event
                td.addEventListener("click", function() {
                    selectCol(td);
                }, false);
                td.appendChild(text);
            } else if (j == 0 && i > 0) {
                text = this.document.createTextNode(i);
                // listens for highlight event
                td.addEventListener("click", function() {
                    selectRow(tr);
                }, false);
                td.appendChild(text);
            } else if (j == 0 && i == 0) {
                td.setAttribute("contenteditable", "false")
            } else {
                // defines whether the cell is editable or not
                td.setAttribute("contenteditable", "true")
                    // listener to listen to events
                listener(td);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    spreadSheet.appendChild(table);
}

// listener class to listen to events from every cell in the spreadSheet
const listener = (td) => {
    // pipe to listen for every 300s
    // debounce time to emit only the last val
    let expression = "";
    rxjs.fromEvent(td, 'input').pipe(rxjs.operators.debounceTime(300)).subscribe(x => {
        if (td.innerText.startsWith("=Sum(") && td.innerText.endsWith(")")) {
            let getVal = td.innerText.substring(1, td.innerText.length);
            let initalStr = td.innerText.substring(4, td.innerText.length);
            let actualStr = initalStr.substring(1, initalStr.length - 1);
            let arr = [];
            // splits with colon and gets the elements to be processed
            actualStr.split(":").forEach(x => {
                if (x.length > 1)
                    arr.push(x)
            });
            if (arr.length == 2) {
                // function to listen for sum formula
                sum(td, arr);
            }
            let clicks$ = rxjs.fromEvent(td, 'click')
        clicks$.pipe(rxjs.operators.buffer(clicks$.pipe(rxjs.operators.throttleTime(250))),
        // if array is greater than 1, double click occured
        rxjs.operators.filter(clickArray => clickArray.length > 1)
        )
        .subscribe(() => {
            //if (td.getAttribute("isFormula")){
                console.log('Double Click!');
                formulaBar.value = getVal;   
            //}
        });
        } else if (td.innerText.startsWith("=", 0)) {
                let getVal = td.innerText.substring(1, td.innerText.length);
                let operatorIncludes = ['+','-','/','*'];
                let operator = "+";
                td.setAttribute("isFormula", "true");
                operate(td,"",operatorIncludes);
                let clicks$ = rxjs.fromEvent(td, 'click')
        clicks$.pipe(rxjs.operators.buffer(clicks$.pipe(rxjs.operators.throttleTime(250))),
        // if array is greater than 1, double click occured
        rxjs.operators.filter(clickArray => clickArray.length > 1)
        )
        .subscribe(() => {
            //if (td.getAttribute("isFormula")){
                console.log('Double Click!');
                formulaBar.value = getVal;   
            //}
        });
            // block to listen for delete content backward
        } 
        else if (x.inputType == "deleteContentBackward" && td.getAttribute("isFormula") == "true") {
            td.removeAttribute("isFormula");
            td.removeAttribute("type");
        }
        // emits the value based on input
        obs.next(x.target);
    });
}

const sum = (td, arr) => {
    if (arr[0].charAt(0) == arr[1].charAt(0)) {
        let col = arr[0].charAt(0);
        let formula = td.innerText;
        td.setAttribute("isFormula", "true")
            // gets the start and end of the cells
        let start = parseInt(arr[0].substring(1, arr[0].length));
        let end = parseInt(arr[1].substring(1, arr[1].length));
        // incase of add row between formula range
        let rowObserver = rowObs.subscribe(x => {
            if (x < end && x >= start) {
                end = parseInt(end) + 1;
            } else if (x < start) {
                start = parseInt(start) + 1;
                end = parseInt(end) + 1;
            }
        });
        let rowDelObserver = delRowObs.subscribe(x => {
            if (x <= end && x >= start) {
                end = parseInt(end - 1);
            } else if (x < start) {
                start = parseInt(start) - 1;
                end = parseInt(end) - 1;
            }
            for (let i = start; i <= end; i++) {
                let cell = document.getElementById(col + i);
                obs.next(cell);
            }
        });
        let observer = obs.subscribe(x => {
            if (td.getAttribute("isFormula") && start != end) {
                let sum = 0;
                // sum to listen to the cells and add
                for (let i = start; i <= end; i++) {
                    sum = sum + parseInt(document.getElementById(col + i).innerText);
                }
                td.innerText = sum;
            } else {
                observer.unsubscribe();
                rowObserver.unsubscribe();
                rowDelObserver.unsubscribe();
            }
        });
    } else if (arr[0].substring(1, arr[0].length) == arr[1].substring(1, arr[1].length)) {
        td.setAttribute("isFormula", "true");
        let observer = obs.subscribe(x => {
            // checks if its an formula cell
            if (td.getAttribute("isFormula")) {
                let sum = 0;
                let start = parseInt(arr[0].charCodeAt(0));
                let end = parseInt(arr[1].charCodeAt(0));
                let val = arr[0].substring(1, arr[0].length);
                for (let i = start; i <= end; i++) {
                    sum = sum + parseInt(document.getElementById(String.fromCharCode(i) + val).innerText);
                }
                if(isNaN(sum)){
                    console.log("qwertyuio 1");
                    td.innerText = "!ERR";
                    td.removeAttribute("isFormula");
                    td.removeAttribute("type");
                    observer.unsubscribe();
                }
                else{
                    console.log("qwertyuio 2", sum);
                    td.innerText = sum;
                }
            } else { 
                console.log("qwertyuio");
                observer.unsubscribe() }
        });
    } else {
        console.log("invalid");
    }
}

const operate1 = (td,type,arr) => {
    var operands = td.innerText.split(/(?=[-+*\/])/);
    console.log(operands);
    var evalString = "";
    for(let i=0;i<operands.length;i++){
        let val = document.getElementById(operands[i].substring(1, operands[i].length));
        if(val !=null){
            if(operands[i].charAt(0) == '='){
                evalString += document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
            } else if(operands[i].charAt(0) == '+' || operands[i].charAt(0) == '-' || operands[i].charAt(0) == '*' || operands[i].charAt(0) == '/'){
                evalString += operands[i].charAt(0)+ document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
            }

        }
    }

    rxjs.fromEvent(td, 'keyup').pipe(rxjs.operators.debounceTime(300),rxjs.operators.filter((e)=> e.keyCode === 13)).subscribe(x => {
        console.log("eneter pressed", evalString);
        td.innerText = eval(evalString);
    });
}
// operate function to listen to arith funct

const operate = (td, type, arr,expression) => {
    let a = document.getElementById(arr[0]);
    let b = document.getElementById(arr[1]);
    let val = true;
    let rowDelObserverOperate = delRowObs.subscribe(x => {
        // identifies if element is removed
        if (-1 == a.parentElement.rowIndex || -1 == b.parentElement.rowIndex) {
            val = false;
        }
    });
    let observer = obs.subscribe(x => {
        let sum = 0;
        if (val) {
            if (td.getAttribute("isFormula")) {
                var operands = td.innerText.split(/(?=[-+*\/])/);
                var evalString = "";
                for (let i = 0; i < operands.length; i++) {
                    let val = document.getElementById(operands[i].substring(1, operands[i].length));
                    if (val != null) {
                        if (operands[i].charAt(0) == '=') {
                            evalString += document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
                        } else if (operands[i].charAt(0) == '+' || operands[i].charAt(0) == '-' || operands[i].charAt(0) == '*' || operands[i].charAt(0) == '/') {
                            evalString += operands[i].charAt(0) + document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
                        }

                    }
                }
                rxjs.fromEvent(td, 'keyup').pipe(rxjs.operators.debounceTime(300), rxjs.operators.filter((e) => e.keyCode === 13)).subscribe(x => {
                    console.log(evalString, eval(evalString));
                    try{
                        if(isNaN(eval(evalString)) || eval(evalString) == Infinity ){
                            td.innerText = "!ERR";
                            td.removeAttribute("isFormula");
                            td.removeAttribute("type");
                            observer.unsubscribe();
                        }
                        else {
                            console.log(eval(evalString))
                            td.innerText = eval(evalString);
                        }
                    }
                    catch{
                        td.innerText = "!ERR";
                            td.removeAttribute("isFormula");
                            td.removeAttribute("type");
                            observer.unsubscribe();
                    }
                });
                // var operands = td.innerText.split(/(?=[-+*\/])/);
                // var evalString="";
                // let parseDone = false;
                // for(let i=0;i<operands.length;i++){
                //     let val = document.getElementById(operands[i].substring(1, operands[i].length));
                //     if(val !=null){
                //         if(operands[i].charAt(0) == '='){
                //             expression += document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
                //         } else if(operands[i].charAt(0) == '+' || operands[i].charAt(0) == '-' || operands[i].charAt(0) == '*' || operands[i].charAt(0) == '/'){
                //             expression += operands[i].charAt(0)+ document.getElementById(operands[i].substring(1, operands[i].length)).innerText;
                //         }
                //     }
                // }
            }
        } else {
            td.innerText = "!ERR";
            td.removeAttribute("isFormula");
            td.removeAttribute("type");
            observer.unsubscribe();
            rowDelObserverOperate.unsubscribe();
        }
    });
}

// subscribes to the methods of addRow,delrow, addcol, delcol
const addRow = rxjs.fromEvent(document.getElementById("addRow"), 'click');
addRow.subscribe(e => addRowMethod());

const addCol = rxjs.fromEvent(document.getElementById("addCol"), 'click');
addCol.subscribe(e => addColMethod());

const delCol = rxjs.fromEvent(document.getElementById("delCol"), 'click');
delCol.subscribe(e => delColMethod());

const delRow = rxjs.fromEvent(document.getElementById("delRow"), 'click');
delRow.subscribe(e => delRowMethod());

// delrowobs to listen to delete event within formula range
const delRowObs = new rxjs.Subject();

// method to delete a row
const delRowMethod = () => {
    if (selectedRow.size == 1) {
        if (initRow == 2) {
            alert("No more rows can be deleted");
            return;
        }
        let iterator = selectedRow.values();
        let itr = iterator.next().value;
        let ind = itr.rowIndex;
        selectedRow.delete(itr);
        itr.parentElement.removeChild(itr);
        initRow--;
        reArrangeRowNumbers();
        delRowObs.next(ind);
    } else {
        alert("Please select a row to delete")
    }
}

// method to del col
const delColMethod = () => {
    if (selectedCol.size == 1) {
        if (initCol == 2) {
            alert("No more columns can be deleted");
            return;
        }
        let iterator = selectedCol.values();
        let itr = iterator.next().value;
        selectedCol.delete(itr);
        let topEle = document.getElementById(itr);
        topEle.parentElement.removeChild(topEle);

        for (let i = 1; i < initRow; i++) {
            let element = document.getElementById(itr + i);
            element.parentElement.removeChild(element);
        }
        initCol--;
        // rearranges the attrs
        reArrangeRowNumbers();
    } else {
        alert("Please select only one column")
    }
}

const rowObs = new rxjs.Subject();

// method to add new row
const addRowMethod = () => {
    if (selectedRow.size > 1) {
        alert("Please select one row")
    } else if (selectedRow.size == 1) {
        let iterator = selectedRow.values();
        let row = iterator.next().value;
        let index = row.rowIndex;
        let tr = document.createElement("tr");
        // emits the inserted row
        rowObs.next(index);
        tr.setAttribute("id", index + 1);
        for (let j = 0; j < initCol; j++) {
            let td = document.createElement("td");
            if (j == 0) {
                text = this.document.createTextNode(index + 1);
                td.addEventListener("click", function() {
                    selectRow(tr);
                }, false);
                td.appendChild(text);
                td.setAttribute("contenteditable", "false");
            } else {
                td.setAttribute("contenteditable", "true");
                listener(td);
            }
            tr.appendChild(td);
        }
        row.insertAdjacentElement("afterend", tr);
        initRow = initRow + 1;
        reArrangeRowNumbers();
    } else {
        alert("Please select a row");
    }
}

// method to rearrange the cells in the table
const reArrangeRowNumbers = () => {
    let table = document.getElementById("table");
    for (let i = 0; i < initRow; i++) {
        let row = table.rows[i];
        if (i > 0) {
            for (let j = 0; j < initCol; j++) {
                let cell = row.cells[j];
                if (j == 0) {
                    let y = cell.childNodes[0];
                    cell.removeChild(y);
                    text = this.document.createTextNode(i);
                    cell.appendChild(text);
                } else {
                    cell.setAttribute("id", String.fromCharCode(j + 64) + i);
                    if (selectedCol.has(String.fromCharCode(j + 64))) {
                        cell.classList.add("highlight");
                    }
                }
            }
        } else {
            for (let j = 1; j < initCol; j++) {
                let cell = row.cells[j];
                let y = cell.childNodes[0];
                cell.removeChild(y);
                text = this.document.createTextNode(String.fromCharCode(j + 64));
                cell.setAttribute("id", String.fromCharCode(j + 64));
                cell.appendChild(text);
                if (selectedCol.has(String.fromCharCode(j + 64))) {
                    cell.classList.add("highlight");
                }
            }
        }
    }
}

// method to add column 
const addColMethod = () => {
    if (selectedCol.size > 1) {
        alert("Please select only one Column");
    } else if (selectedCol.size == 1) {

        if (maxCol <= initCol) {
            alert("No more columns can be added");
            return;
        }
        let iterator = selectedCol.values();
        let itr = iterator.next().value;

        let tdtop = document.createElement("td");
        tdtop.addEventListener("click", function() {
            selectCol(tdtop);
        }, false);
        text = this.document.createTextNode("");
        tdtop.appendChild(text);
        let coltop = document.getElementById(itr);
        coltop.insertAdjacentElement("afterend", tdtop);

        for (let i = 1; i < initRow; i++) {
            let td = document.createElement("td");
            td.setAttribute("contenteditable", "true");
            listener(td);
            let col = document.getElementById(itr + i);
            // method which inserts after an ele
            col.insertAdjacentElement("afterend", td);
        }

        initCol++;
        reArrangeRowNumbers();
    } else {
        alert("Please select a Column");
    }
}

// maintains the list of selectedrows
const selectedRow = new Set();

// method to highlight the selectedrows
const selectRow = (x) => {
    if (x.classList.contains("highlight")) {
        x.classList.remove("highlight");
        selectedRow.delete(x);
    } else {
        x.classList.add("highlight");
        selectedRow.add(x);
    }
}

// maintains the list of selected cols
const selectedCol = new Set();

// method to highlight selected cols
const selectCol = (x) => {
    if (x.classList.contains("highlight")) {
        selectedCol.delete(x.id);
    } else {
        selectedCol.add(x.id);
    }
    x.classList.toggle("highlight");
    for (let i = 1; i < initRow; i++) {
        let col = document.getElementById(x.id + i);
        col.classList.toggle("highlight");
    }
}

// event listener to listen to export button click
document.getElementById("export").addEventListener("click", function() {
    export_table_to_csv("table.csv");
});

// function to export the content to csv
function export_table_to_csv(filename) {
    let csv = [];
    let rows = document.querySelectorAll("table tr");
    for (let i = 0; i < rows.length; i++) {
        let row = [],
            cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);
        csv.push(row.join(","));
    }
    download_csv(csv.join("\n"), filename);
}

// method to download the csv
const download_csv = (csv, filename) => {
    let csvFile;
    let downloadLink;
    csvFile = new Blob([csv], { type: "text/csv" });
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

// method to load the csv
document.getElementById("import").addEventListener('click', function() {
    let fileupload = document.getElementById("FileUpload1");
    fileupload.click();
    fileupload.onchange = function() {
        console.log(fileupload.value);
        let regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(fileupload.value.toLowerCase())) {
            if (typeof(FileReader) != "undefined") {
                let reader = new FileReader();
                reader.onload = function(e) {

                    let tabDel = document.getElementById("table");
                    tabDel.parentElement.removeChild(tabDel);
                    selectedCol.clear();
                    selectedRow.clear();

                    let rows = e.target.result.split("\n");
                    initRow = rows.length;
                    let max = 0;
                    for (let i = 0; i < rows.length; i++) {
                        let arr = rows[i].split(",");
                        if (arr.length > max) {
                            max = arr.length;
                        }
                    }
                    // gets the max col
                    initCol = max + 1;

                    let table = document.createElement("table");
                    table.setAttribute("id", "table");

                    for (let i = 0; i < initRow; i++) {
                        let row = table.insertRow(-1);
                        row.setAttribute("id", i);
                        for (let j = 0; j < initCol; j++) {
                            let cell = row.insertCell(-1);
                            if (i != 0)
                                cell.setAttribute("id", String.fromCharCode(j + 64) + i);
                            else
                                cell.setAttribute("id", String.fromCharCode(j + 64));
                            if (i == 0 && j > 0) {
                                cell.innerHTML = String.fromCharCode(j + 64);
                                cell.addEventListener("click", function() {
                                    selectCol(cell);
                                }, false);
                                cell.setAttribute("id", String.fromCharCode(j + 64));
                            } else if (j == 0 && i > 0) {
                                cell.innerHTML = i;
                                cell.addEventListener("click", function() {
                                    selectRow(row);
                                }, false);
                            } else if (j == 0 && i == 0) {
                                cell.setAttribute("contenteditable", "false");
                            } else {
                                let cells = rows[i - 1].split(",");
                                cell.innerHTML = cells[j - 1];
                                cell.setAttribute("contenteditable", "true");
                                listener(cell);
                            }
                        }
                    }

                    let spreadSheet = document.getElementById("SpreadSheet");
                    spreadSheet.innerHTML = "";
                    spreadSheet.appendChild(table);
                    // appends the table
                }
                reader.readAsText(fileupload.files[0]);
            }
        }
    };
});