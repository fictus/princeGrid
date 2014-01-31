/****************************
PrinceGrid.JQuery.js
--------------------
Version 0.0.6 (2014)


Created by Luis Valle

REQUIRED COMPONENTS:
-------------------
jquery-1.7.2.min.js (http://code.jquery.com/jquery-1.7.2.min.js)
jQuery UI 1.8.16 (http://jqueryui.com/resources/download/jquery-ui-1.8.16.zip)
json2.js (for browsers that don't support json parsing) (https://github.com/douglascrockford/JSON-js/blob/master/json2.js)
prncGrd.ashx (generic AJAX handler)
princeGrid.UI.css (for table style)





WHAT IS PrinceGrid.JQuery.js?
-----------------------------
It is a JQuery plugin to create tables via AJAX in MS SQL back-ends by passing SQL StoredProcedures .
The table also gives Row-Editing functionality, sorting and basic filtering.




BASIC USE:
-----------
(1) Create an html table with no rows, with a unique ID, like:

<table id="tblMyCustomers">
</table>

(2) Modify the included prncGrd.ashx namespace to work with your aspx page.

(3) Include PrinceGrid.JQuery.js (and dependencies) in your aspx page header.
        
<script type="text/javascript" src='princeGrid.JQuery.js'></script>
<script type="text/javascript" src="json2.js"></script>
<link href='princeGrid.UI.css' rel="stylesheet" />

(4) Initiate PrinceGrid in your javascript:

// if no SQL params are needed you must pass 'null'
var SQLparams = { "@parentName": "010200036" };

// conn is the name of your connection from your web.config file
var conn = 'PrinceSQLDataServer';

$('#tblMyCustomers').populateFromStoredProc('spRetrieveFourthShiftUsersPmc', null, 'prncGrd.ashx', conn); 





That's all! PrinceGrid will communicate with the SQL Server and populate your table.




IF YOU ENABLE TABLE-EDITING:
----------------------------
simply double-click desired Row to edit Row-Contents (see examples below)

ADVANCED OPTIONS:
------------------
prncGrdOption constructor
~~~~~~~~~~~~~~~~~~~~~~~~~

You can specify the following custom column 'prncGrdOption' constructor with the following parameters:

PARAMETER 0 - COLUMN NAME
(ex. "Customer Name")

PARAMETER 1 - COLUMN TYPE
0 = NORMAL/DEFAULT
1 = LINK BUTTON
2 = BUTTON
3 = HIDE COLUMN

PARAMETER 2 - ENABLE EDITING
false = disabled
true  = enabled

PARAMETER 3 - LINK or BUTTON caption text
(ex. "Click HERE")

PARAMETER 4 - IF BUTTON, SPECIFY YOUR JAVASCRIPT FUNCTION (all Row-Data will be passed to your function; there you can do what ever you want with this data):
            
function populateCustomersTable() {
var SQLparams = { "@itemNumberDwg": "010200036" };
var conn = 'EngineeringDataServer';

var myHeader = new Array();
myHeader.push(new prncGrdOption("Item Number", 0));
myHeader.push(new prncGrdOption("Customer Name", 0));
myHeader.push(new prncGrdOption("Item Status", 0));
myHeader.push(new prncGrdOption("Item Revision", 0));
myHeader.push(new prncGrdOption("Item UM", 0));
myHeader.push(new prncGrdOption("Make Buy Code", 0));
myHeader.push(new prncGrdOption("Customer ID", 0));
myHeader.push(new prncGrdOption("Drawing Link", 1, false, "Show PDF"));  //<---------------- will create a LINK with the cell-data as the href
myHeader.push(new prncGrdOption("Released To Production", 0)); 
myHeader.push(new prncGrdOption("Volume Part", 2, false, "Show", "showCustomerName")); //<-- will create a button that triggers function showCustomerName()
myHeader.push(new prncGrdOption("Date Entered", 3)); //<------------------------------------ this colum will be hidden

$('#tblMyCustomers').populateFromStoredProc('spEngItemDrawing', SQLparams, 'prncGrd.ashx', conn, myHeader);
}
            
function showCustomerName() {
alert(arguments[1]);

// all your Row-data can be accessed via arguments[?] (enter the desired coulumn index
}

            
PARAMETER 5 - IF ANY COLUMN EDITING IS SET TO TRUE you must pass the name of your javascript function for calling the Save Method:
            
function populateCustomersTable() {
var conn = 'DivApplicationsDataServer';

var tblHeader1 = new prncGrdOption("Entry ID", 3);
var tblHeader2 = new prncGrdOption("Truck", 0);
var tblHeader3 = new prncGrdOption("Dhm", 0, true); //<----------------- this column will be editable
var tblHeader4 = new prncGrdOption("Hci", 0, true); //<----------------- this column will be editable
var tblHeader5 = new prncGrdOption("Lch", 0, true); //<----------------- this column will be editable
var tblHeader6 = new prncGrdOption("Ohc", 0, true); //<----------------- this column will be editable
var tblHeader7 = new prncGrdOption("Phc", 0, true); //<----------------- this column will be editable
var tblHeader8 = new prncGrdOption("Pds", 0, true); //<----------------- this column will be editable
var tblHeader9 = new prncGrdOption("Other Destinations", 0, true); //<-- this column will be editable
var tblHeader10 = new prncGrdOption("Last Update", 0);
var myHeader = [tblHeader1, tblHeader2, tblHeader3, tblHeader4, tblHeader5, tblHeader6, tblHeader7, tblHeader8, tblHeader9, tblHeader10];
                
$('#tblMyCustomers').populateFromStoredProc('spShipmentTruckRoute', null, 'prncGrd.ashx', conn, myHeader);

// pass your javascript editing function
$('#tblMyCustomers').rowEditFunction("editSaveCustomerParts");
}

function editSaveCustomerParts() {
//var tblID = arguments[1]; this argument contains your table ID if you need it for something else                    
//alert(inData.entry[1].value + ' --- ' + inData.entry[1].text + '\n\n' + JSON.stringify(inData)); // Peak inside incoming data to know what entries you need
//return false;

// all your editing and original Row-data is received in a JSON object inside arguments[0]
var inData = arguments[0];

                    

if (confirm("Are you sure you want to SAVE these Changes?")) {
//----- IMPORTANT ------------------------------------------------------------------
// accessing your incoming data is done in three ways:
//
// inData.entry[0].column = contains the name of the column (should you need it)
// inData.entry[0].value = contains the original value of the cell (before editing)
// inData.entry[0].text = contains the changes you made in that given cell textbox
//----------------------------------------------------------------------------------

// you must build your SQL Parameters this way:
var SQLparams = { "@EntryID": inData.entry[0].value, "@dmh": inData.entry[2].text, "@hci": inData.entry[3].text, "@lch": inData.entry[4].text, "@ohc": inData.entry[5].text, "@phc": inData.entry[6].text, "@pds": inData.entry[7].text, "@otherDestinations": inData.entry[8].text };
var conn = 'DivApplicationsDataServer';

// finally, you must call 'saveChangesToSQLdb' and pass your Stored Procedure and parameters this way:
$('#tblMyCustomers').saveChangesToSQLdb('spShipmentUpdateTruckRoute', SQLparams, 'prncGrd.ashx', conn);
} else {
return false;
}
}

        
***************************/

