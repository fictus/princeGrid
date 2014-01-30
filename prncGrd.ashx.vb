Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Data.SqlClient
Imports System.IO

Public Class prncGrd
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim writeResult As String = ""
        Try
            Dim jss = New JavaScriptSerializer()
            Dim json As String = New StreamReader(context.Request.InputStream).ReadToEnd()
            Dim sData As Dictionary(Of String, Object) = jss.Deserialize(Of Dictionary(Of String, Object))(json)
            Dim xWHAT As Object = sData("prncFunction")

            Dim TCls As New prncGrd
            Dim myParameters() As Object = {json}
            CallByName(TCls, xWHAT, CallType.Method, myParameters)
            TCls = Nothing
        Catch ex As Exception
            writeResult = "{ ""responseResult"": ""Failed"", ""errorCode"": """ + ex.Message.ToString().Replace(vbCr, "\\r").Replace(vbLf, "\\n").Trim() + """ }"
            HttpContext.Current.Response.ContentType = "application/json"
            HttpContext.Current.Response.Write(writeResult)
        End Try
    End Sub

    Public Sub selectData(ByVal json As String)
        Dim writeResult As String = ""
        Try
            Dim jss = New JavaScriptSerializer()
            Dim sData As Dictionary(Of String, Object) = jss.Deserialize(Of Dictionary(Of String, Object))(json)
            Dim prmsExist As Object = sData("paramsPrinceGrid")

            Dim tblResults As New DataTable()
            Dim connectionString As String = System.Configuration.ConfigurationManager.ConnectionStrings(sData("connection").ToString()).ConnectionString

            Dim paramsFoundSQL As String = ""
            Using dbConnection As New SqlConnection(connectionString)

                dbConnection.Open()
                'create command object
                Dim dbCommand As New SqlCommand()
                dbCommand = New SqlCommand(sData("StoredProc").ToString(), dbConnection)
                'set command object to stored procedure
                dbCommand.CommandType = CommandType.StoredProcedure

                ' add parameter to command
                If prmsExist IsNot Nothing Then
                    Dim iteratePrms As Dictionary(Of String, Object) = DirectCast(sData("paramsPrinceGrid"), Dictionary(Of String, Object))


                    For Each item As KeyValuePair(Of String, Object) In iteratePrms
                        dbCommand.Parameters.Add(New SqlParameter(HttpUtility.HtmlDecode(item.Key.ToString()), HttpUtility.HtmlDecode(item.Value.ToString())))
                        paramsFoundSQL = paramsFoundSQL & "|" & HttpUtility.HtmlDecode(item.Key.ToString()) & " = " & HttpUtility.HtmlDecode(item.Value.ToString()) & "|"
                    Next
                End If

                Dim adapter As New SqlDataAdapter(dbCommand)

                adapter.Fill(tblResults)
            End Using

            If tblResults.Rows.Count > 0 Then
                Dim colsx = New List(Of [Object])()
                For i As Integer = 0 To tblResults.Columns.Count - 1
                    Dim colData = New Dictionary(Of String, Object)()
                    colData("col_" & i) = tblResults.Columns(i).ColumnName.ToString()
                    colsx.Add(colData)
                Next
                Dim ColsX2 As String = jss.Serialize(New With {Key .headder = colsx})
                ColsX2 = ColsX2.Substring(1)
                ColsX2 = ColsX2.Substring(0, ColsX2.Length - 1) & ","

                Dim rowsx = New List(Of [Object])()
                Dim rowData = New Dictionary(Of String, Object)()
                For i As Integer = 0 To tblResults.Rows.Count - 1
                    For j As Integer = 0 To tblResults.Columns.Count - 1
                        rowData("row_" & i & "_" & j) = tblResults.Rows(i)(j).ToString()
                    Next
                    rowsx.Add(rowData)
                Next
                Dim RowsX2 As String = jss.Serialize(New With {Key .rows = rowsx})
                RowsX2 = RowsX2.Substring(1)

                Dim sb As New System.Text.StringBuilder()
                sb.Append("{ ""responseResult"": ""Good"", ""RowCount"": """ & tblResults.Rows.Count.ToString() & """, ""ColCount"": """ & tblResults.Columns.Count.ToString() & """,")

                sb.Append(ColsX2)
                sb.Append(RowsX2)

                writeResult = sb.ToString()
            Else
                writeResult = "{ ""responseResult"": ""NoData"", ""params"": """ & paramsFoundSQL & """ }"
            End If
        Catch ex As Exception
            writeResult = "{ ""responseResult"": ""Failed"", ""errorCode"": """ & ex.Message.ToString().Replace(vbCr, "\\r").Replace(vbLf, "\\n").Trim() & """ }"
        End Try

        HttpContext.Current.Response.ContentType = "application/json"
        HttpContext.Current.Response.Write(writeResult)
    End Sub

    Public Sub saveChanges(ByVal json As String)
        Dim writeResult As String = ""
        Try
            Dim jss = New JavaScriptSerializer()
            Dim sData As Dictionary(Of String, Object) = jss.Deserialize(Of Dictionary(Of String, Object))(json)
            Dim prmsExist As Object = sData("paramsPrinceGrid")

            Dim connectionString As String = System.Configuration.ConfigurationManager.ConnectionStrings(sData("connection").ToString()).ConnectionString
            Dim paramsFoundSQL As String = ""
            Using dbConnection As New SqlConnection(connectionString)
                Using cmd As New SqlCommand(sData("StoredProc").ToString(), dbConnection)
                    cmd.CommandType = CommandType.StoredProcedure

                    If prmsExist IsNot Nothing Then
                        Dim iteratePrms As Dictionary(Of String, Object) = DirectCast(sData("paramsPrinceGrid"), Dictionary(Of String, Object))

                        For Each item As KeyValuePair(Of String, Object) In iteratePrms
                            cmd.Parameters.Add(New SqlParameter(HttpUtility.HtmlDecode(item.Key.ToString()), HttpUtility.HtmlDecode(item.Value.ToString())))
                            paramsFoundSQL = paramsFoundSQL & "|" & HttpUtility.HtmlDecode(item.Key.ToString()) & " = " & HttpUtility.HtmlDecode(item.Value.ToString()) & "|"
                        Next
                    End If

                    dbConnection.Open()
                    cmd.ExecuteNonQuery()
                End Using
            End Using

            writeResult = "{ ""responseResult"": ""Good"" }"
        Catch ex As Exception
            writeResult = "{ ""responseResult"": ""Failed"", ""errorCode"": """ & ex.Message.ToString().Replace(vbCr, "\\r").Replace(vbLf, "\\n").Trim() & """ }"
        End Try

        HttpContext.Current.Response.ContentType = "application/json"
        HttpContext.Current.Response.Write(writeResult)
    End Sub


    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class