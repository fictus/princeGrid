PrinceGrid.JQuery.js
====================
PrinceGrid.JQuery.js Version 0.0.7 (2014)


See a live Demo here:
=====================
http://www.evicore.net/princeGrid.aspx


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
            4 = CHECKBOX

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
                    var tblHeader8 = new prncGrdOption("Pds", 4, true); //<----------------- this column will be editable
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
                        //
                        // NOTE: Checkboxes will return a .text result of 1 (if checked) or 0 (if unchecked)
                        //
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

        