var prncGrdSaveFunctions = new Array();
var prncGrdRefreshTable = new Array();
(function ($) {

    $.fn.populateFromStoredProc = function (storedProc, spParams, JsonHndlr, conn, tblOptions) {

        var element = this;
        if (document.getElementById($(element).attr('id')) == null) {
            alert("ERROR: Your Table doesn't exist. Please check your '.populateFromStoredProc' for typos and try again.");
            return false;
        }
        var wt = prncFunctionAttachWait($(element).attr('id'));

        prnGridFunction_Wait($(element).attr('id'));
        AJAXcom();

        function AJAXcom() {
            $.ajax({
                url: JsonHndlr,
                data: JSON.stringify({ "prncFunction": "selectData", "StoredProc": storedProc, "connection": conn, "paramsPrinceGrid": spParams }),
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                success: function (data) {
                    try {
                        var resultt = data.responseResult;
                        if (resultt == 'Failed') {
                            prnGridFunction_Done();
                            alert(data.errorCode.replace(/\\r/g, '\r').replace(/\\n/g, '\n'));
                        } else if (resultt == 'NoData') {
                            $(element).empty();
                            var html = "<tr><th class=\"prcGridTblhead\">";
                            html = html + "(NO DATA)";
                            html = html + "</th></tr>";
                            $(element).append(html);
                            prnGridFunction_Done();
                        } else if (resultt == 'Good') {
                            var refrshExists = false;
                            for (var i = 0; i < prncGrdRefreshTable.length; i++) {
                                if (prncGrdRefreshTable[i][0] == $(element).attr('id')) {
                                    var tempArr = new Array();
                                    tempArr.push(storedProc);
                                    tempArr.push(spParams);
                                    tempArr.push(JsonHndlr);
                                    tempArr.push(conn);
                                    tempArr.push(tblOptions);

                                    prncGrdRefreshTable[i][1] = tempArr;
                                    refrshExists = true;
                                    break;
                                }
                            }

                            if (refrshExists == false) {
                                var tempArr = new Array();
                                tempArr.push(storedProc);
                                tempArr.push(spParams);
                                tempArr.push(JsonHndlr);
                                tempArr.push(conn);
                                tempArr.push(tblOptions);

                                prncGrdRefreshTable.push([$(element).attr('id'), tempArr])
                            }
                            prnGrid_addRows(data);
                        }
                    } catch (e) {
                        prnGridFunction_Done();
                        alert(e.message + ' (Catched error.)');
                    }
                },
                error: function (data, status, jqXHR) {
                    prnGridFunction_Done();
                    alert('error::: (' + status + ') --- ' + JSON.stringify(data));
                }
            });
        };

        function prnGrid_addRows(data) {
            $(element).empty();
            $(element).attr('class', 'prcGrid');
            var totalCELLS = -1;

            if (tblOptions != null) {
                var myOpsInt = parseInt(tblOptions.length);
                if (tblOptions.length < parseInt(data.ColCount)) {
                    var totalNeeded = parseInt(data.ColCount) - myOpsInt;
                    for (var i = 0; i < totalNeeded; i++) {
                        tblOptions.push(new prncGrdOption("", 3));
                    }
                    //alert(myOpsInt + ' --- ' + tblOptions.length)
                    //alert("ERROR: Your table only has '" + myOpsInt + "' columns but SQL is returning '" + data.ColCount + "' columns. This means you didn't create enough ''prncGrdOption'' column headers. Verify your prncGrdOption javascript columns and Add more to match what SQL is returning.");
                    //return false;
                }
            }

            //--- Add Header -----
            var html = "";
            var sortClick = "";
            var editButtonShow = "";
            if (tblOptions != null) {
                for (var n = 0; n < tblOptions.length; n++) {
                    if (tblOptions[n].isEditable == true) {
                        editButtonShow = "<img id=\"prncGrdImg_DblClick_" + $(element).attr('id') + "\" alt=\"\" title=\"To edit Table contents double-click desired ROW.\" src=\"" + prncImgEditable + "\" style=\"position:absolute;margin-left:-17px;margin-top:-17px;\" onclick=\"alert('To edit Table contents double-click desired ROW.');\" onmouseover=\"$(this).css('cursor','pointer');\" onmouseout=\"$(this).css('cursor','default');\" />";
                        break;
                    }
                }
            }

            if (tblOptions == null) {
                totalCELLS = parseInt(data.ColCount);

                html = "<tr>";
                for (var i = 0; i < totalCELLS; i++) {
                    var ccTmp = "";
                    if (i == 0) {
                        ccTmp = editButtonShow;
                    }
                    sortClick = "<img id=\"img_prncGrd_col_" + i + "_" + $(element).attr('id') + "\" alt=\"▼\" src=\"" + prncImgSortASC + "\" style=\"FILTER:alpha(opacity=30);opacity:0.3;float:right;\" onclick=\"prncGrdsortTable('" + $(element).attr('id') + "'," + i + ",'img_prncGrd_col_" + i + "_" + $(element).attr('id') + "');\" onmouseover=\"$(this).css('cursor','pointer');\" onmouseout=\"$(this).css('cursor','default');\" /></input><input id=\"txt_prncGrid_imgIndex_" + i + "_" + $(element).attr('id') + "\" type=\"text\" name=\"txt_prncGrid_imgIndex_" + i + "_" + $(element).attr('id') + "\" style=\"display:none;\" value=\"false\"></input>";
                    html = html + "<th id=\"" + 'col_' + i + "\" class=\"prcGridTblhead\">" + ccTmp + "<div style=\"display:table;width:100%;\"><div style=\"display:table-row;\"><div style=\"display:table-cell;text-align:center;\"><span id=\"lblprncGrid_ColHeader_" + i + "_" + $(element).attr('id') + "\">" + data.headder[i]['col_' + i] + "</span></div><div style=\"display:table-cell;text-align:right;\">" + sortClick + "</div></div></div></th>";
                }
                html = html + "</tr>";
                $(element).append(html);
            } else {
                totalCELLS = tblOptions.length;

                html = "<tr>";
                var hiddenFirstCol = -1;
                for (var i = 0; i < tblOptions.length; i++) {
                    var xClOpt = tblOptions[i];
                    var ccTmp = "";
                    if (xClOpt.columnType == 3) {
                        html = html + "<th style='display:none;' class='prcGridTblhead'>" + ccTmp + xClOpt.columnHeader + "</th>";
                    } else {
                        if (hiddenFirstCol == -1) {
                            ccTmp = editButtonShow;
                            hiddenFirstCol = 0;
                        }
                        sortClick = "";
                        if (xClOpt.columnType == 0) {
                            sortClick = "<img id=\"img_prncGrd_col_" + i + "_" + $(element).attr('id') + "\" alt=\"▼\" src=\"" + prncImgSortASC + "\" style=\"FILTER:alpha(opacity=30);opacity:0.3;float:right;\" onclick=\"prncGrdsortTable('" + $(element).attr('id') + "'," + i + ",'img_prncGrd_col_" + i + "_" + $(element).attr('id') + "');\" onmouseover=\"$(this).css('cursor','pointer');\" onmouseout=\"$(this).css('cursor','default');\" /></input><input id=\"txt_prncGrid_imgIndex_" + i + "_" + $(element).attr('id') + "\" type=\"text\" name=\"txt_prncGrid_imgIndex_" + i + "_" + $(element).attr('id') + "\" style=\"display:none;\" value=\"false\"></input>";
                        }
                        html = html + "<th id=\"" + 'col_' + i + "\" class=\"prcGridTblhead\">" + ccTmp + "<div style=\"display:table;width:100%;\"><div style=\"display:table-row;\"><div style=\"display:table-cell;text-align:center;\"><span id=\"lblprncGrid_ColHeader_" + i + "_" + $(element).attr('id') + "\">" + xClOpt.columnHeader + "</span></div><div style=\"display:table-cell;text-align:right;\">" + sortClick + "<div></div></div></th>";
                    }
                }

                html = html + "</tr>";
                $(element).append(html);
            }

            //--- Add filter -----

            html = "<tr><th colspan=\"" + totalCELLS + "\" class=\"prcGridTblFilter\">"; //data.ColCount
            html = html + "<span style=\"font-weight:normal;color:#696969;font-size:small;\">Filter by:</span>";
            html = html + "<select id=\"cmb_prncGrid_FilterBy_" + $(element).attr('id') + "\" name=\"cmb_prncGrid_FilterBy_" + $(element).attr('id') + "\" style=\"font-weight:normal;color:black;font-size:small;width:auto;background-color:#EEF3E2;color:#696969;margin-left:5px;\">";
            var indexIdentified = -1;
            for (var i = 0; i < totalCELLS; i++) { //parseInt(data.ColCount)
                if (tblOptions == null) {
                    indexIdentified = 0;
                    if (data.headder[i]['col_' + i]) {
                        html = html + "<option id=\"opt_prncGrid_" + i + "_" + $(element).attr('id') + "\" value=\"" + data.headder[i]['col_' + i] + "\">" + data.headder[i]['col_' + i] + "</option>";
                    }
                } else {
                    if (tblOptions[i].columnType == 0 || tblOptions[i].columnType == 4) {
                        if (indexIdentified == -1) {
                            indexIdentified = i;
                        }
                        html = html + "<option id=\"opt_prncGrid_" + i + "_" + $(element).attr('id') + "\" value=\"" + tblOptions[i].columnHeader + "\">" + tblOptions[i].columnHeader + "</option>";
                    }
                }
            }
            html = html + "</select>";
            html = html + "<input id=\"txt_prncGrid_FilterBy_" + $(element).attr('id') + "\" type=\"text\" name=\"txt_prncGrid_FilterBy_" + $(element).attr('id') + "\" style=\"font-weight:normal;color:black;font-size:small;width:90px;margin-left:5px;\" autocomplete=\"off\" onkeyup=\"$.fn.prnGrid_searchTable(this);\"></input><input id=\"txt_prncGrid_Index_" + $(element).attr('id') + "\" type=\"text\" name=\"txt_prncGrid_Index_" + $(element).attr('id') + "\" style=\"display:none;\" value=\"" + indexIdentified + "\"></input>";
            html = html + "</th></tr>";
            $(element).append(html);

            $("#cmb_prncGrid_FilterBy_" + $(element).attr('id')).change(function () {
                $.fn.prnGrid_filterChanged(element);
            });
            if (document.getElementById('prncGrdImg_DblClick_' + $(element).attr('id'))) {
                var $elementImgDblClick = $('#prncGrdImg_DblClick_' + $(element).attr('id'));
                setInterval(function () {
                    $elementImgDblClick.fadeIn(500).delay(100).fadeOut(500).delay(100).fadeIn(500);
                }, 100);
            }

            //--- Add ROWS -----
            html = "";
            for (var i = 0; i < parseInt(data.RowCount); i++) {
                var EditableFunction = "";
                if (tblOptions) {
                    var tableIsEditable = false;
                    for (var n = 0; n < tblOptions.length; n++) {
                        if (tblOptions[n].isEditable == true) {
                            tableIsEditable = true;
                            break;
                        }
                    }

                    if (tableIsEditable == true) {
                        var editArray = "";
                        for (var n = 0; n < tblOptions.length; n++) {
                            var whaEditIs = "";
                            var editCellContent = "";
                            if (tblOptions[n].isEditable == true && tblOptions[n].columnType == 0) {
                                whaEditIs = $.fn.prnGrid_escape("1|" + tblOptions[n].columnHeader) + ",";
                            } else if (tblOptions[n].isEditable == false && tblOptions[n].columnType == 0) {
                                whaEditIs = $.fn.prnGrid_escape("0|" + tblOptions[n].columnHeader) + ",";
                            }
                            if (tblOptions[n].columnType == 1 || tblOptions[n].columnType == 2 || tblOptions[n].columnType == 3) {
                                whaEditIs = $.fn.prnGrid_escape("2|" + tblOptions[n].columnHeader) + ",";
                            }
                            if (data.rows[i]['row_' + i + '_' + n]) {
                                editCellContent = $.fn.prnGrid_escape(data.rows[i]['row_' + i + '_' + n]) + ",";
                            } else {
                                editCellContent = $.fn.prnGrid_escape("") + ",";
                            }

                            editArray = editArray + whaEditIs + editCellContent;
                        }
                        if (editArray.substr(editArray.length - 1) == ",") {
                            editArray = editArray.substring(0, editArray.length - 1);
                        }
                        EditableFunction = " ondblclick=\"prncFunctionShowEditDiv(" + editArray + ",'" + $(element).attr('id') + "',event);\"";
                    }
                }
                html = "<tr" + EditableFunction + ">";
                for (var j = 0; j < totalCELLS; j++) { //parseInt(data.ColCount)
                    if (tblOptions == null) {
                        if (data.rows[i]['row_' + i + '_' + j]) {
                            html = html + "<td>" + data.rows[i]['row_' + i + '_' + j] + "</td>";
                        } else {
                            html = html + "<td></td>";
                        }
                    } else {
                        if (tblOptions[j].columnType == 0) {
                            var CellTypeX = "";
                            if (tblOptions[j].isEditable == false) {
                                CellTypeX = "prncCellType=\"normal\"";
                            } else {
                                CellTypeX = "prncCellType=\"canedit\"";
                            }
                            if (data.rows[i]['row_' + i + '_' + j]) {
                                html = html + "<td " + CellTypeX + ">" + data.rows[i]['row_' + i + '_' + j] + "</td>";
                            } else {
                                html = html + "<td " + CellTypeX + "></td>";
                            }
                        } else if (tblOptions[j].columnType == 1) {
                            var CellTypeX = "prncCellType=\"link\"";
                            var lknA = "<a target=\"_blank\" href=\"" + data.rows[i]['row_' + i + '_' + j] + "\">" + tblOptions[j].buttonText + "</a>";
                            html = html + "<td " + CellTypeX + ">" + lknA + "</td>";
                        } else if (tblOptions[j].columnType == 2) {
                            var CellTypeX = "prncCellType=\"button\"";
                            var allTog = "";
                            var bFunc = tblOptions[j].runFunction;
                            if (bFunc != null) {
                                bFunc = bFunc.replace(/\((.*?)\)/g, '');
                                allTog = bFunc;

                                var xxARGS = "";
                                if (tblOptions[j].functionArguments == 'allCells') {
                                    for (var n = 0; n < totalCELLS; n++) {
                                        if (data.rows[i]['row_' + i + '_' + n]) {
                                            xxARGS = xxARGS + $.fn.prnGrid_escape(data.rows[i]['row_' + i + '_' + n]) + ",";
                                        } else {
                                            xxARGS = xxARGS + $.fn.prnGrid_escape("") + ",";
                                        }
                                    }
                                    if (xxARGS.substr(xxARGS.length - 1) == ",") {
                                        xxARGS = xxARGS.substring(0, xxARGS.length - 1);
                                    }
                                } else {
                                    if ($.isArray(tblOptions[j].functionArguments)) {
                                        var tempArray = tblOptions[j].functionArguments;
                                        for (var n = 0; n < tempArray.length; n++) {
                                            if (isNaN(tempArray[n]) == false) {
                                                if (data.rows[i]['row_' + i + '_' + n]) {
                                                    xxARGS = xxARGS + $.fn.prnGrid_escape(data.rows[i]['row_' + i + '_' + n]) + ",";
                                                }
                                            }
                                        }
                                        if (xxARGS.substr(xxARGS.length - 1) == ",") {
                                            xxARGS = xxARGS.substring(0, xxARGS.length - 1);
                                        }
                                    } else {
                                        xxARGS = "'" + tblOptions[j].functionArguments + "'";
                                    }
                                }

                                allTog = allTog + "(" + xxARGS + ");";
                            } else {
                                allTog = "alert('nothing');";
                            }

                            var btnA = "<button type=\"button\" onclick=\"" + allTog + "\">" + tblOptions[j].buttonText + "</button>";
                            html = html + "<td " + CellTypeX + ">" + btnA + "</td>";
                        } else if (tblOptions[j].columnType == 3) {
                            var CellTypeX = "prncCellType=\"hidden\"";
                            if (data.rows[i]['row_' + i + '_' + j]) {
                                html = html + "<td " + CellTypeX + " style=\"display:none;\">" + data.rows[i]['row_' + i + '_' + j] + "</td>";
                            } else {
                                html = html + "<td " + CellTypeX + " style=\"display:none;\"></td>";
                            }
                        }

                    }
                }
                html = html + "</tr>";

                $(element).append(html);
            }
            prnGridFunction_Done();
        };

        $.fn.prnGrid_escape = function (txtIn) {
            return JSON.stringify(txtIn).replace(/&/, "&amp;").replace(/"/g, "&quot;");
        };

        $.fn.prnGrid_filterChanged = function (txtUUU) {
            var whtX = $(txtUUU).attr('id');
            var rIn = whtX.split('_');
            txtUUU = rIn[rIn.length - 1];
            var lst = document.getElementById('cmb_prncGrid_FilterBy_' + txtUUU);
            var l_filter = lst[lst.selectedIndex].value;
            var tbl = document.getElementById(txtUUU);
            var txtIndex = document.getElementById('txt_prncGrid_Index_' + txtUUU);

            for (var i = 0; i < tbl.rows[0].cells.length; i++) {
                try {
                    if (document.getElementById('lblprncGrid_ColHeader_' + i + '_' + txtUUU)) {
                        var xtxt = document.getElementById('lblprncGrid_ColHeader_' + i + '_' + txtUUU).innerHTML;
                        if (xtxt == l_filter) {
                            txtIndex.value = i;
                            break;
                        }
                    }
                } catch (e) {
                    alert(e.Message);
                }
            }

            $.fn.prnGrid_resetFilter(txtUUU);
            $('#txt_prncGrid_FilterBy_' + txtUUU).val('').focus();
        };

        $.fn.prnGrid_searchTable = function (txtUUU) {
            var whtX = $(txtUUU).attr('id');
            var rIn = whtX.split('_');
            txtUUU = rIn[rIn.length - 1];
            var txtSrcBox = $('#txt_prncGrid_FilterBy_' + txtUUU).val().toLowerCase();
            var tbl = document.getElementById(txtUUU);
            var cellSearch = parseInt(document.getElementById('txt_prncGrid_Index_' + txtUUU).value);

            if (txtSrcBox == '') {
                var rst = $.fn.prnGrid_resetFilter(txtUUU);
            } else {
                for (var i = 2; i < tbl.rows.length; i++) {
                    var txtQst = tbl.rows[i].cells[cellSearch].innerHTML.toLowerCase();

                    if (txtQst.match(txtSrcBox)) {
                        tbl.rows[i].style.display = '';
                    } else {
                        tbl.rows[i].style.display = 'none';
                    }
                }
            }
        };

        $.fn.prnGrid_resetFilter = function (tblID) {
            var tbl = document.getElementById(tblID);
            for (var i = 2; i < tbl.rows.length; i++) {
                tbl.rows[i].style.display = '';
            }
        };
    };

    $.fn.rowEditFunction = function (xFunction) {
        //var elementx = this;
        if (document.getElementById($(this).attr('id')) == null) {
            //alert("ERROR: Table ''" + $(element).attr('id') + "'' doesn't exist. Please check your '.populateFromStoredProc' for typos and try again.");
            return false;
        }
        if (xFunction != null) {
            xFunction = xFunction.replace(/\((.*?)\)/g, '');
            var funcExists = false;
            for (var i = 0; i < prncGrdSaveFunctions.length; i++) {
                if (prncGrdSaveFunctions[i][0] == $(this).attr('id')) {
                    prncGrdSaveFunctions[i][1] = xFunction;
                    funcExists = true;
                    break;
                }
            }

            if (funcExists == false) {
                prncGrdSaveFunctions.push([$(this).attr('id'), xFunction]);
            }
        }
    };

    $.fn.saveChangesToSQLdb = function (storedProc, spParams, JsonHndlr, conn) {
        var element = this;
        if (document.getElementById($(element).attr('id')) == null) {
            //alert("ERROR: Table ''" + $(element).attr('id') + "'' doesn't exist. Please check your '.populateFromStoredProc' for typos and try again.");
            return false;
        }
        prnGridFunction_Wait($(element).attr('id'));
        $.ajax({
            url: JsonHndlr,
            data: JSON.stringify({ "prncFunction": "saveChanges", "StoredProc": storedProc, "connection": conn, "paramsPrinceGrid": spParams }),
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json',
            success: function (data) {
                try {
                    var resultt = data.responseResult;
                    if (resultt == 'Failed') {
                        prnGridFunction_Done();
                        alert(data.errorCode.replace(/\\r/g, '\r').replace(/\\n/g, '\n'));
                    } else if (resultt == 'Good') {
                        prncFunctionHideEditDiv();
                        alert("SAVE/UPDATING was successfull!");
                        var refrshExists = false;

                        var tmpArr;
                        for (var i = 0; i < prncGrdRefreshTable.length; i++) {
                            if (prncGrdRefreshTable[i][0] == $(element).attr('id')) {
                                refrshExists = true;
                                tmpArr = prncGrdRefreshTable[i][1];
                                break;
                            }
                        }

                        if (refrshExists == false) {
                            prnGridFunction_Done();
                        } else {
                            $('#' + $(element).attr('id')).populateFromStoredProc(tmpArr[0], tmpArr[1], tmpArr[2], tmpArr[3], tmpArr[4]);
                        }
                    }
                } catch (e) {
                    prnGridFunction_Done();
                    alert(e.message + ' (Catched error from Updating.)');
                }
            },
            error: function (data, status, jqXHR) {
                prnGridFunction_Done();
                alert('error::: (' + status + ') --- ' + JSON.stringify(data));
            }
        });
    };
})(jQuery);

function prncGrdAssigSaveFunction() {
    if (prncGrdSaveFunctions.length == 0) {
        alert("ERROR: PrinceGrid requires a javascript Function to be set for ''.rowEditFunction('yourSaveFunctionHERE')''. The ''Save Changes'' button will not work until you specify a function.");
        return false;
    }
    var tblID = $('#prncGrid_txtTblInUseID').val();
    var funcToValidate = '';
    for (var i = 0; i < prncGrdSaveFunctions.length; i++) {
        if (prncGrdSaveFunctions[i][0] == tblID) {
            funcToValidate = prncGrdSaveFunctions[i][1];
            break;
        }
    }

    if (funcToValidate == '') {
        alert("ERROR: PrinceGrid requires a javascript Function to be set for ''.rowEditFunction('yourSaveFunctionHERE')''. The ''Save Changes'' button will not work until you specify a function.");
        return false;
    } else {
        try {
            var tblX = document.getElementById('prncGrid_tblEdit');
            //var argsArr = new Array();
            var jsonData = {
                entry: []
            };

            for (var i = 1; i < tblX.rows.length; i++) {
                var lbl = document.getElementById('prncGrd_lblEditDataHolder_' + (i - 1));
                var txt = document.getElementById('prncGrd_txtEditBox_' + (i - 1));
                var coln = document.getElementById('prncGrd_lblEditColName_' + (i - 1));
                var xLbl = null;
                var xTxt = null;
                var xCol = null;

                if (lbl) {
                    xLbl = $.trim(lbl.innerHTML);
                }
                if (txt) {
                    xTxt = $.trim(txt.value);
                }
                if (coln) {
                    xCol = $.trim(coln.innerHTML);
                    if (xCol.substr(xCol.length - 1) == ":") {
                        xCol = xCol.substring(0, xCol.length - 1);
                    }
                }

                var entry = {
                    column: xCol + '[' + (i - 1) + ']',
                    value: xLbl,
                    text: xTxt
                }

                jsonData.entry.push(entry);
            }

            window[funcToValidate](jsonData, tblID);
        } catch (e) {
            alert("ERROR: ''" + funcToValidate + "()'' doesn't exist or is not a valid javascript Function.");
            return false;
        }
    }
}

function prncGrdsortTable(table, col, imgz) {
    table = document.getElementById(table);
    var idSp = imgz.split('_');
    var xxID = idSp[idSp.length - 1];
    var reverse = false;

    try {
        for (var v = 0; v < table.rows[0].cells.length; v++) {
            var currIDx = 'img_prncGrd_col_' + v + '_' + xxID;

            if (currIDx != imgz) {
                var imgX = document.getElementById(currIDx);
                if (imgX) {
                    $('#txt_prncGrid_imgIndex_' + v + '_' + xxID).val('false');
                    $('#' + currIDx).attr('src', prncImgSortASC);
                    $('#' + currIDx).attr('alt', '▼');
                    $('#' + currIDx).css('opacity', '0.3');
                }
            } else {
                var Xreverse = $('#txt_prncGrid_imgIndex_' + v + '_' + xxID).val();
                if (Xreverse == 'false') {
                    reverse = false;
                    $('#txt_prncGrid_imgIndex_' + v + '_' + xxID).val('true');
                    $('#' + currIDx).attr('src', prncImgSortASC);
                    $('#' + currIDx).attr('alt', '▼');
                    $('#' + currIDx).css('opacity', '1');
                } else {
                    reverse = true;
                    $('#txt_prncGrid_imgIndex_' + v + '_' + xxID).val('false');
                    $('#' + currIDx).attr('src', prncImgSortDESC);
                    $('#' + currIDx).attr('alt', '▲');
                    $('#' + currIDx).css('opacity', '1');
                }
            }
        }

        var arrRws = new Array();
        for (var j = 2; j < table.rows.length; j++) {
            arrRws.push(table.rows[j]);
        }

        var tb = table.tBodies[0],
            tr = arrRws,
            i;
        reverse = -((+reverse) || -1);
        tr = tr.sort(function (a, b) {
            if ('textContent' in a.cells[col]) {
                return reverse // `-1 *` if want opposite order
                * (a.cells[col].textContent.trim()
                    .localeCompare(b.cells[col].textContent.trim())
                );
            } else {
                return reverse // `-1 *` if want opposite order
                * (a.cells[col].innerText.trim()
                    .localeCompare(b.cells[col].innerText.trim())
                );
            }
        });
        for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]);
    } catch (e) {
        alert(e.message);
    }
}

var prncImgSortASC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjklEQVQ4jc3QMQrCQBCF4Y9g4XksvJh4IitPISGIkMLWwoOIIsYmmjUsSzbb+GCK3Z158+9jUI2DAnV9jVX3FVU1wXiJRQlBUlMIig0aA10zxyD8f7L/fzM4Geg+dcwxeEbuXrHG2RlcR4MdLjkma9wDghtWwXssg28WFVpsg4ENzsH5kVj+k88euxx0eANYCCtzz61PQQAAAABJRU5ErkJggg==";
var prncImgSortDESC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAg0lEQVQ4jc2QMQqAMAxFH+LgeRw8lIOXcvIUUkQ8goMHEUGsS6Ehllp18UGg9Cefn4DHAD0fsK40Rmi6TJZgXES0PCVBlJQEnw0GrrsPTwzywF9w7r83mPDpxjcGu3gfscbXN1jUoAXmJyYVsIkEK1AKfSKwu6YRBrXSjKtbOqBNaZScsPArU/w20fIAAAAASUVORK5CYII=";
var prncImgEditable = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQklEQVQ4jZWTT0hUURjFf/eb1/h8PmdGTVEjhCTcRIhIUNDCVcsg/NPCbUQ5iyctQqJ2LQqCWUxt2kRkVK5atIoYatEfKWsZSBBoZhY282Ya3+ibe1u80VFz01nee87H9+ccxR4wHp3ANHCs9jQLjKkMv3Zz1TZRArgI9AKCnRxl6FIcgOfX1wkr94E48AW4ozL4WwVq4qeINYjbAf4StPTAta8uAFOpEkEBEt1QWgEdvgdOqwy+1BpII9Yg49M23huHtkNCY2rzD5xWoa1X8N46jE/biDUIpAGsGqWPRJfQe1JIdAmT72zsZL3A1GeHoKBx24WYBYkuIb/QByDG4wSgyS9obg8FrOWhab8Q21fflBUHt10or0ac/IIGQuPRYQEz2IkEDS7Em6ChORJ9fBwycyFAKRi7a3P0jEXcFWJxSHZD4I9SKXViPIrmxc2K2Y5w3ZjLzUXjkTMeL81Uqmiq4Q6KeXalYjx+1ufcGzo6toBSexKU8fi2NUJzpzA56yAxmHsU8uR8gCIaoX/UoroBtwbKlFc1gQ+V0isLGCHwzxH4w1iNEBQ0TqswcNaif8RFqagDgLW8pvIHCksAD4GrojK8BoTUQWEiZ+O0Cmt50FWQWCTWIZR/R2ecyNkkDwBYKsPKpg/mKS5rFj9oRCA7FOCkYHLWAeDGkTJaQzpnszinKf6gZuktI2Wpbpzi3kh/zSSalp76pvxlTVCAzPEA/7tGh5+ALPwbpjRwGAA7ObwrTA8AG5gHsjvCtBv/E+e//K3wJZlFWv4AAAAASUVORK5CYII=";
var prncWaitImageSpinner = "data:image/gif;base64,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";
var prncImgClose = "data:image/png;base64,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";

function prncGrdOption(columnHeader, columnType, isEditable, buttonText, runFunction, functionArguments) {
    this.columnHeader = columnHeader;
    this.columnType = columnType;
    if (isEditable == null) {
        isEditable = false;
    }
    if (columnType != 0) {
        isEditable = false;
    }
    this.isEditable = isEditable;
    this.buttonText = buttonText;
    this.runFunction = runFunction;
    if (functionArguments == null || functionArguments == false) {
        functionArguments = "allCells";
    }
    this.functionArguments = functionArguments;
};

function prncFunctionAttachWait(attchElemnt) {
    if (document.getElementById('prncGrid_divOverlay')) {
        return false;
    }
    try {
        // Add Edit menu -----
        var $dvBackEE = $('<div />').attr('id', 'prncGrid_dvEditMenu').css({ 'padding': '10px 25px 10px 25px', 'border': '1px solid #CFD2D6', 'position': 'absolute', 'top': '0px', 'left': '0px', 'background-color': '#EEF3E2', 'z-index': '997', 'display': 'none' });
        $dvBackEE.insertAfter($('#' + attchElemnt));

        var $imgEE = $('<img />').attr({ 'alt': '', 'src': prncImgClose }).css({ 'position': 'absolute', 'top': '-17px', 'left': '100%', 'margin-left': '-17px', 'cursor': 'pointer' }).appendTo($dvBackEE);
        var $tblEE = $('<table />').attr('id', 'prncGrid_tblEdit').css({ 'width': 'auto' }).appendTo($dvBackEE);
        var $dvIn1EE = $('<div />').attr('id', 'prncGrid_dvEditSave').css({ 'text-align': 'center', 'padding-top': '8px', 'padding-bottom': '8px', 'background-color': '#F8D37E', 'border': '1px solid orange' }).appendTo($dvBackEE);
        var $btnSaveEE = $('<button />', { text: 'Save Changes', id: 'prncGrid_btnEditSave' }).appendTo($dvIn1EE);
        var $txtTblInUseID = $("<input id=\"prncGrid_txtTblInUseID\" type=\"text\" name=\"textbox\" value=\"\" style=\"display:none;\" />").appendTo($dvIn1EE);

        $($imgEE).click(function () {
            prncFunctionHideEditDiv();
        });
        $($btnSaveEE).click(function () {
            prncGrdAssigSaveFunction(); return false;
        });
        $("body").click(function () {
            prncFunctionHideEditDiv();
        });
        $("#prncGrid_dvEditMenu").click(function (e) {
            e.stopPropagation();
        });

        // Add wait panel
        var $dvBack = $('<div />').attr('id', 'prncGrid_divOverlay').css({ 'position': 'fixed', 'width': '100%', 'height': '100%', 'top': '0px', 'left': '0px', 'background-color': 'black', 'opacity': '0.85', 'z-index': '998', 'display': 'none' });
        $dvBack.insertAfter($('#prncGrid_dvEditMenu')); //attchElemnt

        var $dvWaitHoldr = $('<div />').attr('id', 'prncGrid_dvWaitHolder').css({ 'position': 'absolute', 'padding-top': '40px', 'padding-bottom': '40px', 'background-color': 'white', 'border': '6px solid #20B2AA', 'width': '250px', 'left': '50%', 'top': '150px', 'margin-left': '-125px' });
        var $dvIn1 = $('<div />').css({ 'text-align': 'center' });
        var $img = $('<img />').attr({ 'alt': 'WAIT', 'src': prncWaitImageSpinner }).appendTo($dvIn1);
        var $dvIn2 = $('<div />').css({ 'text-align': 'center', 'padding-top': '20px' });
        var $lbl = $('<span />').css({ 'font-weight': 'bold', 'color': '#20B2AA' }).html('PLEASE WAIT').appendTo($dvIn2);

        $dvIn1.appendTo($dvWaitHoldr);
        $dvIn2.appendTo($dvWaitHoldr);
        $dvWaitHoldr.appendTo($dvBack);
    } catch (e) {
        alert(e.message + " - (prncFunctionAttachWait)");
    }

}

function prnGridFunction_Wait(elmx) {
    $('#prncGrid_divOverlay').stop();
    $('#prncGrid_divOverlay').css('opacity', '0');
    $('#prncGrid_divOverlay').css('display', '');
    $('#prncGrid_divOverlay').fadeTo("fast", 0.85, function () {
        //
    });
    //var dvWait = document.getElementById('prncGrid_divOverlay');
    //dvWait.style.display = '';
}

function prnGridFunction_Done() {
    $('#prncGrid_divOverlay').stop();
    $('#prncGrid_divOverlay').fadeTo("fast", 0, function () {
        $('#prncGrid_divOverlay').css('display', 'none');
    });
    //var dvWait = document.getElementById('prncGrid_divOverlay');
    //dvWait.style.display = 'none';
}

function prncFunctionShowEditDiv() {
    // 0 - show label only
    // 1 - can edit
    // 2 - don't show; it's a button or link or hidden
    // prncGrid_tblEdit
    var usedTable = arguments[arguments.length - 2];
    var e = arguments[arguments.length - 1] || window.event;

    $('#prncGrid_txtTblInUseID').val(usedTable);

    $('#prncGrid_tblEdit').empty();
    $('#prncGrid_tblEdit').append("<tr><td colspan=\"2\" style=\"text-align:center;padding:4px;box-shadow:4px 4px 2px white;background-color:#CFD2D6;\"><strong>EDIT ROW CONTENTS</strong></td></tr>");
    var xCnt = 0;
    for (var i = 0; i < (arguments.length - 2); i += 2) {
        var arg1 = arguments[i];
        var arg2 = arguments[i + 1];
        var whatIs = arg1.split('|')[0];
        var argCaption = arg1.substring(2);
        var html = "";
        var txtBox = "";
        var xhideLbl = "";
        var xhideRow = "";
        if (argCaption.substr(argCaption.length - 1) != ":") {
            argCaption = argCaption + ":";
        }

        if (whatIs == "0") {
        } else if (whatIs == "1") {
            xhideLbl = "display:none;";
            txtBox = "<input id=\"prncGrd_txtEditBox_" + xCnt + "\" type=\"text\" name=\"fname\" style=\"font-size:small;\" value=\"" + $.trim(arg2) + "\" />";
        } else if (whatIs == "2") {
            xhideRow = "style=\"display:none;\"";
        }

        html = html + "<tr " + xhideRow + "><td style=\"text-align:right;\">";
        html = html + "<span id=\"prncGrd_lblEditColName_" + xCnt + "\" style=\"font-weight:bold;color:#696969;\">" + argCaption + "</span></td>";
        html = html + "<td style=\"text-align:left;\">";
        html = html + "<span id=\"prncGrd_lblEditDataHolder_" + xCnt + "\" style=\"font-weight:normal;color:black;" + xhideLbl + "\">" + $.trim(arg2) + "</span>" + txtBox + "</td></tr>";

        $('#prncGrid_tblEdit').append(html);
        xCnt++;
    }

    var dv = document.getElementById("prncGrid_dvEditMenu");

    dv.style.height = '0px';
    var pageX = e.pageX;
    var pageY = e.pageY;

    dv.style.display = '';
    if ('srcElement' in e) { // handler for stupid IE // pageX === undefined
        //alert('ie');
        try {
            var posx = window.event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            var posy = window.event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

            //var parentOffset = $("#prncGrid_dvEditMenu").parent().offset();
            //var paddingg = (20 + 10 + 4); // include the padding of all possible elements encapsulating our element
            //var relX = e.clientX - parentOffset.left;
            //var relY = (e.clientY - parentOffset.top) + paddingg;            

            $("#" + usedTable + " tr td").css('background-color', '');
            $(e.srcElement).closest('tr').children('td').css('background', '#EEF3E2');

            $("#prncGrid_dvEditMenu").position({
                my: "left+1 top+1",
                of: e.srcElement //$(e.srcElement).closest('tr').children('td')
            });
            //$("#prncGrid_dvEditMenu").css('left', relX + 'px');
        } catch (ex) {
            alert(ex.message + " - (prncFunctionShowEditDiv)");
        }

    } else { // all other browsers
        //alert('other browser');
        $("#" + usedTable + " tr td").css('background-color', '');
        $(e.target).closest('tr').children('td').css('background', '#EEF3E2');

        $("#prncGrid_dvEditMenu").position({
            my: "left+1 top+1",
            of: e
        });
    }

    try {
        $("#prncGrid_dvEditMenu").animate({ height: $("#prncGrid_tblEdit").css("height") }, 250, function () {
            dv.style.height = 'auto';
        });
    } catch (ez) {
        alert(ez.message + " - (prncFunctionShowEditDiv)");
    }
}

function prncFunctionHideEditDiv() {
    document.getElementById('prncGrid_dvEditMenu').style.display = 'none';
}